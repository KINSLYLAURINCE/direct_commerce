const db = require('../config/database');
const { cloudinary } = require('../config/cloudinary');

// Helper: extract Cloudinary public_id from URL to delete it
const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const folder = parts[parts.length - 2];
  const filename = parts[parts.length - 1].split('.')[0];
  return `${folder}/${filename}`;
};

const getProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description_title,
      description,
      price,
      sold_price,
      tag,
      category_id
    } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const categoryCheck = await db.query(
      'SELECT id, name FROM categories WHERE id = $1',
      [category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // ✅ Cloudinary returns full URL in req.file.path
    const main_image = req.files?.main_image
      ? req.files.main_image[0].path
      : null;

    const sub_images = req.files?.sub_images
      ? req.files.sub_images.map(file => file.path)
      : [];

    const result = await db.query(
      `INSERT INTO products (name, description_title, description, price, sold_price, tag, category_id, main_image, sub_images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, description_title, description, price, sold_price || null, tag, category_id, main_image, JSON.stringify(sub_images)]
    );

    const newProduct = result.rows[0];
    newProduct.category_name = categoryCheck.rows[0].name;

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description_title,
      description,
      price,
      sold_price,
      tag,
      category_id
    } = req.body;

    const existingProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentProduct = existingProduct.rows[0];

    let categoryName = null;
    if (category_id) {
      const categoryCheck = await db.query(
        'SELECT id, name FROM categories WHERE id = $1',
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Category not found' });
      }
      categoryName = categoryCheck.rows[0].name;
    }

    let main_image = currentProduct.main_image;
    let sub_images = currentProduct.sub_images || [];

    // ✅ If new main image uploaded, delete old one from Cloudinary
    if (req.files?.main_image) {
      if (main_image) {
        const publicId = getPublicId(main_image);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      main_image = req.files.main_image[0].path;
    }

    // ✅ If new sub images uploaded, delete old ones from Cloudinary
    if (req.files?.sub_images) {
      if (sub_images && Array.isArray(sub_images)) {
        for (const imgUrl of sub_images) {
          const publicId = getPublicId(imgUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      }
      sub_images = req.files.sub_images.map(file => file.path);
    }

    const updatedName = name !== undefined ? name : currentProduct.name;
    const updatedDescriptionTitle = description_title !== undefined ? description_title : currentProduct.description_title;
    const updatedDescription = description !== undefined ? description : currentProduct.description;
    const updatedPrice = price !== undefined ? price : currentProduct.price;
    const updatedSoldPrice = sold_price !== undefined ? sold_price : currentProduct.sold_price;
    const updatedTag = tag !== undefined ? tag : currentProduct.tag;
    const updatedCategoryId = category_id !== undefined ? category_id : currentProduct.category_id;

    const result = await db.query(
      `UPDATE products 
       SET name = $1, description_title = $2, description = $3, price = $4, sold_price = $5, tag = $6, category_id = $7, main_image = $8, sub_images = $9
       WHERE id = $10 
       RETURNING *`,
      [updatedName, updatedDescriptionTitle, updatedDescription, updatedPrice, updatedSoldPrice, updatedTag, updatedCategoryId, main_image, JSON.stringify(sub_images), id]
    );

    const updatedProduct = result.rows[0];
    if (updatedCategoryId) {
      if (categoryName) {
        updatedProduct.category_name = categoryName;
      } else {
        const categoryResult = await db.query(
          'SELECT name FROM categories WHERE id = $1',
          [updatedCategoryId]
        );
        updatedProduct.category_name = categoryResult.rows[0]?.name;
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.query(
      'SELECT main_image, sub_images FROM products WHERE id = $1',
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ✅ Delete main image from Cloudinary
    if (product.rows[0].main_image) {
      const publicId = getPublicId(product.rows[0].main_image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // ✅ Delete sub images from Cloudinary
    if (product.rows[0].sub_images && Array.isArray(product.rows[0].sub_images)) {
      for (const imgUrl of product.rows[0].sub_images) {
        const publicId = getPublicId(imgUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
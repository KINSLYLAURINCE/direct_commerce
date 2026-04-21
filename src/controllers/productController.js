const db = require('../config/database');
const fs = require('fs');

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
    
    // ✅ VALIDATION: Vérifier que category_id est fourni
    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    // ✅ VALIDATION: Vérifier que la catégorie existe
    const categoryCheck = await db.query(
      'SELECT id, name FROM categories WHERE id = $1',
      [category_id]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    const main_image = req.files?.main_image 
      ? `/uploads/products/main/${req.files.main_image[0].filename}` 
      : null;
    
    const sub_images = req.files?.sub_images 
      ? req.files.sub_images.map(file => `/uploads/products/sub/${file.filename}`)
      : [];
    
    const result = await db.query(
      `INSERT INTO products (name, description_title, description, price, sold_price, tag, category_id, main_image, sub_images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, description_title, description, price, sold_price || null, tag, category_id, main_image, JSON.stringify(sub_images)]
    );
    
    // ✅ Retourner le produit avec category_name
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
    
    // ✅ VALIDATION: Vérifier la catégorie si elle est modifiée
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
    
    if (req.files?.main_image) {
      if (main_image) {
        const oldImagePath = '.' + main_image;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      main_image = `/uploads/products/main/${req.files.main_image[0].filename}`;
    }
    
    if (req.files?.sub_images) {
      if (sub_images && Array.isArray(sub_images)) {
        sub_images.forEach(imagePath => {
          const oldImagePath = '.' + imagePath;
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });
      }
      sub_images = req.files.sub_images.map(file => `/uploads/products/sub/${file.filename}`);
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
    
    // ✅ Retourner le produit avec category_name
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
    
    if (product.rows[0].main_image) {
      const imagePath = '.' + product.rows[0].main_image;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (product.rows[0].sub_images && Array.isArray(product.rows[0].sub_images)) {
      product.rows[0].sub_images.forEach(imagePath => {
        const oldImagePath = '.' + imagePath;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      });
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
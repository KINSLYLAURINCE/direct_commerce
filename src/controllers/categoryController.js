const db = require('../config/database');
const { cloudinary } = require('../config/cloudinary');

const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const folder = parts[parts.length - 2];
  const filename = parts[parts.length - 1].split('.')[0];
  return `${folder}/${filename}`;
};

const getCategories = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM categories ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // ✅ Cloudinary URL stored directly
    const image = req.file ? req.file.path : null;

    const existingCategory = await db.query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const result = await db.query(
      `INSERT INTO categories (name, description, image) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingCategory = await db.query(
      'SELECT image FROM categories WHERE id = $1',
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let image = existingCategory.rows[0]?.image;

    if (req.file) {
      // ✅ Delete old image from Cloudinary
      if (image) {
        const publicId = getPublicId(image);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      // ✅ Use new Cloudinary URL
      image = req.file.path;
    }

    const result = await db.query(
      `UPDATE categories 
       SET name = $1, description = $2, image = $3
       WHERE id = $4 
       RETURNING *`,
      [name, description, image, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db.query(
      'SELECT image FROM categories WHERE id = $1',
      [id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // ✅ Delete image from Cloudinary
    if (category.rows[0]?.image) {
      const publicId = getPublicId(category.rows[0].image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    await db.query('DELETE FROM categories WHERE id = $1', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
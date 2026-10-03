const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Images live on local disk. Delete the file matching a stored /uploads/... path.
const deleteLocalImage = async (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== 'string') return;
  if (!publicUrl.startsWith('/uploads/')) return;
  const abs = path.join(UPLOAD_ROOT, publicUrl.replace('/uploads/', ''));
  try {
    await fs.promises.unlink(abs);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not delete image:', err.message);
  }
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

// multer disk storage gives an absolute path; store the public URL
    const image = req.file ? `/uploads/categories/${path.basename(req.file.path)}` : null;

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
      await deleteLocalImage(image);
      image = `/uploads/categories/${path.basename(req.file.path)}`;
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

    // Delete image file from local disk
    await deleteLocalImage(category.rows[0]?.image);

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
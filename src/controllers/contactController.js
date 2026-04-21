const db = require('../config/database');

const createContactMessage = async (req, res) => {
  try {
    const { name, surname, email, phone_number, message } = req.body;

    const result = await db.query(
      `INSERT INTO contact_messages (name, surname, email, phone_number, message) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, surname, email, phone_number, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM contact_messages WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM contact_messages WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  deleteContactMessage
};
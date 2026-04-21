const db = require('../config/database');

const createWhatsappInquiry = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      phone_number,
      country_code,
      country,
      town,
      address,
      product_id
    } = req.body;

    const productResult = await db.query(
      'SELECT name, price FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    const result = await db.query(
      `INSERT INTO whatsapp_inquiries 
       (name, surname, email, phone_number, country_code, country, town, address, product_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, surname, email, phone_number, country_code, country, town, address, product_id]
    );

    const whatsappNumber = process.env.WHATSAPP_NUMBER || '237000000000';
    
    const message = `*New Order Inquiry*%0A%0A` +
      `*Product:* ${product.name}%0A` +
      `*Price:* $${product.price}%0A%0A` +
      `*Customer Details:*%0A` +
      `Name: ${name} ${surname}%0A` +
      `Email: ${email}%0A` +
      `Phone: ${country_code} ${phone_number}%0A` +
      `Country: ${country}%0A` +
      `Town: ${town}%0A` +
      `Address: ${address}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    res.status(201).json({
      inquiry: result.rows[0],
      whatsapp_url: whatsappUrl
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInquiries = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT wi.*, p.name as product_name, p.price as product_price 
       FROM whatsapp_inquiries wi 
       LEFT JOIN products p ON wi.product_id = p.id 
       ORDER BY wi.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT wi.*, p.name as product_name, p.price as product_price, p.main_image as product_image 
       FROM whatsapp_inquiries wi 
       LEFT JOIN products p ON wi.product_id = p.id 
       WHERE wi.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM whatsapp_inquiries WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createWhatsappInquiry,
  getInquiries,
  getInquiryById,
  deleteInquiry
};
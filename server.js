const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const createAdmin = require('./src/utils/createAdmin');
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createAdmin();
});
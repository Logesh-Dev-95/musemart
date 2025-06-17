// muse-mart-backend/src/index.js
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cron = require('node-cron');
const morgan = require('morgan'); // Import morgan for request logging

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json({ limit: '10mb' })); // Increase limit for image data
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For URL-encoded data, useful for forms

// Request Logging Middleware using morgan
app.use(morgan('dev')); // 'dev' is a concise, colorful format for development

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from your React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

// JWT Secret (Crucial: Use a strong, unique secret and ideally load from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_please_change_this_in_production';

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects 'Bearer TOKEN'

  if (token == null) {
    console.log(`[${new Date().toLocaleString()}] Auth Failed (401): No token provided for ${req.method} ${req.url}`);
    return res.sendStatus(401); // No token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`[${new Date().toLocaleString()}] Auth Failed (403): Invalid/Expired token for ${req.method} ${req.url}. Error: ${err.message}`);
      return res.sendStatus(403); // Token invalid or expired
    }
    req.user = user; // Attach user payload from token to request
    next();
  });
};

// --- Auth Routes ---

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
    });

    // Added user.name to JWT payload
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully!', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Added user.name to JWT payload
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Logged in successfully!', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// User Profile - requires authentication
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- Product Routes ---

// Add New Product - requires authentication and handles image uploads
app.post('/api/products', authenticateToken, async (req, res) => {
  const {
    productName,
    categoryId,
    subCategoryId,
    price,
    discount,
    images: base64Images, // Expecting an array of Base64 strings
    stock,
  } = req.body;

  if (!productName || !categoryId || !subCategoryId || !price) {
    return res.status(400).json({ message: 'Missing required product fields.' });
  }

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const subCategory = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });

    if (!category || !subCategory) {
      return res.status(400).json({ message: 'Invalid category or subcategory ID.' });
    }

    const parsedPrice = parseFloat(price);
    const parsedDiscount = parseFloat(discount) || 0;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ message: 'Discount must be a number between 0 and 100.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        productName,
        categoryId,
        categoryName: category.categoryName,
        subCategoryId,
        subCategoryName: subCategory.subCategoryName,
        price: parsedPrice,
        discount: parsedDiscount,
        productOwnerId: req.user.userId,
        productOwnerName: req.user.name,
        stock: stock || 'IN_STOCK',
        images: {
          create: base64Images.map((base64Image, index) => ({
            imageName: `product_${Date.now()}_${index}.png`, // Simple unique name
            blob: base64Image,
          })),
        },
      },
      include: {
        images: true, // Include created images in the response
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Products Posted by Authenticated User (My Products/Sell Page)
app.get('/api/my-products', authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { productOwnerId: req.user.userId },
      include: {
        category: true,
        subCategory: true,
        images: true, // Include associated images
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update Product (price, discount, stock, and potentially images) - requires authentication and ownership
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { price, discount, stock, images: newBase64Images } = req.body; // New images if any

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.productOwnerId !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this product.' });
    }

    const updateData = {};
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number.' });
      }
      updateData.price = parsedPrice;
    }
    if (discount !== undefined) {
      const parsedDiscount = parseFloat(discount);
      if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
        return res.status(400).json({ message: 'Discount must be a number between 0 and 100.' });
      }
      updateData.discount = parsedDiscount;
    }
    if (stock !== undefined) {
      if (!['IN_STOCK', 'OUT_OF_STOCK'].includes(stock)) {
        return res.status(400).json({ message: 'Invalid stock status.' });
      }
      updateData.stock = stock;
    }

    // Handle image updates: This example assumes you want to replace all images or add new ones.
    // A more sophisticated approach would allow deleting specific images or updating them.
    if (newBase64Images && Array.isArray(newBase64Images) && newBase64Images.length > 0) {
      // First, delete existing images for this product
      await prisma.image.deleteMany({
        where: { productId: id },
      });

      // Then, create new images
      updateData.images = {
        create: newBase64Images.map((base64Image, index) => ({
          imageName: `product_${id}_${Date.now()}_${index}.png`,
          blob: base64Image,
        })),
      };
    }


    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true, // Include updated images in the response
      }
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get All Products (for Home page - no authentication required)
app.get('/api/products', async (req, res) => {
  try {
    const { productName, categoryId, subCategoryId, minPrice, maxPrice, stock } = req.query;
    const where = {};

    if (productName) {
      where.productName = {
        contains: productName,
        mode: 'insensitive', // Case-insensitive search
      };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }
    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }
    if (stock) {
      where.stock = stock;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
        images: true, // Include associated images
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching all products with filters:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Single Product by ID (no authentication required)
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        images: true, // Include associated images
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- Order Routes ---



// Place an Order - requires authentication
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { productId, address, pincode, phoneNumber, paymentType } = req.body; // Added paymentType

  if (!productId || !address || !pincode || !phoneNumber || !paymentType) { // Added paymentType to validation
    return res.status(400).json({ message: 'Missing required order fields.' });
  }

  try {
    // Validate paymentType against your enum
    const validPaymentTypes = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'CASH_ON_DELIVERY', 'WALLET'];
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({ message: `Invalid payment type. Must be one of: ${validPaymentTypes.join(', ')}.` });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock === 'OUT_OF_STOCK') {
      return res.status(400).json({ message: 'Product is out of stock and cannot be ordered.' });
    }

    // Prevent users from buying their own products
    if (product.productOwnerId === req.user.userId) {
      return res.status(403).json({ message: 'You cannot place an order for your own product.' });
    }

    const order = await prisma.order.create({
      data: {
        productId,
        buyerId: req.user.userId,
        buyerName: req.user.name,
        address,
        pincode,
        phoneNumber,
        status: 'PENDING',
        paymentType, // Added paymentType here
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Orders Placed by Authenticated User (My Orders Page)
app.get('/api/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.userId },
      include: {
        product: {
          select: {
            productName: true,
            price: true,
            discount: true,
            images: true, // Include associated images
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Orders Received by Authenticated User (for their products)
app.get('/api/received-orders', authenticateToken, async (req, res) => {
  try {
    const receivedOrders = await prisma.order.findMany({
      where: {
        product: {
          productOwnerId: req.user.userId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            price: true,
            discount: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(receivedOrders);
  } catch (error) {
    console.error('Error fetching received orders:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update Order Status - requires authentication and ownership of the product
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Missing status field.' });
  }

  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            productOwnerId: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.product.productOwnerId !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this order status.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- Category & Subcategory Routes ---

// Get All Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: {
        categoryName: 'asc',
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Subcategories by Category ID
app.get('/api/categories/:categoryId/subcategories', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: {
        subCategoryName: 'asc',
      },
    });
    res.status(200).json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


//--- cron scheduler ---

cron.schedule('0 * * * *', async () => { // this line of code is to check the scheduler will run every hour
// cron.schedule('*/1 * * * *', async () => { // just for testing this line will run for every 1 minute

  console.log('⏰ Running hourly cron job to cancel old pending orders...');

  // const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago for testing
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  try {
    const result = await prisma.order.updateMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: twentyFourHoursAgo, 
        },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log(`✅ Cancelled ${result.count} old pending orders.`);
  } catch (error) {
    console.error('❌ Error updating orders in cron job:', error);
  }
});

// --- Root Endpoint ---
app.get('/', (req, res) => {
  res.send('Welcome to Muse Mart Backend API!');
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
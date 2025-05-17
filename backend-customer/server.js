import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerAuthRoutes from './routes/customerAuthRoutes.js'; 
import customerProductRoutes from './routes/customerProductRoutes.js';
import wishListsRoutes from './routes/wishListsRouter.js';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import db from './config/db.js'; 
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express(); // Initialize the app here

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Change this to match your frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions)); // Use CORS after initializing the app

// Middleware
app.use(express.json());

// Middleware to attach database connection
app.use((req, res, next) => {
  req.db = db; // Attach MySQL connection pool to req.db
  console.log("Database connection status:", req.db ? "Connected" : "Not Connected");
  next();
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test database connection
(async () => {
  try {
    const connection = await db.getConnection(); // Use db instead of pool
    console.log('Connected to MySQL');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

// Routes
// Use the customer auth routes
app.use('/api/customers', customerAuthRoutes); 

// Use the customer product routes
app.use('/api', customerProductRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Customer Backend API is running...');
});

// Use the wishlist routes
app.use('/api/wishlist', wishListsRoutes);

// customer route
app.use('/api/user', customerRoutes);

// order route
app.use('/api/order', orderRoutes);

// payment route
app.use('/api/payment', paymentRoutes);

// Start the server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default cloudinary;
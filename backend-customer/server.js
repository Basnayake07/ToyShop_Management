import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerAuthRoutes from './routes/customerAuthRoutes.js'; 
import pool from './config/db.js'; 

dotenv.config();

const app = express(); // Initialize the app here

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Change this to match your frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Fix capitalization of "Credentials" to "credentials"
};
app.use(cors(corsOptions)); // Use CORS after initializing the app

// Middleware
app.use(express.json());

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

// Routes
app.use('/api/customers', customerAuthRoutes); // Use the customer auth routes

// Default route
app.get('/', (req, res) => {
  res.send('Customer Backend API is running...');
});

// Start the server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


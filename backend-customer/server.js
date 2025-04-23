import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerAuthRoutes from './routes/customerAuthRoutes.js'; // Import the customer auth routes
import pool from './config/db.js'; // Ensure the database connection is imported

dotenv.config();

const app = express();

// Middleware
app.use(cors());
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


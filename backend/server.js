import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';  
import supplierRoutes from './routes/supplierRoute.js'; 
import orderRoutes from './routes/orderRoutes.js'; 
import supplierLoginRoutes from './routes/supplierLoginRoute.js';
import invoiceRoutes from "./routes/invoiceRoutes.js";
import returnsRoutes from "./routes/returnsRoutes.js"; 
import dashboardRoutes from "./routes/dashboardRoutes.js";
import db from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3001", 
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  Credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// Handle the POST request for signup
app.post('/signup', async (req, res) => {
  const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?, ?, ?)";
  console.log("Received Data:", req.body); // Check if data is received
  const values = [
    req.body.name,
    req.body.email,
    req.body.password
  ];

  try {
    const [result] = await db.query(sql, values);
    console.log('User created successfully:', result);
    return res.status(200).json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error('Error during database insertion:', err);
    return res.status(500).json({ message: 'Error creating account' });
  }
});



// Middleware to attach database connection
app.use((req, res, next) => {
  req.db = db; // Attach MySQL connection pool to req.db
  console.log("Database connection status:", req.db ? "Connected" : "Not Connected");
  next();
});

// Handle the POST request for products
app.use('/api', productRoutes);

// Register auth routes
app.use('/api/auth', authRoutes); 

// Handle the inventory routes
app.use('/api/inventory', inventoryRoutes);

//Handle the customer request
app.use('/api/customers', customerRoutes);

// Login route
//app.use('/api/login', authRoutes);

// Handle the supplier routes
app.use('/api', supplierRoutes);

// Handle the order routes
app.use('/api', orderRoutes);

// Supplier-End login routes
app.use('/api/supplier-auth', supplierLoginRoutes);

// Handle the invoice routes
app.use("/api/invoices", invoiceRoutes);

// Handle the returns routes
app.use("/api", returnsRoutes);

// Register the dashboard routes
app.use("/api", dashboardRoutes);

app.listen(8081, () => {
  console.log('listening on port 8081');
});
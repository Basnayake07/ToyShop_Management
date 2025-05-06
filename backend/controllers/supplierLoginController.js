import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; // Ensure this points to your database connection
import dotenv from 'dotenv';
dotenv.config();

export const loginSupplier = async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  try {
    // Query the supplier table to find the supplier by email
    const query = 'SELECT * FROM supplier WHERE email = ?';
    const [rows] = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const supplier = rows[0]; // Get the first matching supplier

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, supplier.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        suppID: supplier.suppID,
        name: supplier.name,
        email: supplier.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(200).json({ message: 'Login successful', token, suppID: supplier.suppID });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

  export const getSupplierPurchaseOrders = async (req, res) => {
    const { suppID } = req.params;
  
    try {
      const query = `
        SELECT po.purchaseID, po.purchaseDate, po.total, po.status, po.comments, po.feedback, po.suppID
        FROM purchaseOrder po
        WHERE po.suppID = ?
      `;
      const [orders] = await req.db.execute(query, [suppID]);
  
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching supplier purchase orders:", error);
      res.status(500).json({ message: "Error fetching purchase orders", error });
    }
  }

  export const updatePurchaseOrder = async (req, res) => {
    const { purchaseID } = req.params;
    const { status, comments } = req.body;
  
    try {
      const query = `
        UPDATE purchaseOrder
        SET status = ?, comments = ?
        WHERE purchaseID = ?
      `;
      await req.db.execute(query, [status, comments, purchaseID]);
  
      res.status(200).json({ message: "Purchase order updated successfully" });
    } catch (error) {
      console.error("Error updating purchase order:", error);
      res.status(500).json({ message: "Error updating purchase order", error });
    }
  };

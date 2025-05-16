import pool from "../config/db.js"; 
import bcrypt from 'bcryptjs';

// Fetch customer details (including phone numbers)
export const getCustomerDetails = async (req, res) => {
  const cusID = req.user.cusID; // Extract cusID from JWT

  try {
    // Fetch customer basic info
    const [customerRows] = await pool.query(
      'SELECT cusID, name, email, cusType FROM customer WHERE cusID = ?',
      [cusID]
    );
    if (customerRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Fetch phone numbers
    const [phoneRows] = await pool.query(
      'SELECT phoneNumber FROM cus_phone WHERE cusID = ?',
      [cusID]
    );

    const customer = customerRows[0];
    customer.phoneNumbers = phoneRows.map(row => row.phoneNumber);

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update customer details (name, email, cusType, phone numbers)
export const updateCustomerDetails = async (req, res) => {
  const cusID = req.user.cusID;
  const { name, email, cusType, phoneNumbers } = req.body;

  try {
    if (!name || !email || !cusType) {
      return res.status(400).json({ message: 'Name, email, and cusType are required' });
    }

    // Update customer basic info
    await pool.query(
      'UPDATE customer SET name = ?, email = ?, cusType = ? WHERE cusID = ?',
      [name, email, cusType, cusID]
    );

    // Update phone numbers: remove old, insert new
    await pool.query('DELETE FROM cus_phone WHERE cusID = ?', [cusID]);
    if (Array.isArray(phoneNumbers)) {
      for (const phone of phoneNumbers) {
        await pool.query(
          'INSERT INTO cus_phone (cusID, phoneNumber) VALUES (?, ?)',
          [cusID, phone]
        );
      }
    }

    res.status(200).json({ message: 'Customer details updated successfully' });
  } catch (error) {
    console.error('Error updating customer details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const cusID = req.user.cusID;
  const { currentPassword, newPassword } = req.body;

  try {
    // Fetch current password hash
    const [rows] = await pool.query(
      'SELECT password FROM customer WHERE cusID = ?',
      [cusID]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE customer SET password = ? WHERE cusID = ?',
      [hashedPassword, cusID]
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all orders for a specific customer (with items)
export const getCustomerOrders = async (req, res) => {
  const cusID = req.user.cusID; // from JWT

  try {
    // Get all orders for this customer
    const [orders] = await pool.query(
      'SELECT orderID, orderDate, totalPrice, payStatus FROM orders WHERE cusID = ? ORDER BY orderDate DESC',
      [cusID]
    );

    // For each order, get its items and product info
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.orderItemID, oi.productID, p.name AS productName, p.image, oi.quantity, oi.price
         FROM orderItems oi
         JOIN product p ON oi.productID = p.productID
         WHERE oi.orderID = ?`,
        [order.orderID]
      );
      order.items = items;
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add or update a review for a product
export const addOrUpdateReview = async (req, res) => {
  const cusID = req.user.cusID;
  const { productID, customerRating, comment } = req.body;

  try {
    // Check if review exists
    const [existing] = await pool.query(
      'SELECT reviewID FROM product_review WHERE productID = ? AND cusID = ?',
      [productID, cusID]
    );

    if (existing.length > 0) {
      // Update review
      await pool.query(
        'UPDATE product_review SET customerRating = ?, comment = ?, createdAt = CURRENT_TIMESTAMP WHERE reviewID = ?',
        [customerRating, comment, existing[0].reviewID]
      );
      res.status(200).json({ message: 'Review updated successfully' });
    } else {
      // Insert new review
      await pool.query(
        'INSERT INTO product_review (productID, cusID, customerRating, comment) VALUES (?, ?, ?, ?)',
        [productID, cusID, customerRating, comment]
      );
      res.status(201).json({ message: 'Review added successfully' });
    }
  } catch (error) {
    console.error('Error adding/updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
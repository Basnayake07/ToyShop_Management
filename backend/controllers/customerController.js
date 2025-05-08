import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; 
import dotenv from 'dotenv';
dotenv.config();



// Fetch All Customers Without Passwords
export const getAllCustomers = async (req, res) => {
  try {
      const query = `
          SELECT c.cusID, c.name, c.email, c.cusType, 
                 GROUP_CONCAT(cp.phoneNumber) AS phoneNumbers
          FROM customer c
          LEFT JOIN cus_phone cp ON c.cusID = cp.cusID
          GROUP BY c.cusID;
      `;

      const [customers] = await pool.query(query);
      return res.status(200).json(customers);
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error" });
  }
};



// Register Customer from Admin/Employee Side
export const registerCustomerByAdmin = async (req, res) => {
    const { name, email, cusType, phoneNumbers, adminID } = req.body;
  
    // Check if all required fields are provided
    if (!name || !email || !cusType || !phoneNumbers) {
      return res.status(400).json({ message: "All fields are required!" });
    }
  
    // Verify admin or employee authentication
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }
  
    try {
      // Extract token after "Bearer "
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  
      if (decoded.role !== "admin" && decoded.role !== "employee") {
        return res.status(403).json({
          message: "Access denied. Only admins or employees can register customers.",
        });
      }
  
      // Find the next cusID
      const getLastIDQuery =
        "SELECT MAX(CAST(SUBSTRING(cusID, 3) AS UNSIGNED)) AS lastID FROM customer";
      const [result] = await pool.query(getLastIDQuery);
      const lastID = result[0].lastID || 0; // If no ID exists, start from 0
      const nextID = `CS${lastID + 1}`;
  
      // Set password as NULL since admin/employee is registering on behalf of the customer
      const insertCustomerQuery =
        "INSERT INTO customer (cusID, name, email, cusType, adminID, password) VALUES (?, ?, ?, ?, ?, NULL)";
      await pool.query(insertCustomerQuery, [
        nextID,
        name,
        email,
        cusType,
        adminID,
      ]);

      const phoneNumbersArray = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

      // If no phone numbers are provided, return success
      if (!phoneNumbers.length) {
        return res.status(200).json({ message: "Customer registered successfully" });
      }
  
      const insertPhoneQuery =
        "INSERT INTO cus_phone (cusID, phoneNumber) VALUES (?, ?)";
  
      await Promise.all(
        phoneNumbersArray.map((phoneNumber) =>
          pool.query(insertPhoneQuery, [nextID, phoneNumber])
        )
      );
  
      return res.status(200).json({ message: "Customer registered successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  // Delete Customer
export const deleteCustomer = async (req, res) => {
    const { cusID } = req.body;
  
    // Verify admin authentication
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }
  
    try {
      // Extract token after "Bearer "
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  
      if (decoded.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Only admins can delete customers.",
        });
      }
  
      // Delete customer from customer table
      const deleteCustomerQuery = "DELETE FROM customer WHERE cusID = ?";
      await pool.query(deleteCustomerQuery, [cusID]);
  
      // Delete customer's phone numbers from cus_phone table
      const deletePhoneQuery = "DELETE FROM cus_phone WHERE cusID = ?";
      await pool.query(deletePhoneQuery, [cusID]);
  
      return res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  // update customer details
export const updateCustomer = async (req, res) => {
    const { cusID, name, email, phoneNumbers, cusType } = req.body;
  
    // Check if all required fields are provided
    if (!cusID || !name || !email || !cusType || !phoneNumbers) {
      return res.status(400).json({ message: "All fields are required!" });
    }
  
    // Verify admin authentication
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }
  
    try {
      // Extract token after "Bearer "
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
  
      if (decoded.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Only admins can update customers.",
        });
      }
  
      // Update customer details in the customer table
      const updateCustomerQuery =
        "UPDATE customer SET name = ?, email = ?, cusType = ? WHERE cusID = ?";
      await pool.query(updateCustomerQuery, [name, email, cusType, cusID]);
  
      // Delete existing phone numbers for the customer
      const deletePhoneQuery = "DELETE FROM cus_phone WHERE cusID = ?";
      await pool.query(deletePhoneQuery, [cusID]);
  
      // Insert new phone numbers for the customer
      const insertPhoneQuery =
        "INSERT INTO cus_phone (cusID, phoneNumber) VALUES (?, ?)";
  
      await Promise.all(
        phoneNumbers.map((phoneNumber) =>
          pool.query(insertPhoneQuery, [cusID, phoneNumber])
        )
      );
  
      return res.status(200).json({ message: "Customer updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }

    
  };

  export const getCustomerByName = async (req, res) => {
    const { name } = req.query;
  
    try {
      const [customer] = await db.execute(
        `SELECT cusID FROM customer WHERE name = ?`,
        [name]
      );
  
      if (customer.length === 0) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      res.status(200).json(customer[0]);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ message: "Error fetching customer details", error });
    }
  };


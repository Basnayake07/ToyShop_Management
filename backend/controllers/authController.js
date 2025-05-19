import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; 
import dotenv from 'dotenv';
dotenv.config();

// Register Employee
export const registerEmp = async (req, res) => {
    const { adminID, name, address, email, phoneNumbers, role, password } = req.body;
  
    // Check if all fields are provided
    if ( !name || !address || !email || !phoneNumbers || !role || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
  
    // Verify admin authentication
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      // Extract token after "Bearer "
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can register employees.' });
      }
  

      // Find the next adminID
      const getLastIDQuery = "SELECT MAX(CAST(SUBSTRING(adminID, 3) AS UNSIGNED)) AS lastID FROM admin";
      const [result] = await pool.query(getLastIDQuery);
      const lastID = result[0].lastID || 0; // If no ID exists, start from 0
      const nextID = `EM${lastID + 1}`;


      // Hash the password 
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const insertAdminQuery = 'INSERT INTO admin (adminID, name, address, email, role, password) VALUES (?, ?, ?, ?, ?, ?)';
      await pool.query(insertAdminQuery, [nextID, name, address, email, role, hashedPassword]);
  
      // If no phone numbers are provided, return success
      if (!phoneNumbers.length) {
        return res.status(200).json({ message: 'Employee registered successfully' });
      }
  
      const insertPhoneQuery = 'INSERT INTO emp_phone (adminID, phoneNumber) VALUES (?, ?)';
      
      await Promise.all(phoneNumbers.map(phoneNumber => 
        pool.query(insertPhoneQuery, [nextID, phoneNumber])
      ));
  
      return res.status(200).json({ message: 'Employee registered successfully' });
  
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  
  // User Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }

    try {
        // Check if database connection is working
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Database connection error:", err);
                return res.status(500).json({ message: "Database connection error" });
            }
            connection.release();
        });

        // Remove the role filter so both admin and employee can login
        const sql = 'SELECT * FROM admin WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with role
        const token = jwt.sign(
            {
                adminID: user.adminID,
                name: user.name,
                role: user.role // will be 'admin' or 'employee'
            },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        res.status(200).json({ message: 'Login successful', token, adminID: user.adminID, role: user.role });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }   
};

// Fetch All Users (Admin & Employees) Without Passwords
export const getAllUsers = async (req, res) => {
  try {
      const query = `
          SELECT a.adminID, a.name, a.address, a.email, a.role, 
                 GROUP_CONCAT(e.phoneNumber) AS phoneNumbers
          FROM admin a
          LEFT JOIN emp_phone e ON a.adminID = e.adminID
          GROUP BY a.adminID;
      `;

      const [users] = await pool.query(query);
      return res.status(200).json(users);
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error" });
  }
};


// Delete Employee
export const deleteEmployees = async (req, res) => {
  const { adminID } = req.body;

  if (!adminID|| adminID.trim() === "") {
      return res.status(400).json({ message: "No employee selected" });
  }

  try {
    //const placeholders = adminID.map(() => "?").join(",");
    const query = `DELETE FROM admin WHERE adminID = ?`;
    await pool.query(query, [adminID]);

    return res.status(200).json({ message: "Employee(s) deleted successfully" });
  }
  catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error" });
  }
};


// Update Employee
// Update Employee Address and Phone Numbers
export const updateEmployee = async (req, res) => {
  const { adminID, address, phoneNumbers } = req.body;

  if (!adminID || !address || !phoneNumbers) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Ensure phoneNumbers is an array
    const phoneNumbersArray = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

    // Update address
    const updateAddressQuery = `UPDATE admin SET address = ? WHERE adminID = ?`;
    await pool.query(updateAddressQuery, [address, adminID]);

    // Delete existing phone numbers
    const deletePhoneNumbersQuery = `DELETE FROM emp_phone WHERE adminID = ?`;
    await pool.query(deletePhoneNumbersQuery, [adminID]);

    // Insert new phone numbers
    const insertPhoneQuery = `INSERT INTO emp_phone (adminID, phoneNumber) VALUES (?, ?)`;
    await Promise.all(phoneNumbersArray.map(phoneNumber => 
      pool.query(insertPhoneQuery, [adminID, phoneNumber])
    ));

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
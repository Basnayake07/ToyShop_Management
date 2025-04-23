import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const verificationCodes = {};


export const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  try {
    // Query the database for the customer with the provided email
    const sql = 'SELECT * FROM customer WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const customer = rows[0]; // Get the first matching customer

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        cusID: customer.cusID,
        name: customer.name,
        cusType: customer.cusType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(200).json({ message: 'Login successful', token, cusID: customer.cusID });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const signupCustomer = async (req, res) => {
    const { name, email, password, cusType, phoneNumbers } = req.body;
  
    // Validate input data
    if (!name || !email || !password || !cusType || !phoneNumbers) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
  
    try {
      // Check if the email is already registered
      const emailCheckQuery = 'SELECT * FROM customer WHERE email = ?';
      const [existingCustomer] = await pool.query(emailCheckQuery, [email]);
  
      if (existingCustomer.length > 0) {
        return res.status(400).json({ message: 'Email is already registered!' });
      }
  
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      verificationCodes[email] = otp; // Store the OTP temporarily
  
      // Send the OTP to the customer's email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Registration',
        text: `Your OTP for registration is: ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending OTP email' });
        }
  
        res.status(200).json({ success: true, message: 'OTP sent to your email' });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  export const verifyOtpAndRegisterCustomer = async (req, res) => {
    const { name, email, password, cusType, phoneNumbers, otp } = req.body;
  
    // Validate input data
    if (!name || !email || !password || !cusType || !phoneNumbers || !otp) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
  
    try {
      // Check if the OTP matches
      if (verificationCodes[email] && verificationCodes[email] === parseInt(otp)) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Generate a new customer ID
        const getLastCusIDQuery = `
          SELECT MAX(CAST(SUBSTRING(cusID, 3) AS UNSIGNED)) AS lastID
          FROM customer
        `;
        const [result] = await pool.query(getLastCusIDQuery);
        const lastID = result[0].lastID || 0; // If no ID exists, start from 0
        const nextCusID = `CU${lastID + 1}`;
  
        // Insert the customer into the `customer` table
        const insertCustomerQuery = `
          INSERT INTO customer (cusID, name, email, password, cusType)
          VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(insertCustomerQuery, [nextCusID, name, email, hashedPassword, cusType]);
  
        // Insert phone numbers into the `cus_phone` table
        const insertPhoneQuery = 'INSERT INTO cus_phone (cusID, phoneNumber) VALUES (?, ?)';
        await Promise.all(
          phoneNumbers.map((phoneNumber) =>
            pool.query(insertPhoneQuery, [nextCusID, phoneNumber])
          )
        );
  
        // Remove the OTP after successful registration
        delete verificationCodes[email];
  
        res.status(201).json({ message: 'Customer registered successfully', cusID: nextCusID });
      } else {
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
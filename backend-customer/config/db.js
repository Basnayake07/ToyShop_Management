//const mysql = require('mysql2');
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();  // This should be called before accessing process.env


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect to MySQL
/* db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');
  }); */

  // Test the database connection (optional)
(async () => {
  try {
      const connection = await pool.getConnection();
      console.log('Connected to MySQL');
      connection.release(); // Release the connection back to the pool
  } catch (error) {
      console.error('Database connection error:', error);
  }
})();

  //module.exports = db;
  
export default pool;
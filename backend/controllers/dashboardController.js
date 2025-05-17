import pool from '../config/db.js'; 

// Get dashboard summary
export const getDashboardDetails = async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM customer) AS TotalCustomers,
        (SELECT COUNT(*) FROM product) AS TotalProducts,
        (SELECT COUNT(*) FROM orders WHERE payStatus = 'Pending') AS PendingOrders,
        (SELECT COUNT(*) FROM purchaseOrder WHERE status = 'Pending') AS PendingPurchaseOrders,
        (SELECT COUNT(*) FROM returnsRequest WHERE status = 'Requested') AS PendingReturnRequests,
        (SELECT SUM(totalPrice) FROM orders WHERE payStatus = 'Paid') AS TotalRevenue,
        (SELECT COUNT(*) FROM inventory WHERE quantity <= minStock) AS LowStockProducts
    `;
    const [result] = await pool.query(sql); // Use async/await with PromisePool
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sales chart data for past 7 days
export const getSalesChart = async (req, res) => {
  try {
    const sql = `
      WITH DateSeries AS (
        SELECT CURDATE() - INTERVAL n DAY AS Date
        FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
              SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS numbers
      )
      SELECT 
        ds.Date AS date, 
        COALESCE(SUM(o.totalPrice), 0) AS total
      FROM DateSeries ds
      LEFT JOIN orders o ON DATE(o.orderDate) = ds.Date AND o.payStatus = 'Paid'
      GROUP BY ds.Date
      ORDER BY ds.Date;
    `;
    const [result] = await pool.query(sql); // Use async/await with PromisePool
    res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* // Get low stock product list
export const getLowStockProducts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.productID, p.name, i.quantity, i.minStock
      FROM product p
      JOIN inventory i ON p.productID = i.productID
      WHERE i.quantity <= i.minStock
    `;
    const [result] = await pool.query(sql); // Use async/await with PromisePool
    res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; */

// Get low stock product count
export const getLowStockCount = async (req, res) => {
  try {
    const sql = `SELECT COUNT(*) AS lowStockCount FROM LowStockProducts`;
    const [result] = await pool.query(sql);
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

 // Get low stock product list
export const getLowStockProducts = async (req, res) => {
  try {
    const sql = `SELECT * FROM LowStockProducts`;
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Get all partially paid customers
export const getPartiallyPaidCustomers = async (req, res) => {
  try {
    const sql = `SELECT * FROM PartiallyPaidCustomers`;
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get count of partially paid customers
export const getPartiallyPaidCustomersCount = async (req, res) => {
  try {
    const sql = `SELECT COUNT(DISTINCT cusID) AS partiallyPaidCustomerCount FROM PartiallyPaidCustomers`;
    const [result] = await pool.query(sql);
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

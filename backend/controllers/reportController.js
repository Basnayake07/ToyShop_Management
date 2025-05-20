import pool from '../config/db.js';

// Fetch Inventory Report
export const getInventoryReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.productID,
        p.name AS productName,
        p.category,
        p.description,
        i.batchID,
        i.receivedDate,
        i.quantity,
        i.cost,
        i.wholesalePrice,
        i.retailPrice,
        i.minStock,
        i.availability
      FROM product p
      LEFT JOIN inventory i ON p.productID = i.productID
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ message: 'Failed to fetch inventory report.' });
  }
};

// Fetch Sales Report
export const getSalesReport = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let dateFormat = '%Y-%m'; // Default to monthly
    if (timeframe === 'Yearly') dateFormat = '%Y';
    if (timeframe === 'Daily') dateFormat = '%Y-%m-%d';

    // Query 1: Sales and orders
    const [salesData] = await pool.query(`
      SELECT  
        DATE_FORMAT(orderDate, '${dateFormat}') AS period,
        SUM(totalPrice) AS totalSales,
        COUNT(orderID) AS orders
      FROM orders
      GROUP BY period
    `);

    // Query 2: Products sold
    const [productData] = await pool.query(`
      SELECT  
        DATE_FORMAT(o.orderDate, '${dateFormat}') AS period,
        SUM(oi.quantity) AS productsSold
      FROM orders o
      JOIN orderitems oi ON o.orderID = oi.orderID
      GROUP BY period
    `);

    // Query 3: Top product
    const [topProductData] = await pool.query(`
      SELECT
        sub.period,
        sub.productName AS topProduct
      FROM (
        SELECT  
          DATE_FORMAT(o.orderDate, '${dateFormat}') AS period,
          p.name AS productName,
          SUM(oi.quantity) AS totalSold,
          RANK() OVER (PARTITION BY DATE_FORMAT(o.orderDate, '${dateFormat}') ORDER BY SUM(oi.quantity) DESC) AS rankInPeriod
        FROM orders o
        JOIN orderitems oi ON o.orderID = oi.orderID
        JOIN product p ON p.productID = oi.productID
        GROUP BY DATE_FORMAT(o.orderDate, '${dateFormat}'), p.productID
      ) AS sub
      WHERE sub.rankInPeriod = 1
    `);

    // Combine all results
    const report = salesData.map(sale => {
      const product = productData.find(p => p.period === sale.period);
      const top = topProductData.find(t => t.period === sale.period);

      return {
        ...sale,
        productsSold: product ? product.productsSold : 0,
        topProduct: top ? top.topProduct : 'N/A'
      };
    });

    res.status(200).json({ salesData: report });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Failed to fetch sales report.' });
  }
};


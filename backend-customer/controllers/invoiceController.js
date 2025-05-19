import pool from "../config/db.js";

export const createInvoiceForOrder = async (orderID) => {
  // Check if invoice already exists
  const [existing] = await pool.query('SELECT invoiceID FROM invoice WHERE orderID = ?', [orderID]);
  if (existing.length > 0) return; // Invoice already exists

  // Get order details
  const [orders] = await pool.query('SELECT totalPrice, payStatus FROM orders WHERE orderID = ?', [orderID]);
  if (orders.length === 0) throw new Error('Order not found for invoice');

  // Get totalDiscount from orderitems if needed (or pass it from order placement)
  const [discountRows] = await pool.query(
    'SELECT SUM(discountPrice) as totalDiscount FROM orderitems WHERE orderID = ?', [orderID]
  );
  const totalDiscount = discountRows[0].totalDiscount || 0;

  // Generate a new invoice ID
        const getLastInvoiceIDQuery = `
            SELECT MAX(CAST(SUBSTRING(invoiceID, 3) AS UNSIGNED)) AS lastID
            FROM invoice
            `;
            const [result] = await pool.query(getLastInvoiceIDQuery);
            const lastID = result[0].lastID || 0;
            const nextInvoiceID = `IN${lastID + 1}`;
  

  // Insert invoice
  await pool.query(
    `INSERT INTO invoice (invoiceID, orderID, issue_date, received_amount, credit_amount, discount, totalDiscount)
     VALUES (?, ?, NOW(), ?, 0, 0, ?)`,
    [nextInvoiceID, orderID, orders[0].totalPrice, totalDiscount]
  );
};
import pool from "../config/db.js";
import bcrypt from 'bcryptjs'; 
import { createInvoiceForOrder } from './invoiceController.js';


export const updateUserAddress = async (req, res) => {
  const userId = req.user.cusID; // Extract user ID from the JWT token
  const { streetNo, village, city, postalCode } = req.body;

  try {
    if (!streetNo || !village || !city || !postalCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
      UPDATE customer 
      SET streetNo = ?, village = ?, city = ?, postalCode = ?
      WHERE cusID = ?
    `;

    const [result] = await pool.query(sql, [streetNo, village, city, postalCode, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User address updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const placeOrder = async (req, res) => {
  const userId = req.user.cusID; 
  const { items, totalPrice, paymentMethod } = req.body;  

  const connection = await pool.getConnection(); 

  try {
    await connection.beginTransaction(); 

    // Generate a unique orderID in the format OR1, OR2, ...
    const getLastOrderIDQuery = `
      SELECT MAX(CAST(SUBSTRING(orderID, 3) AS UNSIGNED)) AS lastID
      FROM orders
    `;
    const [result] = await connection.query(getLastOrderIDQuery);
    const lastID = result[0].lastID || 0;
    const orderId = `OR${lastID + 1}`;

    const orderSql = `
      INSERT INTO orders (
        orderID, cusID,  orderDate, totalPrice, payStatus, deliveryStatus, paymentMethod
      )
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, 'Pending', 'Pending', ?)
    `;
    await connection.query(orderSql, [orderId, userId, totalPrice, paymentMethod]);

    const productOrdersData = [];

    for (const item of items) {
      // Find inventory batch with enough sto
      const batchSql = `
        SELECT batchID, quantity FROM inventory
        WHERE productID = ? AND availability = 1 AND quantity >= ?
        ORDER BY receivedDate ASC
        LIMIT 1
      `;
      const [batchResult] = await connection.query(batchSql, [item.productID, item.quantity]);

      if (batchResult.length === 0) {
        throw new Error(`Insufficient stock for ProductID: ${item.productID}`);
      }

      const batchId = batchResult[0].batchID;

      // Reduce stock quantity
      const updateStockSql = `
        UPDATE inventory
        SET quantity = quantity - ?
        WHERE batchID = ? AND productID = ?
      `;
      await connection.query(updateStockSql, [item.quantity, batchId, item.productID]);

      // Insert into orderitems
      const orderItemSql = `
        INSERT INTO orderitems (orderID, productID, quantity, price, discountPrice)
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.query(orderItemSql, [
        orderId,
        item.productID,
        item.quantity,
        item.price,
        item.discountPrice || null
      ]);

      productOrdersData.push({
        productID: item.productID,
        batchID: batchId,
        quantity: item.quantity
      });
    }

    await connection.commit();

    res.status(200).json({ message: 'Order placed successfully', orderId });

    // Set a timeout to check payment status
      setTimeout(async () => {
  try {
    const [orderStatusResult] = await connection.query(
      `SELECT payStatus, paymentMethod FROM orders WHERE orderID = ?`,
      [orderId]
    );

    if (orderStatusResult[0].payStatus === 'Pending' && orderStatusResult[0].paymentMethod === 'Stripe') {
      // Rollback the order if payment is not completed
      console.log(`Rolling back order ${orderId} due to incomplete payment.`);
      await connection.beginTransaction();

      // Restore stock quantities
      // You need to keep track of productOrdersData: [{productID, batchID, quantity}]
      for (const { productID, batchID, quantity } of productOrdersData) {
        const restoreStockSql = `
          UPDATE inventory
          SET quantity = quantity + ?
          WHERE batchID = ? AND productID = ?
        `;
        const restoreResult = await connection.query(restoreStockSql, [quantity, batchID, productID]);
        console.log(`Restored stock for batchID ${batchID}, productID ${productID}:`, restoreResult);
      }

      const cancelOrderSql = `
        UPDATE orders
        SET payStatus = 'Cancelled', deliveryStatus = 'Cancelled'
        WHERE orderID = ?
      `;
      const cancelResult = await connection.query(cancelOrderSql, [orderId]);
      console.log(`Order ${orderId} status updated to Cancelled:`, cancelResult);

      await connection.commit();
      console.log(`Order ${orderId} has been rolled back due to incomplete payment.`);
    }
  } catch (timeoutError) {
    console.error('Error during rollback:', timeoutError.message);
    await connection.rollback();
  }
}, 1 * 60 * 1000); // 10 minute timeout

  } catch (error) {
    await connection.rollback();
    console.error('Error placing order:', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { orderId } = req.body;

  try {
    const sql = `
      UPDATE orders
      SET payStatus = 'Paid'
      WHERE orderID = ?
    `;

    const [result] = await pool.query(sql, [orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create invoice for Stripe payment
    await createInvoiceForOrder(orderId);

    res.status(200).json({ message: 'Payment status updated to Paid' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrdersByCustomer = async (req, res) => {
  const cusID = req.user.cusID; // Extract cusID from the JWT token

  try {
    const sql = `
      SELECT 
        o.orderID,
        o.orderDate,
        o.payStatus,
        o.deliveryStatus,
        o.totalPrice,
        o.paymentMethod,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productID', oi.productID,
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountPrice', oi.discountPrice,
            'image', p.image
          )
        ) AS products
      FROM orders o
      JOIN orderitems oi ON o.orderID = oi.orderID
      JOIN product p ON oi.productID = p.productID
      WHERE o.cusID = ?
      GROUP BY o.orderID
      ORDER BY o.orderDate DESC
    `;

    const [orders] = await pool.query(sql, [cusID]);

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
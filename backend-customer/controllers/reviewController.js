import pool from '../config/db.js';

export const submitReview = async (req, res) => {
  const { productId, rating, comment, orderId } = req.body;
  const cusID = req.user.cusID;

  try {
    // Insert the review into product_review
    const insertReviewSql = `
      INSERT INTO product_review (productID, cusID, customerRating, comment)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(insertReviewSql, [productId, cusID, rating, comment]);

    // Update Product table with new average rating (use correct column names)
    const updateProductSql = `
      UPDATE product
      SET 
        totalRating = totalRating + ?,
        ratingCount = ratingCount + 1,
        productRating = (totalRating + ?) / (ratingCount + 1)
      WHERE productID = ?
    `;
    await pool.query(updateProductSql, [rating, rating, productId]);

    // Update order's deliveryStatus to 'Completed'
    const updateOrderStatusSql = `
      UPDATE orders
      SET deliveryStatus = 'Completed'
      WHERE orderID = ? AND cusID = ?
    `;
    await pool.query(updateOrderStatusSql, [orderId, cusID]);

    res.status(200).json({ message: 'Review submitted and order status updated successfully' });
  } catch (error) {
    console.error('Error submitting review:', error.message);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};



import pool from '../config/db.js';

// Add a new wholesale discount
export const addWholesaleDiscount = async (req, res) => {
  try {
    const { productID, discountQuantity, discount_percent, start_date, end_date } = req.body;
    if (!productID || !discountQuantity || !discount_percent) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    await pool.query(
      `INSERT INTO wholesale_discounts (productID, discountQuantity, discount_percent, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [productID, discountQuantity, discount_percent, start_date || null, end_date || null]
    );
    res.status(201).json({ message: "Wholesale discount added successfully." });
  } catch (error) {
    console.error("Error adding discount:", error);
    res.status(500).json({ message: "Failed to add discount." });
  }
};

// Update an existing wholesale discount
export const updateWholesaleDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { productID, discountQuantity, discount_percent, start_date, end_date } = req.body;
    await pool.query(
      `UPDATE wholesale_discounts SET productID=?, discountQuantity=?, discount_percent=?, start_date=?, end_date=?
       WHERE id=?`,
      [productID, discountQuantity, discount_percent, start_date || null, end_date || null, id]
    );
    res.status(200).json({ message: "Wholesale discount updated successfully." });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Failed to update discount." });
  }
};

// Delete a wholesale discount
export const deleteWholesaleDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM wholesale_discounts WHERE id=?`, [id]);
    res.status(200).json({ message: "Wholesale discount deleted successfully." });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Failed to delete discount." });
  }
};

// Get all wholesale discounts
export const getAllWholesaleDiscounts = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM wholesale_discounts`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ message: "Failed to fetch discounts." });
  }
};
import express from "express";
const router = express.Router();
import {
  addWholesaleDiscount,
  updateWholesaleDiscount,
  deleteWholesaleDiscount,
  getAllWholesaleDiscounts
} from '../controllers/discountController.js';
import { verifyAdmin } from '../middleware/authAdmin.js';
import pool from "../config/db.js"; 

router.get("/", async (req, res) => {
  const { productID, qty, date } = req.query;
  try {
    const sql = `
      SELECT discount_percent FROM wholesale_discounts
      WHERE productID = ? AND discountQuantity <= ? AND 
            (start_date IS NULL OR start_date <= ?) AND 
            (end_date IS NULL OR end_date >= ?)
      ORDER BY discountQuantity DESC LIMIT 1
    `;
    const [rows] = await pool.query(sql, [productID, qty, date, date]);
    res.json({ discount_percent: rows.length ? rows[0].discount_percent : 0 });
  } catch (err) {
    res.status(500).json({ message: "Error fetching discount", error: err.message });
  }
});

// Route to add a new wholesale discount
router.post('/', addWholesaleDiscount);

// Route to update an existing wholesale discount
router.put('/:id',verifyAdmin, updateWholesaleDiscount);

// Route to delete a wholesale discount
router.delete('/:id', verifyAdmin, deleteWholesaleDiscount);

//  view all discounts
router.get('/all', getAllWholesaleDiscounts);


export default router;
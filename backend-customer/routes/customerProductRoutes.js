import express from 'express';
import { getAllProducts } from '../controllers/customerProductController.js';

const router = express.Router();

// Route to fetch all products
router.get('/products', getAllProducts);

export default router;
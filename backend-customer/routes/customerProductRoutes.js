import express from 'express';
import { getAllProducts, getProductDetails } from '../controllers/customerProductController.js';

const router = express.Router();

// Route to fetch all products
router.get('/products', getAllProducts);

// Route to fetch product details by ID
router.get('/products/:id', getProductDetails);

export default router;
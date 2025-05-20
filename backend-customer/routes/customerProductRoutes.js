import express from 'express';
import { getAllProducts, getProductDetails, searchProducts, getProductsByCategory } from '../controllers/customerProductController.js';

const router = express.Router();


// Route to search products by name or description
router.get('/products/search', searchProducts);

// Route to fetch products by category  
router.get('/products/category', getProductsByCategory);

// Route to fetch all products
router.get('/products', getAllProducts);

// Route to fetch product details by ID
router.get('/products/:id', getProductDetails);





export default router;
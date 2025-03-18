//Purpose: Handles API endpoint definitions
//Keeps route handling separate from business logic

import express from 'express';
import { productController } from '../controllers/productController.js';
import { upload } from '../app.js';

const router = express.Router();

//router.post('/products', productController.createProduct);

// Product routes
router.post('/products', upload.single('image'), productController.createProduct);
router.get('/products', productController.getAllProducts);

// You can add other routes like GET, PUT, DELETE for products here

export default router;

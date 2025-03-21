 import express from 'express';
 import { addInventory, getProducts, searchProducts, getInventory } from '../controllers/inventoryController.js';

 const router = express.Router();

 router.get('/products', getProducts);
 router.get('/products/search', searchProducts);
 router.post('/', addInventory);
 router.get('/inventory', getInventory); 

 export default router;
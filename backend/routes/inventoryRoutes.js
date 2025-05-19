 import express from 'express';
 import { addInventory, getProducts, searchProducts, getInventory, softDeleteBatch, updateInventory } from '../controllers/inventoryController.js';

 const router = express.Router();

 router.get('/products', getProducts);
 router.get('/products/search', searchProducts);
 router.post('/', addInventory);
 router.get('/inventory', getInventory); 

 // Soft delete a batch (set availability = 0)
router.put('/batch/:batchID/:productID/delete', softDeleteBatch);

// Update inventory fields
router.put('/batch/:batchID/:productID', updateInventory);

 export default router;
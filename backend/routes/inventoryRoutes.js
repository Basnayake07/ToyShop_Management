 import express from 'express';
 import { addInventory, getProducts, searchProducts, getInventory, softDeleteBatch, updateInventory } from '../controllers/inventoryController.js';
 import { verifyAdmin } from '../middleware/authAdmin.js';

 const router = express.Router();

 router.get('/products', getProducts);
 router.get('/products/search', searchProducts);
 router.post('/',verifyAdmin, addInventory);
 router.get('/inventory', getInventory); 

 // Soft delete a batch (set availability = 0)
router.put('/batch/:batchID/:productID/delete', verifyAdmin, softDeleteBatch);

// Update inventory fields
router.put('/batch/:batchID/:productID', verifyAdmin, updateInventory);

 export default router;
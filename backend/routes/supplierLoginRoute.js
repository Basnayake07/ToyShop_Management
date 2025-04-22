import express from 'express';
import { loginSupplier,getSupplierPurchaseOrders, updatePurchaseOrder } from '../controllers/supplierLoginController.js';

const router = express.Router();

// Supplier login route
router.post('/login', loginSupplier);

// Fetch orders for a supplier
router.get('/:suppID/purchase-orders', getSupplierPurchaseOrders); 

// Update order status and feedback
router.put('/purchase-orders/:purchaseID', updatePurchaseOrder); 

export default router;
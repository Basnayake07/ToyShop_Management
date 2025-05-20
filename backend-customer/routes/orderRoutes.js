import express from 'express';
import { updateUserAddress, placeOrder, updatePaymentStatus, getOrdersByCustomer  } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Example route (replace/add your actual order routes)
router.put('/update-address', authenticate, updateUserAddress);

// Route to place an order
router.post('/place-order', authenticate, placeOrder);

// Route to update payment status
router.put('/update-payment-status', authenticate, updatePaymentStatus);

// Route to get orders by customer
router.get('/orders', authenticate, getOrdersByCustomer);

export default router;


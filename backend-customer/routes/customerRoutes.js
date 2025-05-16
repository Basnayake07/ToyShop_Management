import express from 'express';
import { getCustomerDetails, updateCustomerDetails, changePassword, getCustomerOrders, addOrUpdateReview } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Get customer details
router.get('/cus', authenticate, getCustomerDetails);

// Update customer details
router.put('/cus', authenticate, updateCustomerDetails);

// Change password
router.put('/cus/password', authenticate, changePassword);

// Get all orders for the logged-in customer
router.get('/orders', authenticate, getCustomerOrders);

// Add or update a review for a product
router.post('/review', authenticate, addOrUpdateReview);

export default router;
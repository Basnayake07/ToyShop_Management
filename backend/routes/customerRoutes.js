import express from 'express';
import { getAllCustomers, registerCustomerByAdmin, deleteCustomer, updateCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/register', registerCustomerByAdmin);
router.delete('/delete', deleteCustomer);
router.put('/update', updateCustomer);

export default router;
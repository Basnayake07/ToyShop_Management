import express from 'express';
import { getAllCustomers, registerCustomerByAdmin, deleteCustomer, updateCustomer, getCustomerByName } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/register', registerCustomerByAdmin);
router.delete('/delete', deleteCustomer);
router.put('/update', updateCustomer);
router.get('/customers', getCustomerByName);

export default router;
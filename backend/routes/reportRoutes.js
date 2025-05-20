import express from 'express';
import { getInventoryReport, getSalesReport } from '../controllers/ReportController.js';


const router = express.Router();

// Route to fetch inventory report
router.get('/inventory', getInventoryReport);
router.get('/sales', getSalesReport);

export default router;
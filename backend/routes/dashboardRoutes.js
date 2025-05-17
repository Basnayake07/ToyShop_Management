import express from "express";
import {
  getDashboardDetails,
  getSalesChart,
  getLowStockProducts, getLowStockCount, getPartiallyPaidCustomers,
  getPartiallyPaidCustomersCount
} from "../controllers/dashboardController.js";

const router = express.Router();

// Route to get dashboard summary
router.get("/dashboard/summary", getDashboardDetails);

// Route to get sales chart data
router.get("/dashboard/sales-chart", getSalesChart);

// Route to get low stock products
router.get("/dashboard/low-stock", getLowStockProducts);

// Route to get low stock count
router.get("/dashboard/low-stock/count", getLowStockCount);

// Route to get partially paid customers
router.get("/dashboard/partially-paid-customers", getPartiallyPaidCustomers);

// Route to get count of partially paid customers
router.get("/dashboard/partially-paid-customers/count", getPartiallyPaidCustomersCount);

export default router;
import express from "express";
import {
  getDashboardDetails,
  getSalesChart,
  getLowStockProducts, getLowStockCount
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

export default router;
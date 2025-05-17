import express from "express";
import { orderController } from "../controllers/orderController.js";

const router = express.Router();

// Route to create a new order
router.post("/orders", orderController.createOrder);

// Route to fetch all orders
router.get("/orders", orderController.getAllOrders);

// Route to fetch order details by order ID
router.get("/orders/:orderID", orderController.getOrderDetails);

// Route to update an order status
router.put("/orders/:orderID/delivery-status", orderController.updateDeliveryStatus);

export default router;

import express from "express";
import {
  createReturnRequest,
  updateReturnStatus,
  getAllReturns,
  getReturnDetails,
  getReturnedProducts
} from "../controllers/returnsController.js";

const router = express.Router();

// Create a return request
router.post("/returns", createReturnRequest); 

// Update return status
router.put("/returns/:returnID", updateReturnStatus); 

// Get all return requests
router.get("/returns", getAllReturns); 

// Get details of a specific return
router.get("/returns/:returnID", getReturnDetails); 

 // Get all returned products
router.get("/returnsProducts", getReturnedProducts); 

export default router;
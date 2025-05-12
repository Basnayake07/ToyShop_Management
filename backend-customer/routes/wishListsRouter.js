import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
} from '../controllers/wishListsController.js';

const router = express.Router();

// Route to add a product to the wishlist
router.post('/add',authenticate, addToWishlist);

// Route to remove a product from the wishlist
router.post('/remove',authenticate, removeFromWishlist);

// Route to fetch the wishlist for a specific user
router.get('/', authenticate, getWishlist);

// Route to clear the wishlist for a specific user
router.delete('/clear',authenticate, clearWishlist);

export default router;
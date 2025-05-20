import express from 'express';
import { submitReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/addReview', authenticate, submitReview);

export default router;
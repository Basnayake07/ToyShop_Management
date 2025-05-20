'use client';

import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { addOrUpdateReview } from '@/services/userService';
import '@/styles/ReviewModal.css';

const ReviewModal = ({ open, onClose, onSubmit, product }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setShowError(true);
      return;
    }
  
    const reviewData = {
      productId: product.productID,
      orderId: product.orderID, 
      rating,
      comment,
    };
  
    try {
      await addOrUpdateReview(reviewData); // Submit the review to the backend
      setRating(0);
      setComment('');
      setShowError(false);
      setShowSuccess(true); // Show the success message
  
      setTimeout(() => {
        setShowSuccess(false); // Hide the success message
        window.location.reload(); // Reload the page to reflect the changes
      }, 3000); // 3-second delay
      
    } catch (error) {
      console.error('Error submitting review:', error.message);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setShowError(false);
    setShowSuccess(false);
    onClose();
  };

  // Rating labels for better UX
  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose} 
      aria-labelledby="review-modal-title"
      className="review-modal-backdrop"
    >
      <Box className="review-modal">
        <div className="modal-header">
          <Typography id="review-modal-title" variant="h5" component="h2" className="modal-title">
            Write a Review
          </Typography>
          <IconButton className="close-button" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {showSuccess && (
          <Alert severity="success" className="success-alert">
            Review submitted successfully!
          </Alert>
        )}

        <Divider className="header-divider" />

        <div className="modal-content">
          {/* Product Information */}
          <div className="review-modal-product-info">
            <Avatar
              src={product?.image}
              alt={product?.name}
              variant="rounded"
              className="review-modal-product-image"
            />
            <div className="review-modal-product-details">
              <Typography variant="h6" className="review-modal-product-name">
                {product?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="review-modal-product-price">
                Rs.{product?.price?.toFixed(2)}
              </Typography>
            </div>
          </div>

          <Divider className="content-divider" />

          {/* Rating Section */}
          <div className="review-modal-rating-section">
            <Typography variant="subtitle1" className="review-modal-section-title">
              How would you rate this product?
            </Typography>
            
            <div className="review-modal-rating-container">
              <Rating
                name="product-rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                  setShowError(false);
                }}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarIcon fontSize="inherit" />}
                className="review-modal-rating-stars"
              />
              {rating > 0 && (
                <Chip 
                  label={ratingLabels[rating]} 
                  color="primary" 
                  variant="outlined"
                  className="rating-label"
                />
              )}
            </div>

            {showError && (
              <Alert severity="error" className="error-alert">
                Please provide a rating before submitting your review.
              </Alert>
            )}
          </div>

          {/* Comment Section */}
          <div className="comment-section">
            <Typography variant="subtitle1" className="section-title">
              Tell us about your experience (optional)
            </Typography>
            <TextField
              label="Share your thoughts about this product..."
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              variant="outlined"
              className="comment-field"
              placeholder="What did you like or dislike about this product? How was the quality, value for money, etc.?"
            />
            <Typography variant="caption" color="text.secondary" className="character-count">
              {comment.length}/500 characters
            </Typography>
          </div>
        </div>

        <Divider className="footer-divider" />

        {/* Modal Actions */}
        <div className="modal-actions">
          <Button
            variant="outlined"
            onClick={handleClose}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="submit-button"
            startIcon={<StarIcon />}
          >
            Submit Review
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ReviewModal;
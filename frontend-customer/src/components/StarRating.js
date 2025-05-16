'use client';

import React from 'react';
import '@/styles/StarRating.css'; // Add styles for stars if needed

const StarRating = ({ rating }) => {
  const validRating = !isNaN(rating) && rating >= 0 ? rating : 0; // Validate rating
  const fullStars = Math.floor(validRating); // Number of full stars
  const halfStar = validRating % 1 >= 0.5; // Check if there's a half star
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Remaining empty stars

  return (
    <div className="stars-container">
      {[...Array(fullStars)].map((_, index) => (
        <span key={`full-${index}`} className="star filled">★</span>
      ))}
      {halfStar && <span className="star half-filled">★</span>}
      {[...Array(emptyStars)].map((_, index) => (
        <span key={`empty-${index}`} className="star empty">★</span>
      ))}
    </div>
  );
};

export default StarRating;
'use client';

import React from 'react';
import StarRating from '@/components/StarRating';
import '@/styles/Comment.css';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

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

const Comment = ({ name, date, text, rating, avatar }) => {
  // Format date more nicely
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Get first letter of name for avatar fallback
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="comment">
      <div className="comment-container">
        <div className="comment-avatar">
          {avatar ? (
            <img src={avatar} alt={`${name}'s avatar`} className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">{initials}</div>
          )}
        </div>
        
        <div className="comment-content">
          <div className="comment-header">
            <div className="name-rating">
              <span className="comment-name">{name}</span>
              <div className="comment-rating">
                <StarRating rating={rating} /> 
              <span className="rating-value">{rating.toFixed(1)}</span>
              </div>
            </div>
            <span className="comment-date">{formattedDate}</span>
          </div>
          
          <div className="comment-text">{text}</div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
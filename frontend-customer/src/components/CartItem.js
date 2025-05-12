'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { IconButton, Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCustomer } from '@/contexts/customerContext';
import '@/styles/CartItems.css';

// Helper function to convert Google Drive URL to direct image link
const getDirectImageUrl = (url) => {
  if (url.includes('drive.google.com')) {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    const directUrl = fileId ? `https://drive.google.com/uc?id=${fileId}` : url;
    return directUrl;
  }
  return url;
};

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const { cusType } = useCustomer();
  const { id, productID, image, name, wholesalePrice, retailPrice, quantity = 1 } = item;
  const [itemQuantity, setItemQuantity] = useState(quantity);
  
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setItemQuantity(newQuantity);
    onQuantityChange && onQuantityChange(id, newQuantity);
  };

  const handleRemove = () => {
    onRemove && onRemove(productID);
  };

  // Determine the price based on cusType
  const price = cusType === 'wholesale' ? wholesalePrice : retailPrice;
  const formattedPrice = !isNaN(price) ? parseFloat(price).toFixed(2) : 'N/A';
  const subtotal = !isNaN(price) ? (parseFloat(price) * itemQuantity).toFixed(2) : 'N/A';


    return (
      <div className="cart-item">
        <div className="cart-item-image">
          <Image
            src={getDirectImageUrl(image)}
            alt={name}
            width={90}
            height={90}
            className="cart-product-img"
          />
        </div>
        
        <div className="cart-item-details">
          <h3 className="cart-item-name">{name}</h3>
          <p className="cart-item-price">Rs.{formattedPrice}</p>
        </div>
        
        <div className="cart-item-quantity">
          <div className="quantity-control">
            <IconButton 
              className="quantity-btn" 
              onClick={() => handleQuantityChange(itemQuantity - 1)}
              disabled={itemQuantity <= 1}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            
            <span className="quantity-value">{itemQuantity}</span>
            
            <IconButton 
              className="quantity-btn" 
              onClick={() => handleQuantityChange(itemQuantity + 1)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        
        <div className="cart-item-subtotal">
          <p className="subtotal-label">Subtotal:</p>
          <p className="subtotal-value">Rs.{subtotal}</p>
        </div>
        
        <div className="cart-item-actions">
          <IconButton 
            className="remove-btn" 
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </div>
      </div>
  );
};

export default CartItem;
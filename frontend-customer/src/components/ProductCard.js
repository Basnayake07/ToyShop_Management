'use client';

import React from 'react';
import '@/styles/ProductCard.css';
import Image from "next/image";
import { Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Helper function to convert Google Drive URL to direct image link
const getDirectImageUrl = (url) => {
  if (url.includes('drive.google.com')) {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    const directUrl = fileId ? `https://drive.google.com/uc?id=${fileId}` : url;
    console.log('Converted URL:', directUrl); // Debugging
    return directUrl;
  }
  return url; // Return the original URL if it's not a Google Drive URL
};

const ProductCard = ({ product }) => {
  const { image, name, retailPrice, wholesalePrice } = product;

  const handleAddToCart = () => {
    console.log(`${name} added to cart!`);
    // Add your "Add to Cart" logic here
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <Image
          src={getDirectImageUrl(image)}
          alt={name}
          width={150} // Set the width of the image
          height={150} // Set the height of the image
        />
      </div>
      <div className="product-details">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">
          <strong>Retail Price:</strong> Rs.{!isNaN(retailPrice) ? parseFloat(retailPrice).toFixed(2) : 'N/A'}
        </p>
        <p className="product-price">
          <strong>Wholesale Price:</strong> Rs.{!isNaN(wholesalePrice) ? parseFloat(wholesalePrice).toFixed(2) : 'N/A'}
        </p>
        <Button
          variant="contained"
          className='btn-cart'
          color="#f8f8f8"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          style={{backgroundColor:"#0A2F6E", color:"#fff"}}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
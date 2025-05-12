'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/ProductCard.css';
import Image from "next/image";
import { Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/cartContext';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const { id, productID, image, name, price, sold_count, rating } = product;
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const API_BASE_URL = 'http://localhost:8082/api/wishlist';

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        const wishlist = await response.json();
        setIsWishlisted(wishlist.some(item => item.id === id)); // Check if the product is in the wishlist
      } catch (error) {
        console.error('Error checking wishlist status:', error.message);
      }
    };

    checkWishlistStatus();
  }, [id]);

  const handleCardClick = () => {
    router.push(`/ViewProduct?id=${id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    console.log(`${name} added to cart!`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      alert('Please log in to add items to your wishlist.');
      router.push('/SignIn');
      return;
    }

    try {
      if (isWishlisted) {
        setIsWishlisted(false);
        const response = await fetch(`${API_BASE_URL}/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productID: id || productID }),
        });
        if (!response.ok) {
          throw new Error('Failed to remove product from wishlist');
        }
        console.log(`${name} removed from wishlist!`);
      } else {
        setIsWishlisted(true);
        const response = await fetch(`${API_BASE_URL}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productID: id || productID }),
        });
        if (!response.ok) {
          throw new Error('Failed to add product to wishlist');
        }
        console.log(`${name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error.message);
      setIsWishlisted((prev) => !prev); // Revert state if API call fails
    }
  };

  const formattedPrice = !isNaN(price) ? parseFloat(price).toFixed(2) : 'N/A';

  return (
    <div 
      className="product-card" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-badge">
        {sold_count > 50 && <span className="badge bestseller">Bestseller</span>}
      </div>
      
      <div 
        className="wishlist-icon" 
        onClick={handleWishlistToggle} 
        style={{ color: isWishlisted ? '#ff6b6b' : '#ccc' }}
      >
        <FavoriteIcon className="heart-icon" style ={{color: isWishlisted ? '#ff6b6b' : '#ccc'}}/>
      </div>
      
      <div className="product-image-container">
        <div className={`product-image ${isHovered ? 'zoomed' : ''}`}>
          <Image
            src={image}
            alt={name}
            width={220}
            height={220}
            className="product-img"
          />
        </div>
      </div>
      
      <div className="product-details">
        <h3 className="product-name">{name}</h3>

        <p className="product-price">
          <strong>Retail Price:</strong> Rs.{!isNaN(product.retailPrice) ? parseFloat(product.retailPrice).toFixed(2) : 'N/A'}
        </p>
        <p className="product-price">
          <strong>Wholesale Price:</strong> Rs.{!isNaN(product.wholesalePrice) ? parseFloat(product.wholesalePrice).toFixed(2) : 'N/A'}
        </p>

        <div className="product-rating-row">
          <StarRating rating={rating} />
          <span className="sold-count">{sold_count} sold</span>
        </div>

        <Button
          variant="contained"
          className="btn-cart"
          onClick={handleAddToCart}
          startIcon={<ShoppingCartIcon />}
          style={{ backgroundColor: "#0A2F6E", color: "#fff" }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
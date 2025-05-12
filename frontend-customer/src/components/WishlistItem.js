'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { IconButton, Button } from '@mui/material';
import { useCart } from '@/contexts/cartContext';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarRating from '@/components/StarRating';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import '@/styles/WishlistItem.css';

// Helper function to convert Google Drive URL to direct image link
const getDirectImageUrl = (url) => {
  if (url.includes('drive.google.com')) {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    const directUrl = fileId ? `https://drive.google.com/uc?id=${fileId}` : url;
    return directUrl;
  }
  return url;
};

const WishlistItem = ({ item, onRemove }) => {
  const { id, productID, image, name, retailPrice, wholesalePrice, rating, availability = 'In Stock' } = item;
  const { addToCart } = useCart();
  const [openDialog, setOpenDialog] = useState(false);

  const API_BASE_URL = 'http://localhost:8082/api/wishlist';

  // Add a product to the wishlist
  const addToWishlist = async (productID) => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID }),
      });
      if (!response.ok) {
        throw new Error('Failed to add product to wishlist');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding product to wishlist:', error.message);
      throw error;
    }
  };

  // Remove a product from the wishlist
  const removeFromWishlist = async (productID) => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID}),
      });
      if (!response.ok) {
        throw new Error('Failed to remove product from wishlist');
      }
      return await response.json();
    } catch (error) {
      console.error('Error removing product from wishlist:', error.message);
      throw error;
    }
  };

  // Fetch the wishlist for the current user
  const getWishlist = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No token found. Please log in.');
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
      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlist:', error.message);
      throw error;
    }
  };

  // Clear all items from the wishlist
  const clearWishlist = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }
      return await response.json();
    } catch (error) {
      console.error('Error clearing wishlist:', error.message);
      throw error;
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    try {
      await removeFromWishlist(id);
      console.log(`${name} removed from wishlist!`);

      onRemove && onRemove(id);
    } catch (error) {
      console.error('Error removing item from wishlist:', error.message);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(item);
    console.log(`${name} added to cart!`);
  };

  const openConfirmationDialog = () => {
    setOpenDialog(true);
  };

  const closeConfirmationDialog = () => {
    setOpenDialog(false);
  };

  const formattedRetailPrice = !isNaN(retailPrice) ? parseFloat(retailPrice).toFixed(2) : 'N/A';
  const formattedWholesalePrice = !isNaN(wholesalePrice) ? parseFloat(wholesalePrice).toFixed(2) : 'N/A';
  

  const isAvailable = availability === 'In Stock';

  return (
    <div className="wishlist-item">
      <div className="wishlist-item-image">
        <Image
          src={getDirectImageUrl(image)}
          alt={name}
          width={110}
          height={110}
          className="wishlist-product-img"
        />
      </div>

      <div className="wishlist-item-details">
        <h3 className="wishlist-item-name">{name}</h3>

        <div className="wishlist-item-rating">
          <StarRating rating={rating} />
        </div>

        <p className="wishlist-item-price">
          <strong>Retail Price:</strong> Rs.{formattedRetailPrice}
        </p>
        <p className="wishlist-item-price">
          <strong>Wholesale Price:</strong> Rs.{formattedWholesalePrice}
        </p>

        <div className="wishlist-item-availability" data-available={isAvailable}>
          {availability}
        </div>
      </div>

      <div className="wishlist-item-actions">
        <Button
          variant="contained"
          className="wishlist-add-cart-btn"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={!isAvailable}
        >
          Add to Cart
        </Button>

        <div className="wishlist-secondary-actions">
          <IconButton
            className="remove-wishlist-btn"
            onClick={openConfirmationDialog}
            title="Remove from wishlist"
            aria-label="Remove from wishlist"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </div>
      </div>
      <ConfirmationDialog
        open={openDialog}
        onClose={closeConfirmationDialog}
        onConfirm={handleRemove}
        title="Confirm Remove from Wishlist"
        message="Are you sure you want to remove the item from the wishlist?"
      />
    </div>
  );
};

export default WishlistItem;
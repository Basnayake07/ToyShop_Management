'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  TextField, 
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Header } from "@/components/Header";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import WishlistItem from '@/components/WishlistItem';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import '@/styles/WishlistPage.css';

const WishlistPage = () => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [openDialog, setOpenDialog] = useState(false);

  const API_BASE_URL = 'http://localhost:8082/api/wishlist';

  // Fetch wishlist items from the backend
  useEffect(() => {
    const fetchWishlistItems = async () => {
      setLoading(true);
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        console.error('No token found. Please log in.');
        setLoading(false);
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
        setWishlistItems(wishlist); // Set the fetched wishlist items
      } catch (error) {
        console.error('Error fetching wishlist items:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  // Filter items by search query
  const filteredItems = wishlistItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items based on selected option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch(sortOption) {
      case 'price_low':
        return a.retailPrice - b.retailPrice;
      case 'price_high':
        return b.retailPrice - a.retailPrice;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Handle removing item from wishlist
  const handleRemoveItem = async (itemId) => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: itemId }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove product from wishlist');
      }
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
      console.log(`Item ${itemId} removed from wishlist`);
    } catch (error) {
      console.error('Error removing item from wishlist:', error.message);
    }
  };

  // Handle adding item to cart
  const handleAddToCart = (itemId) => {
    console.log(`Item ${itemId} added to cart`);
    // Add to cart logic here
    // Optionally remove from wishlist
    // setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Handle clear all items
  const handleClearAll = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      console.error('No token found. Please log in.');
      return;
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
      setWishlistItems([]); // Clear the wishlist in the UI
      console.log('Wishlist cleared successfully');
    } catch (error) {
      console.error('Error clearing wishlist:', error.message);
    }
  };

  // Handle continue shopping
  const handleExploreCatalog = () => {
    router.push('/HomePage');
  };

  const openConfirmationDialog = () => {
    setOpenDialog(true);
  };

  const closeConfirmationDialog = () => {
    setOpenDialog(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  // Render empty wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-container">
        <Paper className="empty-wishlist" elevation={0}>
          <FavoriteBorderIcon className="empty-wishlist-icon" />
          <Typography variant="h5" className="empty-wishlist-message">
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="textSecondary" style={{ marginBottom: '20px' }}>
            You haven't added any products to your wishlist yet.
          </Typography>
          <Button 
            variant="contained" 
            className="explore-products-btn"
            onClick={handleExploreCatalog}
          >
            Explore Products
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Header isHomePage={false} />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="wishlist-title-section">
            <Typography variant="h4" className="wishlist-title">
              My Wishlist
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </Typography>
          </div>
          
          <div className="wishlist-actions">
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteSweepIcon />}
              onClick={openConfirmationDialog}
              className="clear-wishlist-btn"
            >
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="wishlist-filters">
          <TextField
            placeholder="Search wishlist"
            variant="outlined"
            size="small"
            className="wishlist-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small" className="wishlist-sort">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="name_asc">Name: A to Z</MenuItem>
              <MenuItem value="name_desc">Name: Z to A</MenuItem>
              <MenuItem value="rating">Top Rated</MenuItem>
            </Select>
          </FormControl>
        </div>
        
        <Paper className="wishlist-items-paper" elevation={0}>
          <div className="wishlist-items-container">
            {sortedItems.map(item => (
              <WishlistItem 
                key={item.id} 
                item={item} 
                onRemove={handleRemoveItem}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </Paper>
        
        <div className="wishlist-footer">
          <Button 
            variant="text" 
            className="continue-shopping-btn" 
            onClick={handleExploreCatalog}
          >
            ← Continue Shopping
          </Button>
        </div>
      </div>
      <ConfirmationDialog
        open={openDialog}
        onClose={closeConfirmationDialog}
        onConfirm={handleClearAll}
        title="Confirm Remove all from Wishlist"
        message="Are you sure you want to remove all the items from the wishlist?"
      />
    </div>
  );
};

export default WishlistPage;
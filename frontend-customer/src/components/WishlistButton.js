import React, { useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';

const WishlistButton = ({ productID, productName }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setIsWishlisted(wishlist.includes(productID));
  }, [productID]);

  const handleWishlistToggle = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (isWishlisted) {
      const updated = wishlist.filter(id => id !== productID);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      wishlist.push(productID);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  return (
    <button className="wishlist-btn" onClick={handleWishlistToggle}>
      <FavoriteIcon style={{ color: isWishlisted ? '#ff6b6b' : '#ccc' }} />
      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
    </button>
  );
};

export default WishlistButton;
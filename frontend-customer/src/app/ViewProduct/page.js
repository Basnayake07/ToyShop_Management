'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/Header";
import { getProductDetails } from '@/services/productService';
import Image from 'next/image';
import Comment from '@/components/Comment';
import StarRating from '@/components/StarRating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { HiOutlineShare } from "react-icons/hi";
import ShareModal from '@/components/ShareModal';
import '@/styles/ViewProduct.css';

const ViewProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const productID = searchParams.get('id');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productData = await getProductDetails(productID);
        setProduct(productData);
        // Set defaults if attributes exist
        if (productData?.attributes) {
          const colorAttr = productData.attributes.find(a => a.attribute === 'color');
          const sizeAttr = productData.attributes.find(a => a.attribute === 'size');
          if (colorAttr) setSelectedColor(colorAttr.value);
          if (sizeAttr) setSelectedSize(sizeAttr.value);
        }
      } catch (error) {
        console.error('Error fetching product details:', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (productID) fetchProductDetails();
  }, [productID]);

  // Wishlist logic (localStorage, no service)
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(productID));
  }, [productID]);

  const handleWishlistToggle = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
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

  const handleQuantityChange = (type) => {
    setQuantity(q => type === 'increase' ? q + 1 : Math.max(1, q - 1));
  };

  const handleColorSelect = (color) => setSelectedColor(color);
  const handleSizeSelect = (size) => setSelectedSize(size);

  const handleAddToCart = () => {
    // Implement your add to cart logic here
    alert(`Added ${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    // Implement your buy now logic here
    alert(`Buying ${quantity} x ${product.name} (${selectedColor}, ${selectedSize})`);
  };

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!product) return <div className="error-container">Product not found</div>;

  // Prepare attributes
  const colors = product.attributes?.filter(a => a.attribute === 'color').map(a => a.value) || [];
  const sizes = product.attributes?.filter(a => a.attribute === 'size').map(a => a.value) || [];
  const reviews = product.reviews || [];
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="view-product">
      <Header isHomePage={false} />
      <main className="product-content-container">
        <div className="product-gallery">
          <Image
            src={product.image}
            alt={product.name}
            width={350}
            height={350}
            objectFit="contain"
            className="main-product-image"
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">Rs. {Number(product.retailPrice).toFixed(2)}</div>
          <div className="product-description">{product.description}</div>
          <div className="product-rating">
            <StarRating rating={reviews.length > 0 ? reviews[0].rating : 0} />
            <span className="rating-value">
              ({reviews.length > 0 ? reviews[0].rating.toFixed(1) : 'No ratings yet'})
            </span>
          </div>
          {colors.length > 0 && (
            <div className="color-options">
              <span className="option-label">Colours:</span>
              <div className="color-selector">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn${selectedColor === color ? ' selected' : ''}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>
          )}
          {sizes.length > 0 && (
            <div className="size-options">
              <span className="option-label">Size:</span>
              <div className="size-selector">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn${selectedSize === size ? ' selected' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="product-actions">
            <div className="quantity-selector">
              <button className="quantity-btn" onClick={() => handleQuantityChange('decrease')}>−</button>
              <input type="text" value={quantity} readOnly className="quantity-input" />
              <button className="quantity-btn" onClick={() => handleQuantityChange('increase')}>+</button>
            </div>
            <button className="buy-now-btn" onClick={handleBuyNow}>BUY NOW</button>
            <button className="wishlist-btn" onClick={handleWishlistToggle}>
              <FavoriteIcon style={{ color: isWishlisted ? '#ff6b6b' : '#ccc' }} />
            </button>
          </div>
          <div className="additional-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>ADD TO CART</button>
            <button className="share-btn" onClick={openShareModal}><HiOutlineShare /></button>
          </div>
        </div>
      </main>
      <div className="product-comments">
        <h2>Customer Comments</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Comment
              key={review.id}
              name={review.customerName}
              rating={review.rating}
              date={review.date}
              text={review.text}
            />
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
      <ShareModal
        open={isShareModalOpen}
        onClose={closeShareModal}
        shareUrl={shareUrl}
        title={product.name}
      />
    </div>
  );
};

export default ViewProduct;
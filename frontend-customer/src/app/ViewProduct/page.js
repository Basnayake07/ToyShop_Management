'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/Header";
import { getProductDetails } from '@/services/productService';
import { useCart } from '@/contexts/cartContext';
import Image from 'next/image';
import Comment from '@/components/Comment';
import StarRating from '@/components/StarRating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { HiOutlineShare } from "react-icons/hi";
import ShareModal from '@/components/ShareModal';
import '@/styles/ViewProduct.css';
import { useCustomer } from '@/contexts/customerContext';

const ViewProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const {cusType} = useCustomer();
   const { addToCart } = useCart();
  const router = useRouter();

  const shareUrl = 'https://Toyshop.com/ViewProduct?id=${productID}';
  const shareTitle = `Check out this product: ${product?.name}`;


  const searchParams = useSearchParams();
  const productID = searchParams.get('id');
  

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productData = await getProductDetails(productID);
        
        setProduct(productData);
        setReviews(productData.reviews || []);
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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    console.log(`${name} added to cart!`);
  };



  const openShareModal = () => setIsShareModalOpen(true);
const closeShareModal = () => setIsShareModalOpen(false);

  const handleBuyNow = () => {
  // Determine price based on cusType
  const buyNowPrice =
    cusType && cusType.toLowerCase() === 'wholesale'
      ? product.wholesalePrice
      : product.retailPrice;

  const productData = {
    id: product.id,
    name: product.name,
    price: buyNowPrice,
    quantity,
  };
  localStorage.removeItem('cartItems');
  const queryString = new URLSearchParams(productData).toString();
  router.push(`/Checkout?${queryString}`);
};

// Place this line here, before return:
  const price = product
    ? (cusType === 'Wholesale'
        ? product.wholesalePrice
        : product.retailPrice)
    : 0;
    console.log('cusType:', cusType);

  return (
    <div className="view-product">
    <Header isHomePage={false} />
    {loading || !product ? (
      <div style={{ padding: 40, textAlign: 'center' }}>Loading product...</div>
    ) : (
      <>
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
          <div className="product-price">Rs. {Number(price).toFixed(2)}</div>
          <div className="product-description">{product.description}</div>
          <div className="product-rating">
            <StarRating rating={reviews.length > 0 ? reviews[0].rating : 0} />
            <span className="rating-value">
              ({reviews.length > 0 ? reviews[0].rating.toFixed(1) : 'No ratings yet'})
            </span>
          </div>
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
      </>
    )}
    </div>
  );
};

export default ViewProduct;
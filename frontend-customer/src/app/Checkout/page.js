'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/Header";
import { getUserDetails } from '@/services/userService'; 
import { updateUserAddress, placeOrder } from '@/services/orderService';
import { handleStripePayment } from '@/services/paymentService';
import '@/styles/Checkout.css';

const Checkout = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    streetNo: '',
    village: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
  });

  // State for any error messages
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for order summary
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    shipping: 300.00,
    total: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear any errors for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.streetNo.trim()) {
      newErrors.streetNo = 'Street Number is required';
    }
    if (!formData.village.trim()) {
      newErrors.village = 'Village is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        const addressData = {
          streetNo: formData.streetNo,
          village: formData.village,
          city: formData.city,
          postalCode: formData.postalCode,
        };
  
        console.log('Address Data:', addressData);
  
        await updateUserAddress(addressData);
        // Prepare the order data
        const orderData = {
          items: orderSummary.items.map((item) => ({
            productID: item.id, // Use productID (uppercase D)
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice: orderSummary.total, // Use totalPrice, not totalAmount
          paymentMethod: formData.paymentMethod,
        };
  
        // Place the order
        const response = await placeOrder(orderData);

        localStorage.setItem('orderId', response.orderId);

        if (formData.paymentMethod === 'cod') {
          router.push('/CashOnDeliverySuccessful'); // Redirect to order confirmation page
        }        
  
        if (formData.paymentMethod === 'stripe') {
          await handleStripePayment(orderSummary, response.orderId); // Use the payment service
        } else {
          console.log('COD order placed:', formData);
          alert('Order placed with Cash on Delivery!');
        }
      } catch (error) {
        console.error('Error placing order:', error.message);
        alert('Failed to place order. Please try again.');
      }
    } else {
      console.log('Form has errors');
    }
  };

  useEffect(() => {
    // Extract product data from query parameters
    const productId = searchParams.get('id');
    const productName = searchParams.get('name');
    const productPrice = parseFloat(searchParams.get('price')) || 0;
    const productQuantity = parseInt(searchParams.get('quantity')) || 1;

    if (productId && productName && productPrice) {
      const subtotal = productPrice * productQuantity;
      const total = subtotal + orderSummary.shipping;

      setOrderSummary({
        items: [
          {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: productQuantity,
          },
        ],
        subtotal,
        shipping: orderSummary.shipping,
        total,
      });
    }
  }, [searchParams]);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userDetails = await getUserDetails(); // Fetch user details from the backend
        setFormData((prevFormData) => ({
          ...prevFormData,
          name: userDetails.name || '',
          email: userDetails.email || '',
          phoneNumber: (userDetails.phoneNumbers && userDetails.phoneNumbers[0]) || '',
          streetNo: userDetails.streetNo || '',
          village: userDetails.village || '',
          city: userDetails.city || '',
          postalCode: userDetails.postalCode || '',
        }));
      } catch (error) {
        console.error('Error fetching user details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    // Retrieve cart items from local storage
    const storedCartItems = localStorage.getItem('cartItems');
    const cartItems = storedCartItems ? JSON.parse(storedCartItems) : [];

    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const total = subtotal + orderSummary.shipping;

      setOrderSummary({
        items: cartItems,
        subtotal,
        shipping: orderSummary.shipping,
        total,
      });
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="checkout-page">
      <Header isHomePage={true}/>
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-content">
          <div className="checkout-form-container">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Customer Information Section */}
              <section className="checkout-section">
                <h2 className="section-title">Customer Information</h2>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                    disabled // Email should not be editable
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'input-error' : ''}
                      disabled
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={errors.phoneNumber ? 'input-error' : ''}
                      disabled
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                  </div>
                </div>
              </section>

              {/* Shipping Address Section */}
              <section className="checkout-section">
                <h2 className="section-title">Shipping Address</h2>
                <div className="form-group">
                  <label htmlFor="streetNo">Street Number</label>
                  <input
                    type="text"
                    id="streetNo"
                    name="streetNo"
                    value={formData.streetNo}
                    onChange={handleChange}
                    className={errors.streetNo ? 'input-error' : ''}
                  />
                  {errors.streetNo && <span className="error-message">{errors.streetNo}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="village">Village</label>
                    <input
                      type="text"
                      id="village"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      className={errors.village ? 'input-error' : ''}
                    />
                    {errors.village && <span className="error-message">{errors.village}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? 'input-error' : ''}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={errors.postalCode ? 'input-error' : ''}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section className="checkout-section">
                <h2 className="section-title">Payment Method</h2>
                <div className="payment-options">
                  <div className="payment-option">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <label htmlFor="cod" className="payment-label">Cash on Delivery</label>
                  </div>

                  <div className="payment-option">
                    <input
                      type="radio"
                      id="stripe"
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={handleChange}
                    />
                    <label htmlFor="stripe" className="payment-label">Stripe</label>
                  </div>
                </div>
              </section>

              <button type="submit" className="checkout-button">Place Order</button>
            </form>
          </div>
            <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {orderSummary.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <span className="item-quantity">{item.quantity} x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <span className="item-price">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs.{orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>Rs.{orderSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs.{orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
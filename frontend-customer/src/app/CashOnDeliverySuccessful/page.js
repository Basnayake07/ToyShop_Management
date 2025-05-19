'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Home, ShoppingBag, Truck, Package } from 'lucide-react';
import '@/styles/PaymentSuccessful.css';

const CodSuccessful = () => {
  const router = useRouter();

  useEffect(() => {
    // Animation logic for success icon
    const timer = setTimeout(() => {
      const checkmark = document.querySelector('.success-icon');
      if (checkmark) checkmark.classList.add('animate-success');
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  
  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/OrderHistory');
  };

  return (
    <div className="payment-page">
      <div className="success-container">
        
        {/* Success Icon */}
        <div className="icon-wrapper">
          <CheckCircle className="success-icon" />
        </div>
        
        {/* Content */}
        <h1 className="success-title">Ordered Successful!</h1>
        
        <div className="success-message">
          <p className="message-primary">
            Thank you for your Order!
          </p>
          <p className="message-secondary">
            Your order has been confirmed and will be shipped shortly.
          </p>
        </div>
        
        {/* Order Details Card */}
        <div className="order-details-card">
          <div className="order-detail-row">
            <div className="order-detail-col">
              <span className="detail-label">Order Number</span>
              <span className="detail-value">ORD-123456</span>
            </div>
            <div className="order-detail-col">
              <span className="detail-label">Date</span>
              <span className="detail-value">May 16, 2025</span>
            </div>
          </div>
          
          <div className="order-detail-row">
            <div className="order-detail-col">
              <span className="detail-label">Total</span>
              <span className="detail-value highlight">Rs.87.33</span>
            </div>
            <div className="order-detail-col">
              <span className="detail-label">Payment Method</span>
              <span className="detail-value">Credit Card</span>
            </div>
          </div>
        </div>
        
        {/* Order Status Timeline */}
        <div className="order-status-timeline">
          <div className="timeline-step active">
            <div className="step-icon">
              <CheckCircle size={20} />
            </div>
            <div className="step-connector active"></div>
            <div className="step-label">Order Confirmed</div>
          </div>
          
          <div className="timeline-step">
            <div className="step-icon">
              <Package size={20} />
            </div>
            <div className="step-connector"></div>
            <div className="step-label">Shipping</div>
          </div>
          
          <div className="timeline-step">
            <div className="step-icon">
              <Truck size={20} />
            </div>
            <div className="step-label">Delivered</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="button-container">
          <button 
            onClick={handleGoHome}
            className="button button-primary"
          >
            <Home size={18} />
            <span>Return Home</span>
          </button>
          
          <button 
            onClick={handleViewOrders}
            className="button button-secondary"
          >
            <ShoppingBag size={18} />
            <span>My Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodSuccessful;
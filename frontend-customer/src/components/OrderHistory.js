'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCustomerOrders, addOrUpdateReview} from '@/services/userService';
import AlertComponent from '@/components/AlertComponent';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import '@/styles/OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ severity: '', title: '', message: '' });
  const [reviewModal, setReviewModal] = useState({
  open: false,
  productID: null,
  productName: '',
  comment: '',
  rating: 5
});
const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomerOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        setAlert({ severity: 'error', title: 'Error', message: error.message });
        setLoading(false);
      });
  }, []);

  const closeAlert = () => setAlert({ severity: '', title: '', message: '' });

  const getStatusColor = (status) => {
    const statusMap = {
      'Delivered': 'success',
      'Processing': 'info',
      'Shipped': 'primary',
      'Cancelled': 'error',
      'Pending': 'warning'
    };
    return statusMap[status] || 'info';
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openReviewModal = (productID, productName) => {
  setReviewModal({ open: true, productID, productName, comment: '', rating: 5 });
};

const closeReviewModal = () => {
  setReviewModal({ open: false, productID: null, productName: '', comment: '', rating: 5 });
};

const handleReviewSubmit = async () => {
  setReviewLoading(true);
  try {
    await addOrUpdateReview({
      productID: reviewModal.productID,
      customerRating: reviewModal.rating,
      comment: reviewModal.comment
    });
    setAlert({ severity: 'success', title: 'Success', message: 'Review submitted!' });
    closeReviewModal();
  } catch (error) {
    setAlert({ severity: 'error', title: 'Error', message: error.message });
  }
  setReviewLoading(false);
};

  return (
    <div className="order-history-container">
      <Header />
      <main className="order-history-main">
        <div className="sidebar-section">
          <Sidebar />
        </div>
        <div className="orders-content">
          <div className="page-header">
            <h2 className="page-title">Your Order History</h2>
            <p className="page-subtitle">Track and manage all your previous orders</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <div className="empty-state-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button className="shop-now-btn">Browse Products</button>
            </div>
          ) : (
            <div className="order-history">
              {orders.map(order => (
                <div key={order.orderID} className="order-card">
                  <div className="order-header">
                    <div className="order-details-col">
                      <div className="order-id">
                        <span className="label">Order ID:</span>
                        <span className="value">{order.orderID}</span>
                      </div>
                      <div className="order-date">
                        <span className="label">Ordered on:</span>
                        <span className="value">{formatDate(order.orderDate)}</span>
                      </div>
                    </div>
                    <div className="order-status-col">
                      <div className={`status-badge ${getStatusColor(order.payStatus)}`}>
                        {order.payStatus}
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-items-section">
                    <h3 className="items-heading">Items in your order</h3>
                    <ul className="order-items-list">
                      {order.items.map(item => (
                            <li key={item.orderItemID} className="order-item">
                                <div className="order-item-image">
                                {item.image ? (
                                    <Image
                                    src={item.image}
                                    alt={item.productName}
                                    width={56}
                                    height={56}
                                    className="product-image"
                                    />
                                ) : (
                                    <div className="placeholder-image">
                                    <span>No image</span>
                                    </div>
                                )}
                                </div>
                                <div className="order-item-details">
                                <span className="order-item-name">{item.productName}</span>
                                <div className="order-item-meta">
                                    <span className="quantity">Qty: {item.quantity}</span>
                                    <span className="price">Rs. {item.price.toLocaleString()}</span>
                                </div>
                                <button
                                    className="action-btn review-btn"
                                    style={{ marginTop: 8 }}
                                    onClick={() => openReviewModal(item.productID, item.productName)}
                                >
                                    Add Review
                                </button>
                                </div>
                            </li>
                            ))}
                    </ul>
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-summary">
                      <div className="summary-item">
                        <span>Items:</span>
                        <span>{order.items.reduce((total, item) => total + item.quantity, 0)}</span>
                      </div>
                      <div className="summary-item total">
                        <span>Total Amount:</span>
                        <span>Rs. {order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="order-actions">
                      <button className="action-btn details-btn">View Details</button>
                      <button className="action-btn invoice-btn">Download Invoice</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {alert.message && (
        <AlertComponent
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          onClose={closeAlert}
          sx={{ width: '350px', position: 'fixed', top: '80px', right: '24px', zIndex: 9999 }}
        />
      )}
        {reviewModal.open && (
  <div className="review-modal-backdrop">
    <div className="review-modal">
      <h3>Add Review for {reviewModal.productName}</h3>
      <label>
        Rating:
        <select
          value={reviewModal.rating}
          onChange={e => setReviewModal({ ...reviewModal, rating: Number(e.target.value) })}
          disabled={reviewLoading}
        >
          {[5,4,3,2,1].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        Comment:
        <textarea
          value={reviewModal.comment}
          onChange={e => setReviewModal({ ...reviewModal, comment: e.target.value })}
          rows={3}
          disabled={reviewLoading}
        />
      </label>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleReviewSubmit} disabled={reviewLoading}>
          {reviewLoading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button onClick={closeReviewModal} style={{ marginLeft: 8 }} disabled={reviewLoading}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default OrderHistory;
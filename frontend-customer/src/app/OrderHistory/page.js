'use client';

import React, { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import Footer from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import OrderCard from '@/components/OrderCard';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { getOrders } from '@/services/orderService';
import '@/styles/MyOrders.css';

// TabPanel component to handle tab content display
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      className="orders-tabpanel"
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Function to get props for accessibility
function a11yProps(index) {
  return {
    id: `orders-tab-${index}`,
    'aria-controls': `orders-tabpanel-${index}`,
  };
}

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [toBeReviewedOrders, setToBeReviewedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch orders data from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await getOrders();

        // Categorize orders based on their status
        const pending = orders.filter(order => order.deliveryStatus === 'Pending');
        const completed = orders.filter(order => order.deliveryStatus === 'Completed');
        const toReview = orders.filter(order => order.deliveryStatus === 'Delivered');

        setPendingOrders(pending);
        setCompletedOrders(completed);
        setToBeReviewedOrders(toReview);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="myorders-all">
      <Header/>
      <main className="main-myorders-content">
        <div className="myorders-sidebar-section">
          <Sidebar />
        </div>
        
        <div className="myorders-main-section">
          <Typography variant="h4" component="h1" className="myorders-title">
            My Orders
          </Typography>
          
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="order tabs"
                className="order-tabs"
              >
                <Tab label={`Pending (${pendingOrders.length})`} {...a11yProps(0)} />
                <Tab label={`Completed (${completedOrders.length})`} {...a11yProps(1)} />
                <Tab label={`To Be Reviewed (${toBeReviewedOrders.length})`} {...a11yProps(2)} />
              </Tabs>
            </Box>
            
            {loading ? (
              <Box className="loading-container">
                <CircularProgress />
                <Typography>Loading orders...</Typography>
              </Box>
            ) : (
              <>
                <TabPanel value={activeTab} index={0}>
                  {pendingOrders.length > 0 ? (
                    <div className="orders-grid">
                      {pendingOrders.map(order => (
                        <OrderCard key={order.orderID} order={order} />
                      ))}
                    </div>
                  ) : (
                    <Typography className="no-orders-message">No pending orders</Typography>
                  )}
                </TabPanel>
                
                <TabPanel value={activeTab} index={1}>
                  {completedOrders.length > 0 ? (
                    <div className="orders-grid">
                      {completedOrders.map(order => (
                        <OrderCard key={order.orderID} order={order} />
                      ))}
                    </div>
                  ) : (
                    <Typography className="no-orders-message">No completed orders</Typography>
                  )}
                </TabPanel>
                
                <TabPanel value={activeTab} index={2}>
                  {toBeReviewedOrders.length > 0 ? (
                    <div className="orders-grid">
                      {toBeReviewedOrders.map(order => (
                        <OrderCard key={order.orderID} order={order} />
                      ))}
                    </div>
                  ) : (
                    <Typography className="no-orders-message">No orders to review</Typography>
                  )}
                </TabPanel>
              </>
            )}
          </Box>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
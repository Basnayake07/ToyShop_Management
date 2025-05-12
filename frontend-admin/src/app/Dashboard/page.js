'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import CardComponent from "@/components/CardComponent";
import SalesChart from "@/components/salesChart";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import DashboardIcon from "@mui/icons-material/Dashboard";
import "@/styles/Dashboard.css";

const Dashboard = () => {
    const [details, setDetails] = useState({});
    const [salesData, setSalesData] = useState([]);
    const router = useRouter();

    // Fetch dashboard details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/dashboard/summary");
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard details");
                }
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error("Error fetching dashboard details:", error);
            }
        };

        fetchDetails();
    }, []);

    // Fetch sales chart data
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/dashboard/sales-chart");
                if (!response.ok) {
                    throw new Error("Failed to fetch sales chart data");
                }
                const data = await response.json();
                setSalesData(data);
            } catch (error) {
                console.error("Error fetching sales chart data:", error);
            }
        };

        fetchSalesData();
    }, []);

    // Navigate to low stock details page
    const handleLowStockClick = () => {
        router.push('/LowStockDetails');
    };

    // Card details with icons and colors
    const cardDetails = [
        { 
          title: 'Pending Orders', 
          value: details.PendingOrders || 0, 
          description: 'Total number of pending orders',
          icon: <DashboardIcon />,
          color: '#4361ee'
        },
        { 
          title: 'Total Revenue', 
          value: `Rs.${details.TotalRevenue || 0}`, 
          description: 'Total revenue from paid orders',
          icon: <DashboardIcon />,
          color: '#3a0ca3'
        },
        { 
          title: 'Total Customers', 
          value: details.TotalCustomers || 0, 
          description: 'Total number of customers',
          icon: <DashboardIcon />,
          color: '#4cc9f0'
        },
        { 
          title: 'Total Products', 
          value: details.TotalProducts || 0, 
          description: 'Total number of products',
          icon: <DashboardIcon />,
          color: '#f72585'
        },
        { 
          title: 'Return Requests', 
          value: details.PendingOrderReturns || 0, 
          description: 'Total number of  returns',
          icon: <DashboardIcon />,
          color: '#ff9e00'
        },
        { 
          title: 'Low Stock Products', 
          value: details.LowStockProducts || 0, 
          description: 'Click To See Details', 
          onClick: handleLowStockClick,
          icon: <DashboardIcon />,
          color: '#ef233c'
        },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="container">
                <h1>Admin Dashboard</h1>
                <div className="dashboard-content">
                    <div className="cards-section">
                        <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            {cardDetails.map((detail, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                <CardComponent
                                    title={detail.title}
                                    value={detail.value}
                                    description={detail.description}
                                    icon={detail.icon}
                                    color={detail.color}
                                    onClick={detail.onClick}
                                />
                                </Grid>
                            ))}
                            </Grid> 
                        </Box>
                    </div>
                    
                    <div className="sales-chart">
                        <h2>Sales Chart</h2>
                        <p>Sales Revenue of Last 7 Days</p>
                        <SalesChart data={salesData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
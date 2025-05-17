'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import CardComponent from "@/components/CardComponent";
import SalesChart from "@/components/salesChart";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import "@/styles/Dashboard.css";

const Dashboard = () => {
    const [details, setDetails] = useState({});
    const [salesData, setSalesData] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [partiallyPaidCount, setPartiallyPaidCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch dashboard details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8081/api/dashboard/summary");
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard details");
                }
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error("Error fetching dashboard details:", error);
            } finally {
                setLoading(false);
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

    
    // Fetch low stock count
    useEffect(() => {
        const fetchLowStockCount = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/dashboard/low-stock/count");
                if (!response.ok) throw new Error("Failed to fetch low stock count");
                const data = await response.json();
                setLowStockCount(data.lowStockCount || 0);
            } catch (error) {
                console.error("Error fetching low stock count:", error);
            }
        };
        fetchLowStockCount();
    }, []);

    // Navigate to low stock details page
    const handleLowStockClick = () => {
        router.push('/LowStockDetails');
    };

    // Fetch partially paid customers count
    useEffect(() => {
        const fetchPartiallyPaidCount = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/dashboard/partially-paid-customers/count");
                if (!response.ok) throw new Error("Failed to fetch partially paid customer count");
                const data = await response.json();
                setPartiallyPaidCount(data.partiallyPaidCustomerCount || 0);
            } catch (error) {
                console.error("Error fetching partially paid customer count:", error);
            }
        };
        fetchPartiallyPaidCount();
    }, []);

    // Navigate to partially paid customers details page
    const handlePartiallyPaidClick = () => {
        router.push('/PartiallyPaidCus');
    };


    // Card details with icons and colors
    const cardDetails = [
        { 
          title: 'Pending Orders', 
          value: details.PendingOrders || 0, 
          description: 'Total pending orders',
          icon: <ShoppingCartOutlinedIcon />,
          color: '#3498db'
        },
        { 
          title: 'Total Revenue', 
          value: `Rs.${details.TotalRevenue || 0}`, 
          description: 'Revenue from paid orders',
          icon: <AccountBalanceWalletOutlinedIcon />,
          color: '#2ecc71'
        },
        { 
          title: 'Total Customers', 
          value: details.TotalCustomers || 0, 
          description: 'Registered customers',
          icon: <PeopleAltOutlinedIcon />,
          color: '#9b59b6'
        },
        { 
          title: 'Total Products', 
          value: details.TotalProducts || 0, 
          description: 'Available products',
          icon: <InventoryOutlinedIcon />,
          color: '#f39c12'
        },
        { 
          title: 'Return Requests', 
          value: details.PendingOrderReturns || 0, 
          description: 'Pending returns',
          icon: <AssignmentReturnOutlinedIcon />,
          color: '#1abc9c'
        },
        { 
          title: 'Low Stock Products', 
          value: lowStockCount,
          description: 'Click for details', 
          onClick: handleLowStockClick,
          icon: <WarningAmberOutlinedIcon />,
          color: '#e74c3c'
        },
        {
          title: 'Partially Paid Customers',
          value: partiallyPaidCount || 0,
          description: 'Customers with partial payments',
          icon: <AccountBalanceWalletOutlinedIcon />, 
          color: '#ff9800',
          onClick: handlePartiallyPaidClick
        },
    ];

    // Split card details for the two rows
    const firstRowCards = cardDetails.slice(0, 4); // First 4 cards
    const secondRowCards = cardDetails.slice(4);   // Remaining 3 cards

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="container">
                <h1>Admin Dashboard</h1>
                <div className="dashboard-content">
                    <div className="cards-section">
                        {/* First row with 4 cards */}
                        <div className="cards-row first-row">
                            {firstRowCards.map((detail, index) => (
                                <CardComponent
                                    key={index}
                                    title={detail.title}
                                    value={detail.value}
                                    description={detail.description}
                                    icon={detail.icon}
                                    color={detail.color}
                                    onClick={detail.onClick}
                                    loading={loading}
                                />
                            ))}
                        </div>
                        
                        {/* Second row with 3 cards */}
                        <div className="cards-row second-row">
                            {secondRowCards.map((detail, index) => (
                                <CardComponent
                                    key={index + 4}
                                    title={detail.title}
                                    value={detail.value}
                                    description={detail.description}
                                    icon={detail.icon}
                                    color={detail.color}
                                    onClick={detail.onClick}
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="sales-chart">
                        <h2>Sales Overview</h2>
                        <p>Revenue trends for the past 7 days</p>
                        <SalesChart data={salesData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
'use client';

import React from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from 'next/navigation';
import "@/styles/Dashboard.css";

const Dashboard = () => {
    const router = useRouter();

    const handleLogout = () => {
        router.push("/Login");
    };
    
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="container">
                <h1> Admin Dashboard</h1>
                <button onClick={handleLogout} className="logout">Logout</button>
            </div>
        </div>
    );
}

export default Dashboard;
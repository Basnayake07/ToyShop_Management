'use client';

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const PartiallyPaidCus = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/dashboard/partially-paid-customers");
        if (!response.ok) throw new Error("Failed to fetch partially paid customers");
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching partially paid customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="container">
        <h1>Partially Paid Customers</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
            <thead>
              <tr>
                <th style={{ padding: 12 }}>Customer ID</th>
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Phone Number</th>
                <th style={{ padding: 12 }}>Type</th>
                <th style={{ padding: 12 }}>Order ID</th>
                <th style={{ padding: 12 }}>Invoice ID</th>
                <th style={{ padding: 12 }}>Received Amount</th>
                <th style={{ padding: 12 }}>Credit Amount</th>
                <th style={{ padding: 12 }}>Discount</th>
                <th style={{ padding: 12 }}>Issue Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 24 }}>
                    No partially paid customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 12 }}>{c.cusID}</td>
                    <td style={{ padding: 12 }}>{c.name}</td>
                    <td style={{ padding: 12 }}>{c.phoneNumber || "-"}</td>
                    <td style={{ padding: 12 }}>{c.cusType}</td>
                    <td style={{ padding: 12 }}>{c.orderID}</td>
                    <td style={{ padding: 12 }}>{c.invoiceID}</td>
                    <td style={{ padding: 12 }}>{c.received_amount}</td>
                    <td style={{ padding: 12 }}>{c.credit_amount}</td>
                    <td style={{ padding: 12 }}>{c.discount}</td>
                    <td style={{ padding: 12 }}>{formatDate(c.issue_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PartiallyPaidCus;
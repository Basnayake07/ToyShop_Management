'use client';

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaPrint } from "react-icons/fa";
import "@/styles/Dashboard.css";

const LowStockDetails = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/dashboard/low-stock");
        if (!response.ok) throw new Error("Failed to fetch low stock products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStockProducts();
  }, []);

  // Get unique categories for the filter dropdown
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(p => p.category === selectedCategory);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); // landscape for more width
    doc.setFontSize(14);
    doc.text(
      `Low Stock Products${selectedCategory !== "All" ? ` - ${selectedCategory}` : ""}`,
      14,
      14
    );

    // Table headers and column positions
    const headers = ["Product ID", "Name", "Category", "Quantity", "Min Stock"];
    const colWidths = [30, 60, 50, 30, 30];
    const startX = 14;
    const startY = 22;
    const rowHeight = 8;

    // Print headers
    let x = startX;
    headers.forEach((header, i) => {
      doc.setFontSize(11);
      doc.text(header, x, startY);
      x += colWidths[i];
    });

    // Print rows
    filteredProducts.forEach((p, rowIdx) => {
      let rowY = startY + rowHeight * (rowIdx + 1);
      let x = startX;
      doc.setFontSize(9);
      doc.text(String(p.productID), x, rowY);
      x += colWidths[0];
      doc.text(String(p.product_name), x, rowY);
      x += colWidths[1];
      doc.text(String(p.category), x, rowY);
      x += colWidths[2];
      doc.text(String(p.quantity), x, rowY);
      x += colWidths[3];
      doc.text(String(p.minStock), x, rowY);
    });

    doc.save("low_stock_products.pdf");
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="container">
        <h1>Low Stock Products</h1>
        {/* Category Filter Dropdown */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="category-filter" style={{ fontWeight: 500 }}>Filter by Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleDownloadPDF}
            style={{
              marginLeft: "auto",
              padding: "6px 10px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
            }}
            title="Print PDF"
            //disabled={filteredProducts.length === 0}
          >
            <FaPrint />
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="dashboard-content">
            <table style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
              <thead>
                <tr>
                  <th style={{ padding: 12, textAlign: "left" }}>Product ID</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Category</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Quantity</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                      No low stock products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.productID}>
                      <td style={{ padding: 12 }}>{p.productID}</td>
                      <td style={{ padding: 12 }}>{p.product_name}</td>
                      <td style={{ padding: 12 }}>{p.category}</td>
                      <td style={{ padding: 12 }}>{p.quantity}</td>
                      <td style={{ padding: 12 }}>{p.minStock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockDetails;
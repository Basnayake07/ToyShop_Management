'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import { Search, Download, AlertTriangle } from 'lucide-react';
import Button from '@mui/material/Button';
import '@/styles/InventoryReport.css';
import { getInventoryReport } from '@/components/ReportService';

const InventoryReport = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'ascending' });

  // Fetch data from the backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await getInventoryReport();
        setInventory(data);
        setFilteredInventory(data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let results = inventory;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(item =>
        (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.productID && item.productID.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      results = results.filter(item => item.category === categoryFilter);
    }

    // Apply stock status filter
    if (stockStatusFilter !== 'all') {
      if (stockStatusFilter === 'low') {
        results = results.filter(item => item.quantity < item.minStock);
      } else if (stockStatusFilter === 'normal') {
        results = results.filter(item => item.quantity >= item.minStock);
      }
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredInventory(results);
  }, [inventory, searchTerm, categoryFilter, stockStatusFilter, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const getStockStatusClass = (item) => {
    return item.quantity < item.minStock ? 'low-stock' : 'normal-stock';
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(inventory.map(item => item.category).filter(Boolean))];

  // Calculate summary stats
  const totalProducts = filteredInventory.length;
  const lowStockProducts = filteredInventory.filter(item => item.quantity < item.minStock).length;
  const totalInventoryValue = filteredInventory.reduce((acc, item) => acc + (item.quantity * (item.cost || 0)), 0).toFixed(2);
  const potentialRevenue = filteredInventory.reduce((acc, item) => acc + (item.quantity * (item.retailPrice || 0)), 0).toFixed(2);

  const handleExport = () => {
    // Convert table data to CSV
    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Stock',
      'Min Stock',
      'Cost',
      'Wholesale Price',
      'Retail Price',
      'Batch ID',
      'Received Date',
      'Availability'
    ];
    const rows = filteredInventory.map(item => [
      item.productID,
      item.productName,
      item.category,
      item.quantity,
      item.minStock,
      Number(item.cost || 0).toFixed(2),
      Number(item.wholesalePrice || 0).toFixed(2),
      Number(item.retailPrice || 0).toFixed(2),
      item.batchID,
      item.receivedDate,
      item.availability
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create a downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'InventoryReport.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar on the left */}
      <div style={{ flex: "0 0 240px", zIndex: 2 }}>
        <Sidebar />
      </div>
      {/* Main content on the right */}
      <main style={{ flex: 1, padding: "32px 24px 24px 24px", background: "#f5f5f5" }}>
        <div className="page-header">
          <h1 className="page-title">Inventory Report</h1>
          <div className="action-buttons">
            <Button
              variant="contained"
              className="export-btn"
              startIcon={<Download size={16} />}
              onClick={handleExport}
            >
              Export Report
            </Button>
          </div>
        </div>

        <div className="inventory-summary">
          <div className="inventoryreport-summary-card">
            <h3>Total Products</h3>
            <p>{totalProducts}</p>
          </div>
          <div className="inventoryreport-summary-card warning">
            <h3>Low Stock Items</h3>
            <p>{lowStockProducts}</p>
            {lowStockProducts > 0 && <AlertTriangle className="alert-icon" size={20} />}
          </div>
          <div className="inventoryreport-summary-card">
            <h3>Inventory Value</h3>
            <p>Rs.{totalInventoryValue}</p>
          </div>
          <div className="inventoryreport-summary-card">
            <h3>Potential Revenue</h3>
            <p>Rs.{potentialRevenue}</p>
          </div>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Stock Status:</label>
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="low">Low Stock</option>
                <option value="normal">Normal Stock</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading inventory data...</p>
          </div>
        ) : (
          <>
            {filteredInventory.length === 0 ? (
              <div className="no-results">
                <p>No products match your search criteria.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('productID')}>
                        Product ID{getSortIndicator('productID')}
                      </th>
                      <th onClick={() => handleSort('productName')}>
                        Product Name{getSortIndicator('productName')}
                      </th>
                      <th onClick={() => handleSort('category')}>
                        Category{getSortIndicator('category')}
                      </th>
                      <th onClick={() => handleSort('quantity')}>
                        Stock{getSortIndicator('quantity')}
                      </th>
                      <th onClick={() => handleSort('minStock')}>
                        Min Stock{getSortIndicator('minStock')}
                      </th>
                      <th onClick={() => handleSort('cost')}>
                        Cost{getSortIndicator('cost')}
                      </th>
                      <th onClick={() => handleSort('wholesalePrice')}>
                        Wholesale Price{getSortIndicator('wholesalePrice')}
                      </th>
                      <th onClick={() => handleSort('retailPrice')}>
                        Retail Price{getSortIndicator('retailPrice')}
                      </th>
                      <th onClick={() => handleSort('batchID')}>
                        Batch ID{getSortIndicator('batchID')}
                      </th>
                      <th onClick={() => handleSort('receivedDate')}>
                        Received Date{getSortIndicator('receivedDate')}
                      </th>
                      <th onClick={() => handleSort('availability')}>
                        Availability{getSortIndicator('availability')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item, idx) => (
                      <tr key={item.productID + '-' + idx} className={getStockStatusClass(item)}>
                        <td>{item.productID}</td>
                        <td>{item.productName}</td>
                        <td>{item.category}</td>
                        <td className="stock-cell">
                          <span className={`stock-badge ${item.quantity < item.minStock ? 'low' : 'normal'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>{item.minStock}</td>
                        <td>Rs.{Number(item.cost || 0).toFixed(2)}</td>
                        <td>Rs.{Number(item.wholesalePrice || 0).toFixed(2)}</td>
                        <td>Rs.{Number(item.retailPrice || 0).toFixed(2)}</td>
                        <td>{item.batchID}</td>
                        <td>{item.receivedDate}</td>
                        <td>{item.availability ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InventoryReport;
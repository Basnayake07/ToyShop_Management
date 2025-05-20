'use client';
import React, { useState, useEffect } from 'react';

import Sidebar from "@/components/Sidebar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer,
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getSalesReport } from '@/components/ReportService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '@/styles/SalesReport.css';
import autoTable from 'jspdf-autotable';

const SalesReport = () => {
  const [timeframe, setTimeframe] = useState('Monthly');
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  // Fetch sales data from the backend
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const { salesData } = await getSalesReport(timeframe); // Pass timeframe to the service
        setSalesData(salesData); // Set the fetched data
      } catch (error) {
        console.error('Error fetching sales report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [timeframe]); // Re-fetch data when timeframe changes

  // Calculate summary metrics
  const totalOrdersSum = salesData.reduce((sum, item) => sum + Number(item.orders || 0), 0);
  const totalProductsSold = salesData.reduce((sum, item) => sum + Number(item.productsSold || 0), 0);  
  const totalSalesAmount = salesData.reduce((sum, item) => sum + Number(item.totalSales || 0), 0);

  // Function to download the report as a CSV file
  const handleDownloadCSV = () => {
    // Convert salesData to CSV format
    const headers = ['Period', 'Total Sales', 'Orders', 'Products Sold', 'Top Product'];
    const rows = salesData.map(row => [
      row.period,
      row.totalSales,
      row.orders,
      row.productsSold,
      row.topProduct,
    ]);

    const csvContent = [
      headers.join(','), // Add headers
      ...rows.map(row => row.join(',')), // Add rows
    ].join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Report_${timeframe}.csv`); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download the report as a PDF file
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 20);

    // Add timeframe
    doc.setFontSize(12);
    doc.text(`Timeframe: ${timeframe}`, 14, 30);

    // Add table
    const headers = [['Period', 'Total Sales', 'Orders', 'Products Sold', 'Top Product']];
    const rows = salesData.map(row => [
      row.period,
      `Rs. ${Number(row.totalSales).toLocaleString()}`,
      row.orders,
      row.productsSold,
      row.topProduct,
    ]);

    // Use autoTable to add the table to the PDF
    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [10, 47, 110], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Save the PDF
    doc.save(`Sales_Report_${timeframe}.pdf`);
  };

  return (
    <div className="sales-report-page">
      <main className="salesreport-content">
        <div className="salesreport-sidebar">
          <Sidebar />
        </div>
        <div className="salesreport-main">
          <Box className="salesreport-header">
            <Typography variant="h4" component="h1" className="page-title">Sales Report</Typography>
            <Box className="salesreport-actions">
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                className="action-button"
                onClick={handleDownloadCSV}
              >
                Download CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                className="action-button"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
          
          {isLoading ? (
            <Box className="loading-container">
              <CircularProgress size={50} thickness={4} />
              <Typography variant="h6">Loading sales data...</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3} className="sales-summary">
                <Grid item xs={12} md={4}>
                  <Card className="summary-card">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Sales</Typography>
                      <Typography variant="h5" component="h2">Rs. {totalSalesAmount.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="summary-card">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Orders</Typography>
                      <Typography variant="h5" component="h2">{totalOrdersSum.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="summary-card">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Products Sold</Typography>
                      <Typography variant="h5" component="h2">{totalProductsSold.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box className="table-filters">
                <FormControl variant="outlined" className="timeframe-select">
                  <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
                  <Select
                    labelId="timeframe-select-label"
                    id="timeframe-select"
                    value={timeframe}
                    onChange={handleTimeframeChange}
                    label="Timeframe"
                  >
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <TableContainer component={Paper} className="sales-table-container">
                <Table aria-label="sales report table" className="sales-table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header">{timeframe}</TableCell>
                      <TableCell className="table-header">Total Sales</TableCell>
                      <TableCell className="table-header">Orders</TableCell>
                      <TableCell className="table-header">Products Sold</TableCell>
                      <TableCell className="table-header">Top Product</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.map((row, index) => (
                      <TableRow 
                        key={index}
                        className={index % 2 === 0 ? 'even-row' : 'odd-row'}
                      >
                        <TableCell>{row.period}</TableCell>
                        <TableCell>Rs. {Number(row.totalSales).toLocaleString()}</TableCell>
                        <TableCell>{row.orders}</TableCell>
                        <TableCell>{row.productsSold}</TableCell>
                        <TableCell>{row.topProduct}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesReport;
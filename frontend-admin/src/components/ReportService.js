import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/reports'; // Update port if your backend runs on 8080

// Fetch Inventory Report
export const getInventoryReport = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw new Error('Failed to fetch inventory report.');
  }
};

// Fetch Sales Report
export const getSalesReport = async (timeframe) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sales`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
      },
      params: { timeframe }, // Pass timeframe as a query parameter
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw new Error('Failed to fetch sales report.');
  }
};

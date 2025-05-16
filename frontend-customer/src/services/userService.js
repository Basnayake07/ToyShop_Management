import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/user';

export const getUserDetails = async () => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    const response = await axios.get(`${API_BASE_URL}/cus`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

export const updateUserDetails = async (userDetails) => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    const response = await axios.put(`${API_BASE_URL}/cus`, userDetails, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update user details');
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    const response = await axios.put(`${API_BASE_URL}/cus/password`, passwordData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const getCustomerOrders = async () => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    const response = await axios.get('http://localhost:8082/api/user/orders', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer orders:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
  }
};
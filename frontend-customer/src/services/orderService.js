import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/order';

export const updateUserAddress = async (userDetails) => {
    try {
        const token = sessionStorage.getItem('jwtToken');
        // Only send the relevant fields
        const payload = {
            streetNo: userDetails.streetNo,
            village: userDetails.village,
            city: userDetails.city,
            postalCode: userDetails.postalCode,
        };
        const response = await axios.put(`${API_BASE_URL}/update-address`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating user address:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update user address');
    }
};

export const placeOrder = async (orderData) => {
    try {
        const token = sessionStorage.getItem('jwtToken'); // Get the token from sessionStorage
        const response = await axios.post(`${API_BASE_URL}/place-order`, orderData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
        });

        return response.data; // Return the response from the backend
    } catch (error) {
        console.error('Error placing order:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to place order');
    }
};

export const updatePaymentStatus = async (orderId) => {
    try {
      const token = sessionStorage.getItem('jwtToken'); // Get the token from sessionStorage
      const response = await axios.put(`${API_BASE_URL}/update-payment-status`, { orderId }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  export const getOrders = async () => {
    try {
      const token = sessionStorage.getItem('jwtToken'); // Get the token from sessionStorage
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
  
      return response.data; // Return the orders
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  };
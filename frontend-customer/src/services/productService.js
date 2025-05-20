import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api'; // Replace with your backend URL

// Fetch all products
export const getProductCards = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data; // Assuming the backend returns an array of products
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch products by search query
export const searchProducts = async (searchQuery) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/search?search=${encodeURIComponent(searchQuery)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};


export const getProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/category?category=${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Fetch product details by productID
export const getProductDetails = async (productID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productID}`);
    return response.data; // Return the product details
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};
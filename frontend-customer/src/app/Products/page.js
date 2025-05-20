'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/Header";
import ProductCard from '@/components/ProductCard';
import { getProductCards, searchProducts, getProductsByCategory } from '@/services/productService';
import AOS from "aos";
import "aos/dist/aos.css";
import { FormControl, InputLabel, Select,InputAdornment, MenuItem } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(4); // Number of products to display initially
  const searchParams = useSearchParams(); // Get query parameters from the URL
  const searchQuery = searchParams.get('search');
  const category = searchParams.get('category');
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    AOS.init({
      duration: 1000,  // Slow animation 
      easing: 'ease-in-out',
      once: false,  // Animation runs every time element enters viewport
      mirror: true, // Ensures animation happens when scrolling up & down
    });

    // Refresh AOS on scroll to ensure animations always work
    const handleScroll = () => {
      AOS.refresh();
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (searchQuery) {
          // Fetch products based on the search query
          const searchResults = await searchProducts(searchQuery);
          setProducts(searchResults);
        } else if (category) {
          // Fetch products based on the category
          const categoryProducts = await getProductsByCategory(category);
          setProducts(categoryProducts);
        } else {
          // Fetch all products if no search query or category is provided
          const productData = await getProductCards();
          setProducts(productData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [searchQuery, category]);

  const handleViewMore = () => {
    setVisibleProducts((prevVisible) => prevVisible + 4); // Show 4 more products
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="Products">
      <Header isHomePage={true} />
      <main className="main-Products-content">
        <div className="Products-content">
          <FormControl variant="outlined" size="small" className="products-sort" style={{ marginTop: '20px', marginLeft: '50px' }} >
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="default">Default</MenuItem>
              {/* <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem> */}
              <MenuItem value="name_asc">Name: A to Z</MenuItem>
              <MenuItem value="name_desc">Name: Z to A</MenuItem>
              <MenuItem value="rating">Top Rated</MenuItem>
            </Select>
        </FormControl>
          <div className="product-grid">
            {sortedProducts.slice(0, visibleProducts).map((product) => (
              <ProductCard key={product.productID} product={product} data-aos="fade-up" />
            ))}
          </div>

          {/* View More Button */}
          {visibleProducts < products.length && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleViewMore}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0A2F6E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                View More
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;

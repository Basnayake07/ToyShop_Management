'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/Header";
import ProductCard from '@/components/ProductCard';
import { getProductCards, searchProducts, getProductsByCategory } from '@/services/productService';
import AOS from "aos";
import "aos/dist/aos.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(4); // Number of products to display initially
  const searchParams = useSearchParams(); // Get query parameters from the URL
  const searchQuery = searchParams.get('search');
  const category = searchParams.get('category');

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

  return (
    <div className="Products">
      <Header isHomePage={true} />
      <main className="main-Products-content">
        <div className="Products-content">
          <div className="product-grid">
            {products.slice(0, visibleProducts).map((product) => (
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

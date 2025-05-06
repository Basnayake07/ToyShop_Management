'use client';

import React, { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import Image from "next/image";
import Carousel from '@/components/Carousel';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import axios from 'axios';
// import { getProductCards } from '@/services/productService';
import Birthday_Decoration from '@/images/BirthdayDecoration.jpg'; 
import Educational_Toys from '@/images/EducationalToys.jpg';
import Soft_Toys from '@/images/SoftToys.jpg';
import Christmas_Decoration from '@/images/ChristmasDecoration.jpg';
import Other_Toys from '@/images/OtherToys.jpg';
import footerTop from '@/images/footerTop.png';
import Divider from '@mui/material/Divider';
import Footer from '@/components/Footer';
import AOS from "aos";
import "aos/dist/aos.css";


const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(4); // Number of products to display initially
  const images = [
    '/images/carousel1.jpg',
    '/images/carousel2.jpg',
    '/images/carousel3.jpg',
    '/images/carousel4.jpg',
  ];

  const fetchProducts = async () => {
    const API_BASE_URL = 'http://localhost:8082/api'; // Backend API URL
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data); // Set the fetched products in state
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,  // Slow animation 
      easing: 'ease-in-out',
      once: false,  // Animation runs every time element enters viewport
      mirror: true, // Ensures animation happens when scrolling up & down
    });

    //Refresh AOS on scroll to ensure animations always work
    const handleScroll = () => {
      AOS.refresh();
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchProducts(); // Fetch products when the component mounts
  }, []);


  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const productData = await getProductCards();
  //     setProducts(productData);
  //   };

  //   fetchProducts();
  // }, []);

  const handleViewMore = () => {
    setVisibleProducts((prevVisible) => prevVisible + 4); // Show 4 more products
  };

  return (
    <div className="HomePage">
      <Header isHomePage={true}/>
      <main className="main-HomePage-content">
        <div className="Home-content">
          <Carousel images={images} autoplay={true} interval={8000} showDots={true} />

          <div className="product-grid">
            {products.slice(0, visibleProducts).map((product) => (
              <ProductCard key={product.productId} product={product} data-aos="fade-up" />
            ))}
          </div>

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

          <div className='Category-title' style={{color: '#0A2F6E', textAlign: 'center', marginTop: '50px', fontSize: '20px'}}>
            <h1 data-aos="zoom-up">Browse By Category</h1>
          </div>

          <div className='category-grid' data-aos="fade-up">                  
            <CategoryCard key="Birthday Deco" icon={Birthday_Decoration} title="Birthday Deco" />
            <CategoryCard key="Educational Toys" icon={Educational_Toys} title="Educational Toys" />
            <CategoryCard key="Soft Toys" icon={Soft_Toys} title="Soft Toys" />
            <CategoryCard key="Christmas Decoration" icon={Christmas_Decoration} title="Christmas Decoration" />
            <CategoryCard key="Other Toys" icon={Other_Toys} title="Other Toys" />
          </div>

          <Divider variant="middle" />

          <div className='footerTop-img' data-aos="fade-up">
            <center>
              <Image 
                src={footerTop} 
                alt="footerTop"
                style={{display:'flex', width:'90%', height:'50%', marginTop:'20px'}} />
            </center>
          </div>  
          
        </div>
        <Footer />
      </main>
      
    </div>
  );
};

export default HomePage;

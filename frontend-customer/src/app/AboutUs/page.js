'use client';

import React, { useEffect } from 'react';
import { Header } from "@/components/Header";
import Image from "next/image";
import footerTop from '@/images/footerTop.png';
import aboutusimg from '@/images/aboutus.jpg';
import Footer from '@/components/Footer';
import AOS from "aos";
import "aos/dist/aos.css";
import '@/styles/AboutUs.css';

const AboutUs = () => {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: false,
      mirror: true,
    });
  }, []);

  return (
    <div className="AboutUs">
      <Header isHomePage={true} />
      <main className="main-about-content">
        <h1 className='story'>Our Story</h1>
        <div className='story-content'>
          <div className='story-text'>
            <p>
              Perera Toyland began with a passion for bringing joy and creativity into the lives of children and families.
              Our journey started in Colombo with a vision to provide a wide variety of toys and decorations that inspire imagination, learning, and celebration. <br /><br />

              From our humble beginnings at 35 China Street, Colombo 01100, we've grown into a trusted toy shop known for our carefully selected product range. 
              Whether you're looking for <strong>Christmas decorations</strong>, <strong>educational toys</strong>, <strong>birthday decorations</strong>, or 
              unique <strong>other toy types</strong>, Perera Toyland is your one-stop destination. <br /><br />

              We pride ourselves on delivering exceptional customer service and maintaining a warm, family-friendly shopping experience. 
              Our commitment is to help you find the perfect toys and decorations for every occasion. Come visit us or explore our offerings online and discover 
              the magic of play with Perera Toyland!
            </p>
          </div>
          <div className='story-image'>
            <Image className='aboutusImg' alt='about us image' src={aboutusimg} height={500} width={500} />
          </div>
        </div>

        <div className='footerTop-img' data-aos="fade-up">
          <center>
            <Image
              src={footerTop}
              alt="footerTop"
              style={{ display: 'flex', width: '80%', height: 'auto', marginTop: '20px' }}
            />
          </center>
        </div>

        <div className='contact-info' data-aos="fade-up">
          <h2>Contact Information</h2>
          <p><strong>Phone:</strong> 075 186 6864</p>
          <p><strong>Email:</strong> pereratoys.lk@gmail.com</p>
          <p><strong>Address:</strong> 35 China St, Colombo 01100</p>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default AboutUs;

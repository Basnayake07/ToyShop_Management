import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '@/styles/Carousel.css';

const Carousel = ({ 
  images, 
  autoplay = true, 
  interval = 3000, 
  showDots = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % images.length
    );
  }, [images]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + images.length) % images.length
    );
  }, [images]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    let slider;
    if (autoplay) {
      slider = setInterval(nextSlide, interval);
    }
    return () => {
      if (slider) clearInterval(slider);
    };
  }, [autoplay, interval, nextSlide]);

  if (!images || images.length === 0) {
    return <div>No images to display</div>;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {/* Navigation Buttons */}
        <button 
          className="carousel-btn carousel-btn-left" 
          onClick={prevSlide}
        >
          <ChevronLeft />
        </button>
        
        <button 
          className="carousel-btn carousel-btn-right" 
          onClick={nextSlide}
        >
          <ChevronRight />
        </button>

        {/* Slide Image */}
        <div className="carousel-image-container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${
                index === currentIndex ? 'active' : ''
              }`}
            >
              {index === currentIndex && (
                <img 
                  src={image} 
                  alt={`Slide ${index + 1}`} 
                  className="carousel-image" 
                />
              )}
            </div>
          ))}
        </div>

        {/* Dots Navigation */}
        {showDots && (
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`carousel-dot ${
                  index === currentIndex ? 'active' : ''
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Carousel;

// Example Usage
export const CarouselExample = () => {
  const sampleImages = [
    '/images/carousel1.jpg',
    '/images/carousel1.jpg',
    '/images/carousel1.jpg'
  ];

  return (
    <Carousel 
      images={sampleImages} 
      autoplay={true} 
      interval={4000} 
      showDots={true} 
    />
  );
};
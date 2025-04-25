'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '@/styles/CategoryCard.css';

const CategoryCard = ({ icon, title }) => {
  const router = useRouter();

  const handleCategoryClick = () => {
    router.push(`/Products?category=${encodeURIComponent(title)}`); // Navigate to the Products page with the category
  };

  return (
    <div className="category-card" onClick={handleCategoryClick} style={{ cursor: 'pointer' }}>
      <div className="category-icon">
        {/* Check if the icon is an object (image) or a React component */}
        {typeof icon === 'object' && icon.src ? (
          <Image src={icon} alt={title} width={200} height={180}
          style={{ 
            width: '100%', 
            height: '200px',
            objectFit: 'contain'}} />
        ) : (
          icon
        )}
      </div>
      <h3 className="category-title">{title}</h3>
    </div>
  );
};

export default CategoryCard;
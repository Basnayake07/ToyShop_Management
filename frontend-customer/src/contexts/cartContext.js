'use client';

import React, { createContext, useContext, useState } from 'react';
import { useCustomer } from './customerContext';  

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { cusType } = useCustomer(); // Get cusType from CustomerContext

  const addToCart = (product) => {
    const price = cusType === 'wholesale' ? product.wholesalePrice : product.retailPrice;

    setCartItems((prev) => {
      const existing = prev.find(item => item.productID === product.productID);
      if (existing) {
        return prev.map(item =>
          item.productID === product.productID ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, price, quantity: 1 }];
      }
    });
  };
  return (
    <CartContext.Provider value={{ cartItems, addToCart, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

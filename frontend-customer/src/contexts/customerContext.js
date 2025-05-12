'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [cusType, setCusType] = useState(null);

  useEffect(() => {
    // Retrieve cusType from localStorage on app load
    const storedCusType = localStorage.getItem('cusType');
    if (storedCusType) {
      setCusType(storedCusType);
    }
  }, []);

  return (
    <CustomerContext.Provider value={{ cusType, setCusType }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
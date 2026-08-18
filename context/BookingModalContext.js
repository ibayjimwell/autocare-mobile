// context/BookingModalContext.js
import React, { createContext, useContext, useState } from 'react';

const BookingModalContext = createContext();

export function BookingModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState(null);

  const openBookingModal = (serviceId = null) => {
    setInitialServiceId(serviceId);
    setIsOpen(true);
  };

  const closeBookingModal = () => {
    setIsOpen(false);
    setInitialServiceId(null);
  };

  return (
    <BookingModalContext.Provider value={{ isOpen, openBookingModal, closeBookingModal, initialServiceId }}>
      {children}
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return context;
}
import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const currentItem = prev[product.id] || { ...product, quantity: 0, price: product.price.toString() };
      const updatedItems = {
        ...prev,
        [product.id]: { ...currentItem, quantity: currentItem.quantity + 1 }
      };

      if (currentItem.quantity === 0) {
        setCartCount((prevCount) => prevCount + 1);
      }

      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      if (prev[productId] && prev[productId].quantity > 0) {
        const updatedItems = {
          ...prev,
          [productId]: { ...prev[productId], quantity: prev[productId].quantity - 1 }
        };

        if (updatedItems[productId].quantity === 0) {
          delete updatedItems[productId];
          setCartCount((prevCount) => prevCount - 1);
        }

        return updatedItems;
      }
      return prev;
    });
  };

  const removeEntireItem = (productId) => {
    setCartItems((prev) => {
      const updatedItems = { ...prev };
      delete updatedItems[productId];
      setCartCount((prevCount) => prevCount - 1);
      return updatedItems;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, removeEntireItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
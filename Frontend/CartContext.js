import React, { createContext, useContext, useState } from 'react';

// Create a context for the cart
export const CartContext = createContext();

// Provide the cart context to its children
export const CartProvider = ({ children }) => {
  // State to store items in the cart, using product IDs as keys
  const [cartItems, setCartItems] = useState({});
  // State to store the count of distinct product types in the cart
  const [productTypeCount, setProductTypeCount] = useState(0);

  // Add a product to the cart or increase its quantity if already present
  const addProduct = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems[product.id] || { ...product, quantity: 0, price: product.price.toString() };
      const updatedItems = {
        ...currentItems,
        [product.id]: { ...existingItem, quantity: existingItem.quantity + 1 }
      };

      // Increment productTypeCount if the product is newly added
      if (existingItem.quantity === 0) {
        setProductTypeCount((count) => count + 1);
      }

      return updatedItems;
    });
  };

  // Reduce the quantity of a product in the cart or remove it if quantity is zero
  const removeProduct = (productId) => {
    setCartItems((currentItems) => {
      if (currentItems[productId] && currentItems[productId].quantity > 0) {
        const updatedItems = {
          ...currentItems,
          [productId]: { ...currentItems[productId], quantity: currentItems[productId].quantity - 1 }
        };

        // Remove the product entirely if its quantity reaches zero
        if (updatedItems[productId].quantity === 0) {
          delete updatedItems[productId];
          setProductTypeCount((count) => count - 1);
        }

        return updatedItems;
      }
      return currentItems;
    });
  };

  // Remove a product entirely from the cart
  const removeProductCompletely = (productId) => {
    setCartItems((currentItems) => {
      const updatedItems = { ...currentItems };
      if (updatedItems[productId]) {
        delete updatedItems[productId];
        setProductTypeCount((count) => count - 1);
      }
      return updatedItems;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, productTypeCount, addProduct, removeProduct, removeProductCompletely }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to access the cart context
export const useCart = () => {
  return useContext(CartContext);
};

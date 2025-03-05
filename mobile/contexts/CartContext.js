import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  const addToCart = (item, restaurantData) => {
    // If adding from a different restaurant, clear the cart first
    if (restaurant && restaurantData.id !== restaurant.id) {
      if (!confirm(`Seu carrinho contém itens de ${restaurant.name}. Deseja limpar o carrinho e adicionar itens de ${restaurantData.name}?`)) {
        return false;
      }
      setCartItems([]);
    }

    // Set the restaurant
    if (!restaurant) {
      setRestaurant(restaurantData);
    }

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      setCartItems(updatedItems);
    } else {
      // Item doesn't exist, add new item
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    return true;
  };

  const removeFromCart = (itemId) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === itemId
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      
      if (updatedItems[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedItems[existingItemIndex].quantity -= 1;
      } else {
        // Remove item if quantity is 1
        updatedItems.splice(existingItemIndex, 1);
      }
      
      setCartItems(updatedItems);
      
      // If cart is empty, reset restaurant
      if (updatedItems.length === 0) {
        setRestaurant(null);
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

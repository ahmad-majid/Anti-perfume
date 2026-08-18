import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1, size = '100ml') => {
    const existingIndex = cartItems.findIndex(
      (item) => item._id === product._id && item.size === size
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity = Math.min(
        updatedCart[existingIndex].stock,
        updatedCart[existingIndex].quantity + quantity
      );
    } else {
      updatedCart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        size: size,
        quantity: Math.min(product.stock, quantity),
        stock: product.stock,
      });
    }

    saveCart(updatedCart);
  };

  const removeFromCart = (productId, size) => {
    const updatedCart = cartItems.filter(
      (item) => !(item._id === productId && item.size === size)
    );
    saveCart(updatedCart);
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item._id === productId && item.size === size
        ? { ...item, quantity: Math.min(item.stock, quantity) }
        : item
    );
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = cartSubtotal >= 99 || cartSubtotal === 0 ? 0 : 15;
  const cartTotal = cartSubtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingCost,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

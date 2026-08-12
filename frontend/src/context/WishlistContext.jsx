import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch wishlist IDs on login
  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return; }
    fetch('http://localhost:5000/api/wishlist', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistIds(new Set(data.map((p) => p._id)));
        }
      })
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(async (product) => {
    if (!user) return false; // caller should redirect to login
    const id = product._id;
    const isSaved = wishlistIds.has(id);

    if (isSaved) {
      await fetch(`http://localhost:5000/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWishlistIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId: id }),
      });
      setWishlistIds((prev) => new Set([...prev, id]));
    }
    return !isSaved; // returns new state (true = added)
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((id) => wishlistIds.has(id), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

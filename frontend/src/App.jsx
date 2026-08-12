import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import PageTransition from './components/PageTransition';
import AnnouncementBar from './components/AnnouncementBar';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';

// AnimatePresence requires access to location, so we split into an inner component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/"            element={<Home />} />
          <Route path="/shop"        element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/wishlist"    element={<Wishlist />} />
          <Route path="/checkout"    element={<Checkout />} />
          <Route path="/success"     element={<Success />} />
          <Route path="/admin"       element={<AdminDashboard />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AnnouncementBar />
                <Navbar onCartOpen={() => setIsCartOpen(true)} />
                <main style={{ flexGrow: 1 }}>
                  <AnimatedRoutes />
                </main>
                <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                <Footer />
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

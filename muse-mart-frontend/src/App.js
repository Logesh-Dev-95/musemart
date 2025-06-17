// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Remove BrowserRouter import
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SellPage from './pages/SellPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import MuseMartLanding from './pages/MuseMartLanding';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Show a loading spinner while checking auth status
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { loading: authLoading } = useAuth(); // Use auth loading for overall app state

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    // <Router> {/* REMOVE THIS */}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MuseMartLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/sell" element={
              <PrivateRoute>
                <SellPage />
              </PrivateRoute>
            } />
            <Route path="/my-orders" element={
              <PrivateRoute>
                <MyOrdersPage />
              </PrivateRoute>
            } />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    // </Router> {/* REMOVE THIS */}
  );
}

export default App;
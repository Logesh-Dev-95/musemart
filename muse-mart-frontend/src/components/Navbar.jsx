import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg'; // Create this image in src/assets

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary-dark text-white shadow-md' // Using custom colors
        : 'text-text-light hover:bg-gray-200 hover:text-text-DEFAULT'
    }`;
  
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary-dark text-white'
        : 'text-text-DEFAULT hover:bg-gray-200 hover:text-text-DEFAULT'
    }`;


  return (
    <nav className="bg-card shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img className="h-9 w-auto" src={logo} alt="Muse Mart Logo" />
              <span className="text-2xl font-bold text-text-DEFAULT hidden md:block">Muse Mart</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex md:space-x-4">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/my-orders" className={navLinkClass}>My Orders</NavLink>
                  <NavLink to="/sell" className={navLinkClass}>Sell Product</NavLink>
                  <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                  <NavLink to="/signup" className={navLinkClass}>Signup</NavLink>
                </>
              )}
            </div>
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center ml-4">
                <span className="text-text-DEFAULT text-sm font-medium mr-2">Hello, {user.name.split(' ')[0]}!</span>
                {/* Optional: Add a small user avatar here */}
              </div>
            )}
            <div className="ml-4 flex items-center md:hidden">
              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-DEFAULT"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClass} onClick={toggleMenu}>Home</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/my-orders" className={mobileNavLinkClass} onClick={toggleMenu}>My Orders</NavLink>
                <NavLink to="/sell" className={mobileNavLinkClass} onClick={toggleMenu}>Sell Product</NavLink>
                <NavLink to="/profile" className={mobileNavLinkClass} onClick={toggleMenu}>Profile</NavLink>
                {user && (
                  <span className="block px-3 py-2 text-text-light font-medium">Logged in as {user.name.split(' ')[0]}</span>
                )}
                <button
                  onClick={() => { logout(); toggleMenu(); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileNavLinkClass} onClick={toggleMenu}>Login</NavLink>
                <NavLink to="/signup" className={mobileNavLinkClass} onClick={toggleMenu}>Signup</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
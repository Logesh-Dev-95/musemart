import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // Import the axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        // Set the default Authorization header for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const profile = await getUserProfile(token);
          setUser({ ...profile, name: profile.name || 'User' }); // Ensure name is set
        } catch (error) {
          console.error('Failed to load user profile or token expired:', error);
          logout(); // Clear invalid token
        }
      } else {
        // Clear default header if no token
        delete api.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // setUser is updated by the useEffect when token changes and getUserProfile is called
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      const data = await registerUser(name, email, password, phone);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // setUser is updated by the useEffect when token changes and getUserProfile is called
      return data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization']; // Clear header
    navigate('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
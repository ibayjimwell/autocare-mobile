import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';
import authApi from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Restore session on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = storage.getItem('auth_token');
        const storedUser = storage.getItem('auth_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load session', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.error) {
        return { success: false, message: res.message || 'Login failed' };
      }
      const { customer, token } = res.data;
      storage.setItem('auth_token', token);
      storage.setItem('auth_user', JSON.stringify(customer));
      setToken(token);
      setUser(customer);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Register – if signup doesn't return a token, login immediately afterwards
  const register = async (fullName, email, phone, password) => {
    try {
      const res = await authApi.register({
        fullname: fullName,
        email,
        phone,
        password,
      });
      if (res.error) {
        return { success: false, message: res.message || 'Registration failed' };
      }
      // The current backend does not return a token on signup, so we login
      const loginRes = await authApi.login({ email, password });
      if (loginRes.error) {
        return { success: false, message: 'Account created but login failed' };
      }
      const { customer, token } = loginRes.data;
      storage.setItem('auth_token', token);
      storage.setItem('auth_user', JSON.stringify(customer));
      setToken(token);
      setUser(customer);
      return { success: true };
    } catch (err) {
      // err.message already contains the exact backend error (e.g., duplicate email)
      return { success: false, message: err.message };
    }
  };

  // Logout
  const logout = async () => {
    storage.removeItem('auth_token');
    storage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
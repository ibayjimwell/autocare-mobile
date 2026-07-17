// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';
import authApi from '../services/authApi';
import { decodeToken } from '../utils/jwt';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = storage.getItem('auth_token');
        const storedUser = storage.getItem('auth_user');

        console.log('[Auth] Restored token:', storedToken ? storedToken.substring(0, 30) + '...' : 'NULL');
        console.log('[Auth] Restored user:', storedUser ? storedUser.substring(0, 50) : 'NULL');

        if (!storedToken || !storedUser) {
          console.log('[Auth] No stored session.');
          return;
        }

        // 1. Check token structure and expiration
        const decoded = decodeToken(storedToken);
        if (!decoded || !decoded.exp) {
          console.warn('[Auth] Token invalid, clearing storage.');
          clearStorage();
          return;
        }
        if (decoded.exp <= Math.floor(Date.now() / 1000)) {
          console.warn('[Auth] Token expired, clearing storage.');
          clearStorage();
          return;
        }

        // 2. Check user object
        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          console.warn('[Auth] User JSON corrupt, clearing storage.');
          clearStorage();
          return;
        }
        if (!parsedUser || !parsedUser.id) {
          console.warn('[Auth] User object missing id, clearing storage.');
          clearStorage();
          return;
        }

        // 3. *** CRITICAL: Verify token against the server ***
        console.log('[Auth] Verifying token with server...');
        try {
          await authApi.getMe();          // uses the stored token
          console.log('[Auth] Server verification OK.');
        } catch (serverError) {
          console.warn('[Auth] Server verification failed:', serverError.message);
          clearStorage();
          return;
        }

        // All checks passed
        console.log('[Auth] Session restored successfully.');
        setToken(storedToken);
        setUser(parsedUser);
      } catch (err) {
        console.error('[Auth] Unexpected load error:', err);
        clearStorage();
      } finally {
        setLoading(false);
      }
    };

    const clearStorage = () => {
      console.log('[Auth] Clearing stored credentials.');
      storage.removeItem('auth_token');
      storage.removeItem('auth_user');
    };

    loadSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.error) return { success: false, message: res.message || 'Login failed' };
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

  const register = async (fullName, email, phone, password) => {
    try {
      const res = await authApi.register({ fullname: fullName, email, phone, password });
      if (res.error) return { success: false, message: res.message || 'Registration failed' };
      const loginRes = await authApi.login({ email, password });
      if (loginRes.error) return { success: false, message: 'Account created but login failed' };
      const { customer, token } = loginRes.data;
      storage.setItem('auth_token', token);
      storage.setItem('auth_user', JSON.stringify(customer));
      setToken(token);
      setUser(customer);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

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
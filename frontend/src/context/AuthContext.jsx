import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yathra_token') || localStorage.getItem('tripzo_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('yathra_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('yathra_token');
      localStorage.removeItem('yathra_user');
      localStorage.removeItem('tripzo_token');
      localStorage.removeItem('tripzo_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('yathra_user', JSON.stringify(data.user));
      } else {
        // Token invalid, clear session
        setToken(null);
      }
    } catch (err) {
      // Offline fallback: Use cached details if server is down
      const cachedUser = localStorage.getItem('yathra_user') || localStorage.getItem('tripzo_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      console.warn('Network issue fetching user profile, using cached if available.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('tripzo_user', JSON.stringify(data.user));
      localStorage.setItem('yathra_user', JSON.stringify(data.user));
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const register = async (username, fullName, email, phone, password, isSliitStudent = false, studentId = '') => {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, email, phone, password, isSliitStudent, studentId })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('tripzo_user', JSON.stringify(data.user));
      localStorage.setItem('yathra_user', JSON.stringify(data.user));
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('yathra_token');
    localStorage.removeItem('tripzo_token');
    localStorage.removeItem('yathra_user');
    localStorage.removeItem('tripzo_user');
  };

  const loginWithPin = async (pin) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: String(pin).trim() })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('yathra_token', data.token);
        localStorage.setItem('tripzo_token', data.token);
        localStorage.setItem('yathra_user', JSON.stringify(data.user));
        localStorage.setItem('tripzo_user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid Security PIN.' };
      }
    } catch (err) {
      // Offline fallback
      const cachedPin = localStorage.getItem('yathra_admin_pin') || '2026';
      if (String(pin).trim() === cachedPin) {
        const mockAdmin = {
          _id: 'admin_offline_master',
          username: 'admin',
          fullName: 'Master Administrator',
          email: 'admin@tripzo.com',
          role: 'Admin',
          status: 'Active'
        };
        const mockToken = 'mock_admin_token_2026';
        setToken(mockToken);
        setUser(mockAdmin);
        localStorage.setItem('yathra_token', mockToken);
        localStorage.setItem('tripzo_token', mockToken);
        localStorage.setItem('yathra_user', JSON.stringify(mockAdmin));
        localStorage.setItem('tripzo_user', JSON.stringify(mockAdmin));
        return { success: true };
      }
      return { success: false, message: 'Invalid Admin Security PIN.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithPin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

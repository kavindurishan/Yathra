import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Public Customer Session (Passengers & Students)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yathra_token') || localStorage.getItem('tripzo_token') || null);
  const [loading, setLoading] = useState(true);

  // 2. Isolated Admin Console Terminal Session (Gated by Master PIN)
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('yathra_admin_token') || null;
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('yathra_admin_user');
        if (cached && cached !== 'undefined') {
          return JSON.parse(cached);
        }
      } catch (e) {
        localStorage.removeItem('yathra_admin_user');
      }
    }
    return null;
  });

  const isAdminUnlocked = Boolean(adminToken && adminUser);

  // Automatically separate any legacy admin sessions from customer session
  useEffect(() => {
    try {
      const cachedCustomer = localStorage.getItem('yathra_user');
      if (cachedCustomer && cachedCustomer !== 'undefined') {
        const parsed = JSON.parse(cachedCustomer);
        if (parsed && (parsed.role === 'Admin' || parsed.role === 'Operator')) {
          // Migrate to isolated admin session if not already set
          if (!localStorage.getItem('yathra_admin_token')) {
            const legacyToken = localStorage.getItem('yathra_token') || 'admin_master_session';
            localStorage.setItem('yathra_admin_token', legacyToken);
            localStorage.setItem('yathra_admin_user', JSON.stringify(parsed));
            setAdminToken(legacyToken);
            setAdminUser(parsed);
          }
          // Remove from public customer session so customer side stays clean
          localStorage.removeItem('yathra_user');
          localStorage.removeItem('yathra_token');
          localStorage.removeItem('tripzo_user');
          localStorage.removeItem('tripzo_token');
          setUser(null);
          setToken(null);
        }
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  // Sync customer token with localStorage
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('yathra_user', JSON.stringify(data.user));
      } else {
        // Token invalid, clear session
        setToken(null);
      }
    } catch (err) {
      // Offline fallback: Use cached details if server is down
      try {
        const cachedUser = localStorage.getItem('yathra_user') || localStorage.getItem('tripzo_user');
        if (cachedUser && cachedUser !== 'undefined') {
          setUser(JSON.parse(cachedUser));
        }
      } catch (parseErr) {
        localStorage.removeItem('yathra_user');
        localStorage.removeItem('tripzo_user');
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
        // Authenticate ISOLATED Admin Console Session ONLY - Public customer session stays untouched
        setAdminToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('yathra_admin_token', data.token);
        localStorage.setItem('yathra_admin_user', JSON.stringify(data.user));
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
          email: 'admin@yathra.lk',
          role: 'Admin',
          status: 'Active'
        };
        const mockToken = 'mock_admin_token_2026';
        setAdminToken(mockToken);
        setAdminUser(mockAdmin);
        localStorage.setItem('yathra_admin_token', mockToken);
        localStorage.setItem('yathra_admin_user', JSON.stringify(mockAdmin));
        return { success: true };
      }
      return { success: false, message: 'Invalid Admin Security PIN.' };
    }
  };

  const lockAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('yathra_admin_token');
    localStorage.removeItem('yathra_admin_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      loginWithPin, 
      register, 
      logout,
      adminUser,
      adminToken,
      isAdminUnlocked,
      lockAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

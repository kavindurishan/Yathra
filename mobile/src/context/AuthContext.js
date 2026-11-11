import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default logged in with a demo passenger account so app can be explored instantly
  const [user, setUser] = useState({
    id: 'USR-001',
    name: 'Kasun Rathnayake',
    email: 'kasun.r@gmail.com',
    phone: '+94 77 412 8899',
    role: 'Passenger', // Passenger, Conductor, Admin
    nic: '941203491V',
    token: 'jwt_mock_yathra_token_mobile_2026'
  });

  const login = async (email, password) => {
    // Quick demo login
    if (email.includes('conductor') || email.includes('admin')) {
      setUser({
        id: 'USR-COND-01',
        name: 'Kamal Perera (Conductor)',
        email,
        phone: '+94 71 888 2233',
        role: 'Conductor',
        nic: '882049182V',
        token: 'jwt_mock_yathra_conductor_token'
      });
      return true;
    }

    setUser({
      id: 'USR-001',
      name: email.split('@')[0] || 'Kasun Rathnayake',
      email,
      phone: '+94 77 412 8899',
      role: 'Passenger',
      nic: '941203491V',
      token: 'jwt_mock_yathra_token_mobile_2026'
    });
    return true;
  };

  const register = async (userData) => {
    setUser({
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: userData.fullName || 'New Passenger',
      email: userData.email,
      phone: userData.phone,
      role: 'Passenger',
      nic: userData.nic || '199812345678',
      token: 'jwt_mock_new_token'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role) => {
    if (user) {
      setUser(prev => ({ ...prev, role }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

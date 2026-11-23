import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const LaunchSettingsContext = createContext();

const DEFAULT_SETTINGS = {
  publicBookingActive: false,
  launchBannerEnabled: true,
  bannerMessage: 'SLIIT Campus Transit Hub is now LIVE! Public expressway booking will open soon.',
  modalTitle: 'Public Booking Launching Soon',
  modalSubtitle: 'Expressway Intercity Coach Service',
  modalMessage: 'Online seat reservations for Expressway Intercity routes are undergoing final system readiness checks and will be accessible to the general public soon. SLIIT University Shuttle service is 100% active with live tracking, stop schedules, and student passes.',
  campusButtonText: 'Switch to Campus Shuttle Hub 🎓',
  allowAdminBypass: true
};

export const LaunchSettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('yathra_launch_settings');
      if (cached) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
        } catch (e) {}
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  const isAdmin = Boolean(user && (user.role === 'Admin' || user.role === 'Operator'));
  const isBookingAllowed = Boolean(settings.publicBookingActive || (isAdmin && settings.allowAdminBypass));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data && data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
        localStorage.setItem('yathra_launch_settings', JSON.stringify(data.settings));
      }
    } catch (err) {
      console.warn('Could not load remote system settings, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (partialSettings) => {
    try {
      const data = await api.settings.update(partialSettings);
      if (data && data.success && data.settings) {
        setSettings(data.settings);
        localStorage.setItem('yathra_launch_settings', JSON.stringify(data.settings));
        return { success: true, settings: data.settings };
      }
    } catch (err) {
      // Local fallback in case backend is offline
      const updated = { ...settings, ...partialSettings };
      setSettings(updated);
      localStorage.setItem('yathra_launch_settings', JSON.stringify(updated));
      return { success: true, settings: updated };
    }
  };

  const openNoticeModal = () => setIsNoticeModalOpen(true);
  const closeNoticeModal = () => setIsNoticeModalOpen(false);

  return (
    <LaunchSettingsContext.Provider
      value={{
        settings,
        loading,
        isAdmin,
        isBookingAllowed,
        isNoticeModalOpen,
        openNoticeModal,
        closeNoticeModal,
        updateSettings,
        refreshSettings: loadSettings
      }}
    >
      {children}
    </LaunchSettingsContext.Provider>
  );
};

export const useLaunchSettings = () => {
  const context = useContext(LaunchSettingsContext);
  if (!context) {
    throw new Error('useLaunchSettings must be used within a LaunchSettingsProvider');
  }
  return context;
};

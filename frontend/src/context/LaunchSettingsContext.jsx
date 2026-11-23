import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const LaunchSettingsContext = createContext();

const DEFAULT_SETTINGS = {
  publicBookingActive: false,
  launchBannerEnabled: true,
  bannerMessage: 'SLIIT Campus Transit Hub is now LIVE! Public expressway booking will open soon.',
  modalTitle: 'Public Booking Launching Soon',
  modalSubtitle: 'Expressway Intercity Coach Service',
  modalMessage: 'Online seat reservations for Expressway Intercity routes will be accessible to the general public soon. SLIIT University Shuttle service is 100% active with live tracking.',
  campusButtonText: 'Switch to Campus Shuttle Hub 🎓',
  allowAdminBypass: true,
  adminSecurityPin: '2026'
};

export const LaunchSettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('yathra_launch_settings');
        if (cached && cached !== 'undefined') {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
        }
      } catch (e) {
        localStorage.removeItem('yathra_launch_settings');
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  const safeSettings = settings || DEFAULT_SETTINGS;
  const isAdmin = Boolean(user && (user.role === 'Admin' || user.role === 'Operator'));
  const isBookingAllowed = Boolean(safeSettings.publicBookingActive || (isAdmin && safeSettings.allowAdminBypass));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      if (data && data.success && data.settings) {
        setSettings(prev => ({ ...(prev || DEFAULT_SETTINGS), ...data.settings }));
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
        const merged = { ...(settings || DEFAULT_SETTINGS), ...data.settings };
        setSettings(merged);
        localStorage.setItem('yathra_launch_settings', JSON.stringify(merged));
        return { success: true, settings: merged };
      }
    } catch (err) {
      // Local fallback in case backend is offline
      const updated = { ...(settings || DEFAULT_SETTINGS), ...partialSettings };
      setSettings(updated);
      localStorage.setItem('yathra_launch_settings', JSON.stringify(updated));
      return { success: true, settings: updated };
    }
  };

  const openNoticeModal = useCallback(() => setIsNoticeModalOpen(true), []);
  const closeNoticeModal = useCallback(() => setIsNoticeModalOpen(false), []);

  return (
    <LaunchSettingsContext.Provider
      value={{
        settings: safeSettings,
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
    return {
      settings: DEFAULT_SETTINGS,
      loading: false,
      isAdmin: false,
      isBookingAllowed: false,
      isNoticeModalOpen: false,
      openNoticeModal: () => {},
      closeNoticeModal: () => {},
      updateSettings: async () => {},
      refreshSettings: () => {}
    };
  }
  return context;
};

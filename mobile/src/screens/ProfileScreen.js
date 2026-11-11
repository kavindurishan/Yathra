import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import {
  User,
  Shield,
  Moon,
  Globe,
  QrCode,
  PhoneCall,
  MessageSquare,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, logout, switchRole } = useAuth();

  const handleRoleToggle = () => {
    const nextRole = user?.role === 'Conductor' ? 'Passenger' : 'Conductor';
    switchRole(nextRole);
    Alert.alert('Role Switched', `Switched app mode to ${nextRole}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('profile')} subtitle="Account & App Preferences" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.userInfoCol}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Kasun Rathnayake'}</Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'kasun.r@gmail.com'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Shield size={12} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role || 'Passenger'}</Text>
            </View>
          </View>
        </View>

        {/* Conductor Mode Quick Access */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ConductorScanner')}
          style={[styles.conductorBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <View style={styles.conductorBannerLeft}>
            <QrCode size={22} color={colors.primary} />
            <View>
              <Text style={[styles.bannerTitle, { color: colors.primaryDark }]}>{t('conductorMode')}</Text>
              <Text style={[styles.bannerSub, { color: colors.primaryDark }]}>Verify passenger boarding passes</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Settings Group: App Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>PREFERENCES</Text>

          {/* Dark Mode Row */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Moon size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('theme')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Language Selector Row */}
          <View style={[styles.settingRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <Globe size={18} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('language')}</Text>
            </View>
            <View style={styles.langSelectorRow}>
              {['en', 'si', 'ta'].map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLang(l)}
                  style={[
                    styles.langPill,
                    {
                      backgroundColor: lang === l ? colors.primary : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      { color: lang === l ? '#ffffff' : colors.text }
                    ]}
                  >
                    {l === 'en' ? 'EN' : l === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Switch Role Option */}
          <View style={[styles.settingRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <Sparkles size={18} color="#f59e0b" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Switch to Crew / Conductor</Text>
            </View>
            <Switch
              value={user?.role === 'Conductor'}
              onValueChange={handleRoleToggle}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>SUPPORT & HELP</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <PhoneCall size={18} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Customer Care Hotline</Text>
            </View>
            <Text style={[styles.contactInfo, { color: colors.primary }]}>+94 11 234 5678</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <MessageSquare size={18} color="#22c55e" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>WhatsApp Live Help</Text>
            </View>
            <ChevronRight size={16} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: logout }
            ]);
          }}
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.danger }]}
          activeOpacity={0.7}
        >
          <LogOut size={16} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={[styles.appVersionText, { color: colors.textSubtle }]}>
          Yathra Mobile v1.0.0 (Build 2026) • Sri Lanka
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    gap: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  conductorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  conductorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginVertical: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactInfo: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
  },
  appVersionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
});

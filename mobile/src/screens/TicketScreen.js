import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import QRTicketCard from '../components/QRTicketCard';
import { Navigation, Home } from 'lucide-react-native';

export default function TicketScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { booking } = route.params || {};

  const handleTrackLive = () => {
    navigation.navigate('LiveTracker', { scheduleId: booking?.scheduleId });
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('ticketConfirmation')}
        subtitle={t('ticketSub')}
        showBack
        onBack={handleGoHome}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        <View style={[styles.successBanner, { backgroundColor: colors.accent }]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Boarding Pass Issued</Text>
            <Text style={styles.bannerSub}>SMS confirmation sent to passenger's mobile</Text>
          </View>
        </View>

        {/* Boarding Pass Ticket with QR Pattern */}
        {booking && <QRTicketCard booking={booking} />}

        {/* Navigation Action Buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            onPress={handleTrackLive}
            style={[styles.trackBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Navigation size={18} color="#ffffff" />
            <Text style={styles.btnText}>{t('trackBus')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoHome}
            style={[styles.homeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Home size={18} color={colors.text} />
            <Text style={[styles.homeBtnText, { color: colors.text }]}>Back to Search</Text>
          </TouchableOpacity>
        </View>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 12,
    marginBottom: 6,
  },
  celebrationEmoji: {
    fontSize: 26,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  actionsWrap: {
    gap: 10,
    marginTop: 8,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

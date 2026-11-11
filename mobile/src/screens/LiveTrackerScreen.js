import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import RouteTrackerMap from '../components/RouteTrackerMap';
import { MOCK_SCHEDULES } from '../services/mockData';
import { RefreshCw, Radio, Bus, ShieldAlert, PhoneCall } from 'lucide-react-native';

export default function LiveTrackerScreen({ route }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { scheduleId } = route.params || {};

  const [selectedSchedule, setSelectedSchedule] = useState(
    MOCK_SCHEDULES.find(s => s.id === scheduleId) || MOCK_SCHEDULES[0]
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('trackBus')}
        subtitle={`${selectedSchedule.from} ➔ ${selectedSchedule.to} • ${selectedSchedule.busNo}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Bus Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.busSelectorRow}>
          {MOCK_SCHEDULES.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelectedSchedule(item)}
              style={[
                styles.busSelectPill,
                {
                  backgroundColor: selectedSchedule.id === item.id ? colors.primary : colors.card,
                  borderColor: selectedSchedule.id === item.id ? colors.primary : colors.border
                }
              ]}
              activeOpacity={0.7}
            >
              <Bus size={14} color={selectedSchedule.id === item.id ? '#ffffff' : colors.text} />
              <Text
                style={[
                  styles.busPillText,
                  { color: selectedSchedule.id === item.id ? '#ffffff' : colors.text }
                ]}
              >
                {item.from} - {item.to} ({item.busNo})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Refresh Signal Bar */}
        <View style={[styles.signalBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.signalLeft}>
            <Radio size={16} color={colors.accent} />
            <Text style={[styles.signalText, { color: colors.text }]}>Satellite GPS Beacon Connected (10 Hz)</Text>
          </View>

          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <RefreshCw size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Live Route Tracker Component */}
        <RouteTrackerMap schedule={selectedSchedule} />

        {/* 24/7 Island Dispatch Support Card */}
        <View style={[styles.supportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.supportHeader}>
            <ShieldAlert size={18} color={colors.primary} />
            <Text style={[styles.supportTitle, { color: colors.text }]}>Yathra Passenger Hotline</Text>
          </View>
          <Text style={[styles.supportDesc, { color: colors.textMuted }]}>
            In case of route detours, severe weather, or highway delays, our operations team is available 24/7.
          </Text>
          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <PhoneCall size={14} color={colors.primary} />
            <Text style={[styles.emergencyBtnText, { color: colors.primary }]}>Call 1999 Emergency Support</Text>
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
  busSelectorRow: {
    gap: 8,
    marginBottom: 12,
  },
  busSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  busPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  signalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  signalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshBtn: {
    padding: 4,
  },
  supportCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  supportDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
  },
  emergencyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

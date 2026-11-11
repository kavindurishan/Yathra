import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Wifi, Snowflake, Zap, Star, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function BusCard({ schedule, onSelect }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top Bar: Operator Name, Bus No, and Category Badge */}
      <View style={styles.topRow}>
        <View style={styles.operatorInfo}>
          <Text style={[styles.operatorName, { color: colors.text }]}>{schedule.operator}</Text>
          <View style={styles.subTagRow}>
            <Text style={[styles.busPlate, { color: colors.textMuted }]}>{schedule.busNo}</Text>
            <View style={[styles.dotSeparator, { backgroundColor: colors.border }]} />
            <Text style={[styles.busType, { color: colors.primary }]}>{schedule.type}</Text>
          </View>
        </View>

        <View style={[styles.ratingBadge, { backgroundColor: '#fef3c7' }]}>
          <Star size={13} color="#d97706" fill="#d97706" />
          <Text style={styles.ratingText}>{schedule.rating || 4.8}</Text>
        </View>
      </View>

      {/* Timings and Route Section */}
      <View style={[styles.routeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Departure */}
        <View style={styles.timeBlock}>
          <Text style={[styles.timeText, { color: colors.text }]}>{schedule.departureTime}</Text>
          <Text style={[styles.cityText, { color: colors.textMuted }]}>{schedule.from}</Text>
          <Text style={[styles.terminalText, { color: colors.textSubtle }]} numberOfLines={1}>
            {schedule.departureTerminal?.split('(')[0] || 'Terminal'}
          </Text>
        </View>

        {/* Route Line & Duration */}
        <View style={styles.durationBlock}>
          <Text style={[styles.durationText, { color: colors.textMuted }]}>{schedule.duration}</Text>
          <View style={styles.lineWithDots}>
            <View style={[styles.circleDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.dashLine, { borderColor: colors.primary }]} />
            <Text style={styles.busMovingEmoji}>🚌</Text>
            <View style={[styles.dashLine, { borderColor: colors.primary }]} />
            <View style={[styles.circleDot, { backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.categoryBadge, { color: colors.primary }]}>{schedule.category || 'Direct'}</Text>
        </View>

        {/* Arrival */}
        <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
          <Text style={[styles.timeText, { color: colors.text }]}>{schedule.arrivalTime}</Text>
          <Text style={[styles.cityText, { color: colors.textMuted }]}>{schedule.to}</Text>
          <Text style={[styles.terminalText, { color: colors.textSubtle }]} numberOfLines={1}>
            {schedule.arrivalTerminal?.split('(')[0] || 'Central Stand'}
          </Text>
        </View>
      </View>

      {/* Amenities & Live Status Bar */}
      <View style={styles.amenitiesRow}>
        <View style={styles.amenityIcons}>
          <View style={[styles.iconPill, { backgroundColor: colors.surface }]}>
            <Snowflake size={14} color={colors.primary} />
          </View>
          <View style={[styles.iconPill, { backgroundColor: colors.surface }]}>
            <Wifi size={14} color={colors.secondary} />
          </View>
          <View style={[styles.iconPill, { backgroundColor: colors.surface }]}>
            <Zap size={14} color="#f59e0b" />
          </View>
        </View>

        <View style={styles.seatsRemaining}>
          <Text style={[styles.seatsCount, { color: colors.accent }]}>
            {schedule.availableSeats || 18} {t('seatsLeft')}
          </Text>
        </View>
      </View>

      {/* Bottom Action Footer */}
      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <View style={styles.priceCol}>
          <Text style={[styles.pricePrefix, { color: colors.textMuted }]}>Price per seat</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            {t('lkr')} {schedule.price?.toLocaleString() || '1,850'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onSelect(schedule)}
          style={[styles.selectBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.selectBtnText}>{t('selectSeats')}</Text>
          <ChevronRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  busPlate: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  busType: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  routeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  timeBlock: {
    width: '32%',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  terminalText: {
    fontSize: 10,
    marginTop: 2,
  },
  durationBlock: {
    width: '36%',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  lineWithDots: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  circleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dashLine: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginHorizontal: 2,
  },
  busMovingEmoji: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amenityIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatsRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceCol: {},
  pricePrefix: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  selectBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

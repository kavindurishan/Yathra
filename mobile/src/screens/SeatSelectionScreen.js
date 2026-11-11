import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import SeatMap from '../components/SeatMap';
import { ArrowRight, Info, ShieldCheck } from 'lucide-react-native';

export default function SeatSelectionScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { schedule, passengers = 1 } = route.params || {};

  const [selectedSeats, setSelectedSeats] = useState([]);

  const pricePerSeat = schedule?.price || 1850;

  const handleSeatToggle = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 4) {
        Alert.alert('Maximum Limit', 'You can select up to 4 seats per booking transaction.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Select Seats', 'Please tap at least one available seat to continue.');
      return;
    }

    navigation.navigate('Checkout', {
      schedule,
      selectedSeats,
      totalAmount: selectedSeats.length * pricePerSeat,
    });
  };

  const totalAmount = selectedSeats.length * pricePerSeat;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('seatSelection')}
        subtitle={`${schedule?.from} ➔ ${schedule?.to} • ${schedule?.busNo}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bus Info Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.busInfoRow}>
            <View>
              <Text style={[styles.busOperator, { color: colors.text }]}>{schedule?.operator}</Text>
              <Text style={[styles.busSub, { color: colors.primary }]}>{schedule?.type} • {schedule?.busNo}</Text>
            </View>
            <View style={[styles.depBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.depTime, { color: colors.text }]}>{schedule?.departureTime}</Text>
            </View>
          </View>

          <View style={[styles.terminalsRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.termText, { color: colors.textMuted }]} numberOfLines={1}>
              Boarding: {schedule?.departureTerminal}
            </Text>
          </View>
        </View>

        {/* Female Priority Alert Notice */}
        <View style={[styles.noticeBanner, { backgroundColor: colors.femaleSeatLight, borderColor: colors.femaleSeat }]}>
          <Info size={15} color={colors.femaleSeat} />
          <Text style={[styles.noticeText, { color: colors.femaleSeat }]}>
            Pink bordered seats are designated priority seating for solo female travelers.
          </Text>
        </View>

        {/* Seat Layout Map */}
        <SeatMap
          bookedSeats={schedule?.bookedSeats || []}
          femaleSeats={schedule?.femaleSeats || []}
          selectedSeats={selectedSeats}
          onSeatToggle={handleSeatToggle}
          pricePerSeat={pricePerSeat}
        />
      </ScrollView>

      {/* Fixed Bottom Checkout Drawer */}
      <View style={[styles.bottomDrawer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.drawerRow}>
          <View style={styles.seatsSelectionCol}>
            <Text style={[styles.selectedLabel, { color: colors.textSubtle }]}>
              Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
            </Text>
            <Text style={[styles.grandPrice, { color: colors.primary }]}>
              {t('lkr')} {totalAmount.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleProceed}
            style={[
              styles.continueBtn,
              {
                backgroundColor: selectedSeats.length > 0 ? colors.primary : colors.border,
              }
            ]}
            disabled={selectedSeats.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>{t('continueToPay')}</Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  busInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busOperator: {
    fontSize: 15,
    fontWeight: '800',
  },
  busSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  depBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  depTime: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  terminalsRow: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  termText: {
    fontSize: 11,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  drawerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatsSelectionCol: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  grandPrice: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

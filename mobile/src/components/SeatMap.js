import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SeatMap({
  bookedSeats = [],
  femaleSeats = [],
  selectedSeats = [],
  onSeatToggle,
  pricePerSeat = 1850,
  maxSelectable = 4
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // 10 Rows x 4 Seats = 40 seats
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  const getSeatStatus = (seatId) => {
    if (selectedSeats.includes(seatId)) return 'selected';
    if (bookedSeats.includes(seatId)) return 'booked';
    if (femaleSeats.includes(seatId)) return 'female';
    return 'available';
  };

  const renderSeat = (seatId) => {
    const status = getSeatStatus(seatId);
    const isSelected = status === 'selected';
    const isBooked = status === 'booked';
    const isFemale = status === 'female';

    let seatBg = colors.surface;
    let seatBorder = colors.border;
    let textColor = colors.text;

    if (isSelected) {
      seatBg = colors.primary;
      seatBorder = colors.primaryDark;
      textColor = '#ffffff';
    } else if (isBooked) {
      seatBg = colors.border;
      seatBorder = colors.border;
      textColor = colors.textSubtle;
    } else if (isFemale) {
      seatBg = colors.femaleSeatLight;
      seatBorder = colors.femaleSeat;
      textColor = colors.femaleSeat;
    } else {
      seatBorder = colors.accent;
    }

    return (
      <TouchableOpacity
        key={seatId}
        disabled={isBooked}
        onPress={() => onSeatToggle(seatId)}
        style={[
          styles.seatBox,
          {
            backgroundColor: seatBg,
            borderColor: seatBorder,
            opacity: isBooked ? 0.45 : 1,
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.seatCushion} />
        <Text style={[styles.seatText, { color: textColor }]}>{seatId}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Bus Cabin Header */}
      <View style={[styles.busCabinRoof, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.driverSection}>
          <Text style={styles.steeringIcon}>🛞</Text>
          <Text style={[styles.cabinLabel, { color: colors.textMuted }]}>{t('driver')}</Text>
        </View>
        <View style={styles.doorSection}>
          <Text style={[styles.cabinLabel, { color: colors.accent }]}>DOOR 🚪</Text>
        </View>
      </View>

      {/* Grid of Seats */}
      <ScrollView
        contentContainerStyle={styles.seatsGridContainer}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((rowLetter, index) => {
          const s1 = `${rowLetter}1`;
          const s2 = `${rowLetter}2`;
          const s3 = `${rowLetter}3`;
          const s4 = `${rowLetter}4`;

          return (
            <View key={rowLetter} style={styles.seatRow}>
              {/* Row index indicator */}
              <Text style={[styles.rowNumber, { color: colors.textSubtle }]}>{index + 1}</Text>

              {/* Left Side: 2 Seats */}
              <View style={styles.seatsPair}>
                {renderSeat(s1)}
                {renderSeat(s2)}
              </View>

              {/* Central Aisle */}
              <View style={styles.aisle}>
                <View style={[styles.aisleLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Right Side: 2 Seats */}
              <View style={styles.seatsPair}>
                {renderSeat(s3)}
                {renderSeat(s4)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Seat Color Legend */}
      <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: colors.accent, backgroundColor: colors.surface }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>{t('available')}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primary, borderColor: colors.primaryDark }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>{t('selected')}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.border }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>{t('booked')}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.femaleSeatLight, borderColor: colors.femaleSeat }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>{t('femaleOnly')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  busCabinRoof: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    marginBottom: 12,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  steeringIcon: {
    fontSize: 22,
  },
  doorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cabinLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seatsGridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  rowNumber: {
    width: 20,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  seatsPair: {
    flexDirection: 'row',
    gap: 8,
  },
  aisle: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aisleLine: {
    width: 2,
    height: 34,
    borderRadius: 1,
  },
  seatBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  seatCushion: {
    position: 'absolute',
    top: 3,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  seatText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

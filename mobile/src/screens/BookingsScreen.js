import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import { api } from '../services/api';
import { QrCode, Navigation, Calendar, Clock, MapPin, ChevronRight, Ban } from 'lucide-react-native';

export default function BookingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'COMPLETED'
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await api.getMyBookings();
    setBookings(data);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'UPCOMING') return b.status === 'Confirmed';
    if (activeTab === 'COMPLETED') return b.status === 'Completed';
    return true;
  });

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this trip? As per Yathra policy, a 90% refund will be credited to your original payment method.',
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => {
            setBookings(prev =>
              prev.map(b => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
            );
            Alert.alert('Booking Cancelled', 'Your ticket has been cancelled and refund initiated.');
          }
        }
      ]
    );
  };

  const renderBookingCard = ({ item }) => {
    const isUpcoming = item.status === 'Confirmed';

    return (
      <View style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Card Header: PNR & Status */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.pnrLabel, { color: colors.textSubtle }]}>{t('pnr')}</Text>
            <Text style={[styles.pnrCode, { color: colors.primary }]}>{item.pnr}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.status === 'Confirmed'
                    ? '#dcfce7'
                    : item.status === 'Completed'
                    ? colors.surface
                    : '#fee2e2'
              }
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    item.status === 'Confirmed'
                      ? '#15803d'
                      : item.status === 'Completed'
                      ? colors.textMuted
                      : '#dc2626'
                }
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={[styles.routeBox, { backgroundColor: colors.surface }]}>
          <View style={styles.routeRow}>
            <MapPin size={15} color={colors.primary} />
            <Text style={[styles.routeText, { color: colors.text }]}>
              {item.from} ➔ {item.to}
            </Text>
          </View>
          <Text style={[styles.busNameText, { color: colors.textMuted }]}>
            {item.busName} • {item.busNo}
          </Text>
        </View>

        {/* Departure & Seats */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <View style={styles.inlineMeta}>
              <Calendar size={13} color={colors.textSubtle} />
              <Text style={[styles.metaVal, { color: colors.text }]}>{item.departureDate}</Text>
            </View>
            <View style={styles.inlineMeta}>
              <Clock size={13} color={colors.textSubtle} />
              <Text style={[styles.metaVal, { color: colors.text }]}>{item.departureTime}</Text>
            </View>
          </View>

          <View style={styles.metaColRight}>
            <Text style={[styles.seatTag, { color: colors.accent }]}>
              Seats: {item.seats?.join(', ')}
            </Text>
            <Text style={[styles.amountVal, { color: colors.text }]}>
              {t('lkr')} {item.totalAmount?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Ticket', { booking: item })}
            style={[styles.viewTicketBtn, { backgroundColor: colors.primaryLight }]}
            activeOpacity={0.7}
          >
            <QrCode size={15} color={colors.primary} />
            <Text style={[styles.ticketBtnText, { color: colors.primary }]}>Boarding QR</Text>
          </TouchableOpacity>

          {isUpcoming && (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('LiveTracker', { scheduleId: item.scheduleId })}
                style={[styles.trackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Navigation size={14} color={colors.accent} />
                <Text style={[styles.trackBtnText, { color: colors.accent }]}>Track</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCancelBooking(item.id)}
                style={[styles.cancelBtn, { backgroundColor: '#fee2e2' }]}
                activeOpacity={0.7}
              >
                <Ban size={14} color="#dc2626" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('myBookings')} subtitle="Manage your trips and digital tickets" />

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('UPCOMING')}
          style={[
            styles.tabItem,
            activeTab === 'UPCOMING' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'UPCOMING' ? colors.primary : colors.textMuted }
            ]}
          >
            {t('upcoming')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('COMPLETED')}
          style={[
            styles.tabItem,
            activeTab === 'COMPLETED' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'COMPLETED' ? colors.primary : colors.textMuted }
            ]}
          >
            {t('completed')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookings Found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              You don't have any {activeTab.toLowerCase()} trips right now.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={[styles.bookNowBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.bookNowText}>Book a Bus</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bookingCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pnrLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pnrCode: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  routeBox: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  busNameText: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 21,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaCol: {
    gap: 4,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaColRight: {
    alignItems: 'flex-end',
  },
  seatTag: {
    fontSize: 13,
    fontWeight: '800',
  },
  amountVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  viewTicketBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  ticketBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  bookNowBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { api } from '../services/api';
import { CreditCard, Wallet, Smartphone, Banknote, Tag, CheckCircle2, ShieldCheck, Lock } from 'lucide-react-native';

export default function CheckoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const { schedule, selectedSeats = ['A1'], totalAmount = 1850 } = route.params || {};

  const [name, setName] = useState(user?.name || 'Kasun Rathnayake');
  const [phone, setPhone] = useState(user?.phone || '+94 77 412 8899');
  const [email, setEmail] = useState(user?.email || 'kasun.r@gmail.com');
  const [nic, setNic] = useState(user?.nic || '941203491V');

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'FRIMI' | 'EZCASH' | 'CASH'
  const [processing, setProcessing] = useState(false);

  const serviceFee = 100;
  const grandTotal = Math.max(0, totalAmount + serviceFee - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    const res = await api.verifyPromo(promoCode, totalAmount);
    if (res.valid) {
      setDiscount(res.discount);
      setPromoMessage(`✓ ${res.message} (-LKR ${res.discount})`);
    } else {
      setDiscount(0);
      setPromoMessage(`✕ ${res.message}`);
    }
  };

  const handleConfirmPayment = async () => {
    if (!name || !phone || !email) {
      Alert.alert('Required Fields', 'Please complete your passenger name, phone and email.');
      return;
    }

    setProcessing(true);
    try {
      const bookingData = {
        scheduleId: schedule?.id || 'SCH-001',
        busNo: schedule?.busNo || 'ND-8492',
        busName: schedule?.busName || 'Yathra Royal Express',
        operator: schedule?.operator || 'Super Line Travels',
        from: schedule?.from || 'Colombo',
        to: schedule?.to || 'Kandy',
        departureDate: 'Tomorrow, Nov 12',
        departureTime: schedule?.departureTime || '06:30 AM',
        arrivalTime: schedule?.arrivalTime || '09:45 AM',
        boardingPoint: schedule?.departureTerminal || 'Colombo Fort',
        droppingPoint: schedule?.arrivalTerminal || 'Kandy Goods Shed',
        seats: selectedSeats,
        totalAmount: grandTotal,
        paymentMethod,
        passenger: { name, phone, email, nic },
      };

      const newBooking = await api.createBooking(bookingData);

      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          { name: 'Ticket', params: { booking: newBooking } },
        ],
      });
    } catch (e) {
      Alert.alert('Booking Error', 'Could not process booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('passengerDetails')}
        subtitle={`${schedule?.from} ➔ ${schedule?.to} • Seats: ${selectedSeats.join(', ')}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Passenger Information Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Primary Passenger Details</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t('fullName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={colors.textSubtle}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t('phone')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+94 77 123 4567"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t('nicPassport')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={nic}
                onChangeText={setNic}
                placeholder="NIC No"
                placeholderTextColor={colors.textSubtle}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t('email')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="example@mail.com"
              placeholderTextColor={colors.textSubtle}
            />
          </View>
        </View>

        {/* Promo Coupon Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.promoHeader}>
            <Tag size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>{t('promoCode')}</Text>
          </View>

          <View style={styles.promoInputRow}>
            <TextInput
              style={[styles.promoInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. YATHRA10 or EXPRESS50"
              placeholderTextColor={colors.textSubtle}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyBtnText}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>

          {promoMessage ? (
            <Text
              style={[
                styles.promoMsg,
                { color: discount > 0 ? colors.accent : colors.danger }
              ]}
            >
              {promoMessage}
            </Text>
          ) : null}
        </View>

        {/* Payment Method Selector */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Method</Text>

          {/* Option: Card */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('CARD')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'CARD' ? colors.primaryLight : colors.surface,
                borderColor: paymentMethod === 'CARD' ? colors.primary : colors.border
              }
            ]}
          >
            <CreditCard size={18} color={colors.primary} />
            <View style={styles.payOptionTextCol}>
              <Text style={[styles.payOptionTitle, { color: colors.text }]}>Visa / MasterCard / UnionPay</Text>
              <Text style={[styles.payOptionSub, { color: colors.textMuted }]}>Instant Sri Lanka IPG 3D Secure</Text>
            </View>
            <View style={[styles.radioCircle, { borderColor: paymentMethod === 'CARD' ? colors.primary : colors.border }]}>
              {paymentMethod === 'CARD' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>

          {/* Option: FriMi / eZ Cash */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('FRIMI')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'FRIMI' ? colors.primaryLight : colors.surface,
                borderColor: paymentMethod === 'FRIMI' ? colors.primary : colors.border
              }
            ]}
          >
            <Smartphone size={18} color="#059669" />
            <View style={styles.payOptionTextCol}>
              <Text style={[styles.payOptionTitle, { color: colors.text }]}>FriMi / eZ Cash / Genie Wallet</Text>
              <Text style={[styles.payOptionSub, { color: colors.textMuted }]}>Pay directly from your mobile wallet</Text>
            </View>
            <View style={[styles.radioCircle, { borderColor: paymentMethod === 'FRIMI' ? colors.primary : colors.border }]}>
              {paymentMethod === 'FRIMI' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>

          {/* Option: Cash on Boarding */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('CASH')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'CASH' ? colors.primaryLight : colors.surface,
                borderColor: paymentMethod === 'CASH' ? colors.primary : colors.border
              }
            ]}
          >
            <Banknote size={18} color="#d97706" />
            <View style={styles.payOptionTextCol}>
              <Text style={[styles.payOptionTitle, { color: colors.text }]}>Pay Cash at Bus Terminal</Text>
              <Text style={[styles.payOptionSub, { color: colors.textMuted }]}>Pay conductor before departure</Text>
            </View>
            <View style={[styles.radioCircle, { borderColor: paymentMethod === 'CASH' ? colors.primary : colors.border }]}>
              {paymentMethod === 'CASH' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Fare Breakdown Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Fare Summary</Text>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textMuted }]}>
              Seats Fare ({selectedSeats.length} seat(s))
            </Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>{t('lkr')} {totalAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textMuted }]}>{t('serviceFee')}</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>{t('lkr')} {serviceFee}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.accent }]}>{t('discount')}</Text>
              <Text style={[styles.fareValue, { color: colors.accent }]}>- {t('lkr')} {discount.toLocaleString()}</Text>
            </View>
          )}

          <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{t('lkr')} {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handleConfirmPayment}
          disabled={processing}
          style={[styles.payBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Lock size={16} color="#ffffff" />
              <Text style={styles.payBtnText}>{t('payNow')} ({t('lkr')} {grandTotal.toLocaleString()})</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <ShieldCheck size={14} color={colors.accent} />
          <Text style={[styles.securityText, { color: colors.textMuted }]}>
            256-Bit SSL Encrypted & Verified Booking Security
          </Text>
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoMsg: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  payOptionTextCol: {
    flex: 1,
  },
  payOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  payOptionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fareValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import { SRI_LANKA_CITIES, POPULAR_ROUTES } from '../services/mockData';
import { Search, Calendar, Users, ArrowUpDown, Sparkles, MapPin, ShieldCheck, Bus, Clock } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [fromCity, setFromCity] = useState('Colombo');
  const [toCity, setToCity] = useState('Kandy');
  const [date, setDate] = useState('Today');
  const [passengers, setPassengers] = useState(1);
  const [showCityPicker, setShowCityPicker] = useState(null); // 'from' | 'to' | null

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = () => {
    navigation.navigate('BusList', {
      from: fromCity,
      to: toCity,
      date,
      passengers,
    });
  };

  const selectPopularRoute = (route) => {
    setFromCity(route.from);
    setToCity(route.to);
    navigation.navigate('BusList', {
      from: route.from,
      to: route.to,
      date: 'Today',
      passengers: 1,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Yathra" subtitle={t('appTagline')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner Card */}
        <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTextCol}>
            <View style={styles.badgePill}>
              <Sparkles size={12} color="#fef08a" />
              <Text style={styles.badgePillText}>Sri Lanka's #1 Bus Network</Text>
            </View>
            <Text style={styles.heroTitle}>Book Expressway & Intercity Coaches</Text>
            <Text style={styles.heroSubtitle}>Live GPS tracking, reserved seats & digital QR tickets</Text>
          </View>
          <View style={styles.heroGraphic}>
            <Text style={styles.heroBusIcon}>🚍</Text>
          </View>
        </View>

        {/* Booking / Search Card */}
        <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Origin & Destination inputs with Swap button */}
          <View style={styles.routeInputsWrapper}>
            {/* From City */}
            <TouchableOpacity
              onPress={() => setShowCityPicker(showCityPicker === 'from' ? null : 'from')}
              style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={16} color={colors.primary} />
              </View>
              <View style={styles.inputTextCol}>
                <Text style={[styles.inputLabel, { color: colors.textSubtle }]}>{t('from')}</Text>
                <Text style={[styles.inputValue, { color: colors.text }]}>{fromCity}</Text>
              </View>
            </TouchableOpacity>

            {/* Swap Button floating in between */}
            <TouchableOpacity
              onPress={swapCities}
              style={[styles.swapFloatingBtn, { backgroundColor: colors.primary, borderColor: colors.card }]}
              activeOpacity={0.8}
            >
              <ArrowUpDown size={16} color="#ffffff" />
            </TouchableOpacity>

            {/* To City */}
            <TouchableOpacity
              onPress={() => setShowCityPicker(showCityPicker === 'to' ? null : 'to')}
              style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.femaleSeatLight }]}>
                <MapPin size={16} color={colors.femaleSeat} />
              </View>
              <View style={styles.inputTextCol}>
                <Text style={[styles.inputLabel, { color: colors.textSubtle }]}>{t('to')}</Text>
                <Text style={[styles.inputValue, { color: colors.text }]}>{toCity}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Inline City Selector Dropdown */}
          {showCityPicker && (
            <View style={[styles.cityDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.dropdownHeader, { color: colors.textMuted }]}>
                Select {showCityPicker === 'from' ? 'Origin' : 'Destination'} City:
              </Text>
              <View style={styles.cityPillsWrap}>
                {SRI_LANKA_CITIES.map(city => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      if (showCityPicker === 'from') setFromCity(city);
                      else setToCity(city);
                      setShowCityPicker(null);
                    }}
                    style={[
                      styles.cityPill,
                      {
                        backgroundColor:
                          (showCityPicker === 'from' ? fromCity : toCity) === city
                            ? colors.primary
                            : colors.card,
                        borderColor: colors.border
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.cityPillText,
                        {
                          color:
                            (showCityPicker === 'from' ? fromCity : toCity) === city
                              ? '#ffffff'
                              : colors.text
                        }
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Date & Passengers Row */}
          <View style={styles.secondaryInputsRow}>
            {/* Travel Date */}
            <View style={[styles.smallInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Calendar size={15} color={colors.primary} />
              <View style={styles.smallInputText}>
                <Text style={[styles.inputLabel, { color: colors.textSubtle }]}>{t('date')}</Text>
                <Text style={[styles.smallVal, { color: colors.text }]}>{date}</Text>
              </View>
            </View>

            {/* Passenger Count */}
            <View style={[styles.smallInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Users size={15} color={colors.secondary} />
              <View style={styles.smallInputText}>
                <Text style={[styles.inputLabel, { color: colors.textSubtle }]}>{t('passengers')}</Text>
                <View style={styles.passengerCounterRow}>
                  <TouchableOpacity
                    onPress={() => setPassengers(Math.max(1, passengers - 1))}
                    style={[styles.countBtn, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.countBtnText, { color: colors.text }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.passengersNum, { color: colors.text }]}>{passengers}</Text>
                  <TouchableOpacity
                    onPress={() => setPassengers(Math.min(6, passengers + 1))}
                    style={[styles.countBtn, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.countBtnText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Search size={18} color="#ffffff" />
            <Text style={styles.searchBtnText}>{t('findBuses')}</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Island Routes */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('popularRoutes')}</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>{t('popularSub')}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
          {POPULAR_ROUTES.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => selectPopularRoute(item)}
              style={[styles.popularCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.routeBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.routeBadgeText, { color: colors.primary }]}>{item.badge}</Text>
              </View>
              <Text style={[styles.popRouteTitle, { color: colors.text }]}>
                {item.from} ➔ {item.to}
              </Text>
              <Text style={[styles.popRouteTag, { color: colors.textMuted }]}>{item.tag}</Text>

              <View style={[styles.popCardFooter, { borderTopColor: colors.border }]}>
                <View style={styles.timeTag}>
                  <Clock size={12} color={colors.textSubtle} />
                  <Text style={[styles.popDuration, { color: colors.textSubtle }]}>{item.time}</Text>
                </View>
                <Text style={[styles.popPrice, { color: colors.primary }]}>
                  {t('lkr')} {item.price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Code Banner */}
        <View style={[styles.promoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.promoIconPill, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.promoEmoji}>🎟️</Text>
          </View>
          <View style={styles.promoInfoCol}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Flat 10% Off with YATHRA10</Text>
            <Text style={[styles.promoSub, { color: colors.textMuted }]}>Apply code during checkout for instant savings</Text>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustBadge}>
            <ShieldCheck size={18} color={colors.accent} />
            <Text style={[styles.trustText, { color: colors.textMuted }]}>100% Verified Fleet</Text>
          </View>
          <View style={styles.trustBadge}>
            <Bus size={18} color={colors.primary} />
            <Text style={[styles.trustText, { color: colors.textMuted }]}>Real-time GPS Tracking</Text>
          </View>
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
  heroBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  badgePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 4,
  },
  heroGraphic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBusIcon: {
    fontSize: 32,
  },
  searchCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  routeInputsWrapper: {
    position: 'relative',
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  inputTextCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  swapFloatingBtn: {
    position: 'absolute',
    right: 18,
    top: 48,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  cityDropdown: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownHeader: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  cityPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  cityPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  smallInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  smallInputText: {
    flex: 1,
  },
  smallVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  passengerCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  countBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  passengersNum: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  popularScroll: {
    paddingRight: 16,
    gap: 12,
    marginBottom: 18,
  },
  popularCard: {
    width: 190,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  routeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  routeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  popRouteTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  popRouteTag: {
    fontSize: 11,
    marginTop: 3,
  },
  popCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popDuration: {
    fontSize: 10,
    fontWeight: '600',
  },
  popPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  promoIconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 20,
  },
  promoInfoCol: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  promoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

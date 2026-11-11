import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import BusCard from '../components/BusCard';
import { api } from '../services/api';
import { Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react-native';

export default function BusListScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const { from = 'Colombo', to = 'Kandy', date = 'Today', passengers = 1 } = route.params || {};

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'AC' | 'HIGHWAY' | 'CHEAPEST'

  useEffect(() => {
    loadSchedules();
  }, [from, to]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await api.getSchedules(from, to, date);
      setSchedules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSchedules = () => {
    let result = [...schedules];
    if (activeFilter === 'AC') {
      result = result.filter(s => s.type.includes('A/C'));
    } else if (activeFilter === 'HIGHWAY') {
      result = result.filter(s => s.category?.includes('Expressway') || s.busName?.includes('Highway'));
    } else if (activeFilter === 'CHEAPEST') {
      result.sort((a, b) => a.price - b.price);
    }
    return result;
  };

  const handleSelectSchedule = (schedule) => {
    navigation.navigate('SeatSelection', { schedule, passengers });
  };

  const filteredList = getFilteredSchedules();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={`${from} ➔ ${to}`}
        subtitle={`${date} • ${passengers} Passenger(s)`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter Chips Bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.filterChipRow}>
          <TouchableOpacity
            onPress={() => setActiveFilter('ALL')}
            style={[
              styles.chip,
              {
                backgroundColor: activeFilter === 'ALL' ? colors.primary : colors.surface,
                borderColor: activeFilter === 'ALL' ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.chipText, { color: activeFilter === 'ALL' ? '#ffffff' : colors.text }]}>
              All ({schedules.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('AC')}
            style={[
              styles.chip,
              {
                backgroundColor: activeFilter === 'AC' ? colors.primary : colors.surface,
                borderColor: activeFilter === 'AC' ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.chipText, { color: activeFilter === 'AC' ? '#ffffff' : colors.text }]}>
              {t('acOnly')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('HIGHWAY')}
            style={[
              styles.chip,
              {
                backgroundColor: activeFilter === 'HIGHWAY' ? colors.primary : colors.surface,
                borderColor: activeFilter === 'HIGHWAY' ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.chipText, { color: activeFilter === 'HIGHWAY' ? '#ffffff' : colors.text }]}>
              Highway Express
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('CHEAPEST')}
            style={[
              styles.chip,
              {
                backgroundColor: activeFilter === 'CHEAPEST' ? colors.primary : colors.surface,
                borderColor: activeFilter === 'CHEAPEST' ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.chipText, { color: activeFilter === 'CHEAPEST' ? '#ffffff' : colors.text }]}>
              Lowest Fare
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedules List */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Finding best scheduled coaches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BusCard
              schedule={item}
              onSelect={handleSelectSchedule}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🚌</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Buses Found</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                We couldn't find any direct buses matching this route or filter. Try switching between Colombo, Kandy, Galle, or Jaffna.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={[styles.resetBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.resetBtnText}>Change Route</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Navigation, Phone, ShieldAlert, CheckCircle, Clock, MapPin, Gauge } from 'lucide-react-native';

export default function RouteTrackerMap({ schedule }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [currentSpeed, setCurrentSpeed] = useState(schedule?.liveTracking?.speed || 74);
  const [progress, setProgress] = useState(schedule?.liveTracking?.progress || 45);

  // Live simulation tick: small realistic speed and progress fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 95 ? 90 : next < 60 ? 65 : next;
      });
      setProgress(prev => (prev < 90 ? prev + 1 : 20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const driverPhone = schedule?.liveTracking?.driverPhone || '+94 77 123 4567';

  const handleCall = () => {
    Linking.openURL(`tel:${driverPhone}`);
  };

  const stops = schedule?.intermediateStops || [
    { name: 'Colombo Fort', time: '06:30 AM', passed: true },
    { name: 'Kadawatha Interchange', time: '07:05 AM', passed: true },
    { name: 'Mirigama Exit', time: '07:45 AM', passed: false },
    { name: 'Kurunegala Intercity', time: '08:35 AM', passed: false },
    { name: 'Kandy Goods Shed', time: '09:45 AM', passed: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Live Telemetry Header */}
      <View style={styles.telemetryHeader}>
        <View style={styles.livePulseRow}>
          <View style={styles.radarDotContainer}>
            <View style={[styles.radarWave, { backgroundColor: colors.accent }]} />
            <View style={[styles.radarCore, { backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.liveStatusText, { color: colors.accent }]}>{t('liveGpsStatus')}</Text>
        </View>

        <View style={[styles.speedBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Gauge size={14} color={colors.primary} />
          <Text style={[styles.speedText, { color: colors.primary }]}>{currentSpeed} km/h</Text>
        </View>
      </View>

      {/* Visual GPS Highway Simulation Track */}
      <View style={[styles.mapGraphicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.roadTrack}>
          {/* Highway Asphalt Lane */}
          <View style={[styles.asphalt, { backgroundColor: colors.isDark ? '#1e293b' : '#334155' }]}>
            <View style={styles.laneCenterDashes} />
          </View>

          {/* Moving Bus Pin on Track */}
          <View style={[styles.busPinPosition, { left: `${progress}%` }]}>
            <View style={[styles.busPinHalo, { backgroundColor: colors.primary }]}>
              <Text style={styles.busPinIcon}>🚌</Text>
            </View>
            <View style={[styles.busCallout, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.calloutText, { color: colors.text }]}>{schedule?.busNo || 'Bus'}</Text>
            </View>
          </View>
        </View>

        {/* Route Terminals */}
        <View style={styles.terminalsRow}>
          <View style={styles.termPoint}>
            <MapPin size={12} color={colors.primary} />
            <Text style={[styles.termCity, { color: colors.text }]}>{schedule?.from || 'Origin'}</Text>
          </View>
          <Text style={[styles.highwayName, { color: colors.textMuted }]}>
            {schedule?.liveTracking?.status || 'Active Route'}
          </Text>
          <View style={[styles.termPoint, { alignItems: 'flex-end' }]}>
            <MapPin size={12} color={colors.accent} />
            <Text style={[styles.termCity, { color: colors.text }]}>{schedule?.to || 'Destination'}</Text>
          </View>
        </View>
      </View>

      {/* Next Stop & ETA Alert */}
      <View style={[styles.nextStopBanner, { backgroundColor: colors.primaryLight }]}>
        <View style={styles.nextStopIcon}>
          <Clock size={16} color={colors.primary} />
        </View>
        <View style={styles.nextStopInfo}>
          <Text style={[styles.nextStopLabel, { color: colors.primaryDark }]}>{t('nextStop')}</Text>
          <Text style={[styles.nextStopName, { color: colors.primaryDark }]}>
            {schedule?.liveTracking?.nextStop || 'Next Stop'} • ETA: {schedule?.liveTracking?.etaNextStop || '10 mins'}
          </Text>
        </View>
      </View>

      {/* Intermediate Stops Timeline */}
      <View style={styles.timelineSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Stop Schedule & Timeline</Text>
        {stops.map((stop, idx) => (
          <View key={idx} style={styles.stopRow}>
            <View style={styles.stopTimelineCol}>
              {stop.passed ? (
                <CheckCircle size={16} color={colors.accent} fill={colors.accent} />
              ) : (
                <View style={[styles.futureStopCircle, { borderColor: colors.textSubtle }]} />
              )}
              {idx < stops.length - 1 && (
                <View
                  style={[
                    styles.stopConnectorLine,
                    { backgroundColor: stop.passed ? colors.accent : colors.border }
                  ]}
                />
              )}
            </View>

            <View style={styles.stopInfoCol}>
              <Text
                style={[
                  styles.stopNameText,
                  { color: stop.passed ? colors.text : colors.textMuted }
                ]}
              >
                {stop.name}
              </Text>
              <Text style={[styles.stopTimeText, { color: colors.textSubtle }]}>{stop.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Crew Contacts & Emergency */}
      <View style={[styles.crewRow, { borderTopColor: colors.border }]}>
        <View style={styles.driverMeta}>
          <Text style={[styles.driverName, { color: colors.text }]}>
            {schedule?.liveTracking?.driverName || 'Captain Sarath'}
          </Text>
          <Text style={[styles.driverRole, { color: colors.textMuted }]}>
            Conductor: {schedule?.liveTracking?.conductorName || 'Kamal'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCall}
          style={[styles.callBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Phone size={15} color="#ffffff" />
          <Text style={styles.callBtnText}>{t('callDriver')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  livePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarDotContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarWave: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.35,
  },
  radarCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveStatusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  speedText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapGraphicCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  roadTrack: {
    height: 52,
    justifyContent: 'center',
    position: 'relative',
  },
  asphalt: {
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  laneCenterDashes: {
    height: 2,
    borderBottomWidth: 2,
    borderColor: '#facc15',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  busPinPosition: {
    position: 'absolute',
    top: 4,
    marginLeft: -16,
    alignItems: 'center',
  },
  busPinHalo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  busPinIcon: {
    fontSize: 18,
  },
  busCallout: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    marginTop: 2,
  },
  calloutText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  terminalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  termPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  termCity: {
    fontSize: 12,
    fontWeight: '700',
  },
  highwayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextStopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
  },
  nextStopIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStopInfo: {
    flex: 1,
  },
  nextStopLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextStopName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  timelineSection: {
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stopTimelineCol: {
    width: 24,
    alignItems: 'center',
  },
  futureStopCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  stopConnectorLine: {
    width: 2,
    height: 22,
    marginVertical: 2,
  },
  stopInfoCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
    paddingTop: 1,
  },
  stopNameText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stopTimeText: {
    fontSize: 11,
  },
  crewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 6,
  },
  driverMeta: {
    flex: 1,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '700',
  },
  driverRole: {
    fontSize: 11,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

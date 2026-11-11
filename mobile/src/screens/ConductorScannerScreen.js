import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import { api } from '../services/api';
import { ScanLine, CheckCircle2, XCircle, Users, Bus, Search } from 'lucide-react-native';

export default function ConductorScannerScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [pnrInput, setPnrInput] = useState('YTH-88391-LK');
  const [scanResult, setScanResult] = useState(null);
  const [boardedCount, setBoardedCount] = useState(24);
  const totalBusSeats = 40;

  const handleSimulatedScan = async () => {
    if (!pnrInput.trim()) {
      Alert.alert('Enter Code', 'Please enter a ticket PNR or QR string to validate.');
      return;
    }

    // Pass valid format
    const qrString = `YATHRA|${pnrInput}|ND-8492|SEATS:A3,A4|TOTAL:3700`;
    const res = await api.verifyTicketQr(qrString);
    setScanResult(res);
    if (res.valid) {
      setBoardedCount(prev => Math.min(totalBusSeats, prev + 2));
    }
  };

  const clearScan = () => {
    setScanResult(null);
    setPnrInput('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('conductorMode')}
        subtitle="Conductor Gate & Ticket Verification"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Boarding Manifest Counter Card */}
        <View style={[styles.manifestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.manifestHeader}>
            <View style={styles.busMetaCol}>
              <Text style={[styles.busName, { color: colors.text }]}>ND-8492 (Yathra Royal)</Text>
              <Text style={[styles.routeTag, { color: colors.primary }]}>Colombo Fort ➔ Kandy</Text>
            </View>
            <View style={[styles.counterBadge, { backgroundColor: colors.primaryLight }]}>
              <Users size={16} color={colors.primary} />
              <Text style={[styles.counterText, { color: colors.primaryDark }]}>
                {boardedCount} / {totalBusSeats} Boarded
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(boardedCount / totalBusSeats) * 100}%`, backgroundColor: colors.accent }
              ]}
            />
          </View>
        </View>

        {/* Simulated Camera Viewfinder */}
        <View style={[styles.viewfinderCard, { backgroundColor: '#0f172a', borderColor: colors.border }]}>
          <View style={styles.viewfinderFrame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />

            <View style={styles.scanLaserLine} />

            <ScanLine size={48} color="#38bdf8" />
            <Text style={styles.viewfinderPrompt}>Point device camera at passenger QR ticket</Text>
          </View>
        </View>

        {/* Manual PNR / Code Input */}
        <View style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.manualTitle, { color: colors.text }]}>Manual PNR / Ticket Code Verification</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. YTH-88391-LK"
              placeholderTextColor={colors.textSubtle}
              value={pnrInput}
              onChangeText={setPnrInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={handleSimulatedScan}
              style={[styles.verifyBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Validation Result Box */}
        {scanResult && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: scanResult.valid ? '#dcfce7' : '#fee2e2',
                borderColor: scanResult.valid ? '#86efac' : '#fca5a5'
              }
            ]}
          >
            <View style={styles.resultHeader}>
              {scanResult.valid ? (
                <CheckCircle2 size={24} color="#15803d" />
              ) : (
                <XCircle size={24} color="#dc2626" />
              )}
              <Text
                style={[
                  styles.resultStatusText,
                  { color: scanResult.valid ? '#15803d' : '#dc2626' }
                ]}
              >
                {scanResult.status || scanResult.message}
              </Text>
            </View>

            {scanResult.valid && (
              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.resLabel}>Passenger:</Text>
                  <Text style={styles.resVal}>{scanResult.passengerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.resLabel}>Assigned Seats:</Text>
                  <Text style={[styles.resVal, { fontWeight: '900', color: '#15803d' }]}>
                    {scanResult.seats?.replace('SEATS:', '')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.resLabel}>PNR Reference:</Text>
                  <Text style={styles.resVal}>{scanResult.pnr}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.resLabel}>Timestamp:</Text>
                  <Text style={styles.resVal}>{scanResult.verifiedAt}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={clearScan}
              style={[
                styles.dismissBtn,
                { backgroundColor: scanResult.valid ? '#15803d' : '#dc2626' }
              ]}
            >
              <Text style={styles.dismissBtnText}>Scan Next Passenger</Text>
            </TouchableOpacity>
          </View>
        )}
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
  manifestCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  busMetaCol: {
    flex: 1,
  },
  busName: {
    fontSize: 14,
    fontWeight: '800',
  },
  routeTag: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  viewfinderCard: {
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  viewfinderFrame: {
    width: 200,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#38bdf8',
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLaserLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#ef4444',
  },
  viewfinderPrompt: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  manualCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  manualTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '800',
  },
  verifyBtn: {
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  resultStatusText: {
    fontSize: 14,
    fontWeight: '900',
  },
  resultDetails: {
    paddingVertical: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  resVal: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  dismissBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  dismissBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

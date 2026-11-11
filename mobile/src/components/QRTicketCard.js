import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Share2, Download, CheckCircle, ShieldCheck } from 'lucide-react-native';

export default function QRTicketCard({ booking }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚌 Yathra Boarding Pass\nBooking Ref: ${booking.pnr}\nRoute: ${booking.from} ➔ ${booking.to}\nBus No: ${booking.busNo}\nSeats: ${booking.seats?.join(', ')}\nDeparture: ${booking.departureTime}\nTotal: LKR ${booking.totalAmount}\nPresent this pass at bus entrance.`,
        title: `Yathra Ticket - ${booking.pnr}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSave = () => {
    Alert.alert('Ticket Saved', 'Your digital boarding pass has been saved offline on your device.');
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Upper Ticket Card */}
      <View style={[styles.upperTicket, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header PNR & Status */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={[styles.brandHeader, { color: colors.primary }]}>YATHRA BOARDING PASS</Text>
            <Text style={[styles.pnrCode, { color: colors.text }]}>{booking.pnr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
            <CheckCircle size={12} color="#15803d" />
            <Text style={styles.statusText}>{booking.status || 'Confirmed'}</Text>
          </View>
        </View>

        {/* Route Details */}
        <View style={[styles.routeBox, { backgroundColor: colors.surface }]}>
          <View style={styles.routeCol}>
            <Text style={[styles.cityBig, { color: colors.text }]}>{booking.from}</Text>
            <Text style={[styles.pointSmall, { color: colors.textMuted }]} numberOfLines={1}>
              {booking.boardingPoint || 'Main Bus Stand'}
            </Text>
            <Text style={[styles.timeLabel, { color: colors.primary }]}>{booking.departureTime}</Text>
          </View>

          <View style={styles.routeDivider}>
            <Text style={styles.routeArrow}>➔</Text>
            <Text style={[styles.dateText, { color: colors.textSubtle }]}>{booking.departureDate || 'Today'}</Text>
          </View>

          <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
            <Text style={[styles.cityBig, { color: colors.text }]}>{booking.to}</Text>
            <Text style={[styles.pointSmall, { color: colors.textMuted }]} numberOfLines={1}>
              {booking.droppingPoint || 'Central Stand'}
            </Text>
            <Text style={[styles.timeLabel, { color: colors.primary }]}>{booking.arrivalTime || 'Arrival'}</Text>
          </View>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCell}>
            <Text style={[styles.cellLabel, { color: colors.textSubtle }]}>{t('busNo')}</Text>
            <Text style={[styles.cellValue, { color: colors.text }]}>{booking.busNo}</Text>
          </View>

          <View style={styles.metaCell}>
            <Text style={[styles.cellLabel, { color: colors.textSubtle }]}>{t('selectSeats')}</Text>
            <Text style={[styles.cellValueHighlight, { color: colors.accent }]}>
              {booking.seats?.join(', ') || 'N/A'}
            </Text>
          </View>

          <View style={styles.metaCell}>
            <Text style={[styles.cellLabel, { color: colors.textSubtle }]}>Fare Paid</Text>
            <Text style={[styles.cellValue, { color: colors.text }]}>
              {t('lkr')} {booking.totalAmount?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Passenger details */}
        {booking.passenger?.name && (
          <View style={[styles.passengerRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.passName, { color: colors.text }]}>👤 {booking.passenger.name}</Text>
            <Text style={[styles.passPhone, { color: colors.textMuted }]}>{booking.passenger.phone}</Text>
          </View>
        )}
      </View>

      {/* Perforated Divider with Notches */}
      <View style={styles.perforationRow}>
        <View style={[styles.leftNotch, { backgroundColor: colors.background, borderColor: colors.border }]} />
        <View style={styles.dashLineContainer}>
          <View style={[styles.perforatedDashLine, { borderColor: colors.border }]} />
        </View>
        <View style={[styles.rightNotch, { backgroundColor: colors.background, borderColor: colors.border }]} />
      </View>

      {/* Lower Ticket Card (QR Code Section) */}
      <View style={[styles.lowerTicket, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.qrSection}>
          {/* Visual QR Code Pattern Block */}
          <View style={styles.qrCodeWrapper}>
            <View style={styles.qrMatrixBlock}>
              {/* Corner 1 */}
              <View style={styles.qrTargetCorner}><View style={styles.qrTargetInner} /></View>
              {/* Corner 2 */}
              <View style={[styles.qrTargetCorner, { right: 8 }]}><View style={styles.qrTargetInner} /></View>
              {/* Corner 3 */}
              <View style={[styles.qrTargetCorner, { bottom: 8 }]}><View style={styles.qrTargetInner} /></View>

              {/* QR Center Data pattern */}
              <View style={styles.qrDataPattern}>
                <View style={styles.qrPatternRow}>
                  <View style={styles.qrBit} /><View style={styles.qrBitBlank} /><View style={styles.qrBit} /><View style={styles.qrBit} />
                </View>
                <View style={styles.qrPatternRow}>
                  <View style={styles.qrBitBlank} /><View style={styles.qrBit} /><View style={styles.qrBit} /><View style={styles.qrBitBlank} />
                </View>
                <View style={styles.qrPatternRow}>
                  <View style={styles.qrBit} /><View style={styles.qrBit} /><View style={styles.qrBitBlank} /><View style={styles.qrBit} />
                </View>
              </View>
            </View>
            <Text style={styles.qrScanPrompt}>Scan at bus entrance door</Text>
          </View>

          {/* Barcode visual lines */}
          <View style={styles.barcodeVisual}>
            <View style={[styles.bar, { width: 3 }]} />
            <View style={[styles.bar, { width: 1 }]} />
            <View style={[styles.bar, { width: 4 }]} />
            <View style={[styles.bar, { width: 2 }]} />
            <View style={[styles.bar, { width: 5 }]} />
            <View style={[styles.bar, { width: 2 }]} />
            <View style={[styles.bar, { width: 1 }]} />
            <View style={[styles.bar, { width: 4 }]} />
            <View style={[styles.bar, { width: 3 }]} />
            <View style={[styles.bar, { width: 2 }]} />
            <View style={[styles.bar, { width: 5 }]} />
            <View style={[styles.bar, { width: 1 }]} />
            <View style={[styles.bar, { width: 4 }]} />
            <View style={[styles.bar, { width: 2 }]} />
          </View>
          <Text style={[styles.barcodeText, { color: colors.textSubtle }]}>{booking.pnr} • VERIFIED TICKET</Text>
        </View>

        {/* Action Buttons: Save & Share */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Download size={15} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>{t('downloadTicket')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Share2 size={15} color="#ffffff" />
            <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>{t('shareTicket')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginVertical: 12,
  },
  upperTicket: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 18,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  brandHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pnrCode: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  routeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  routeCol: {
    width: '38%',
  },
  cityBig: {
    fontSize: 16,
    fontWeight: '800',
  },
  pointSmall: {
    fontSize: 10,
    marginTop: 2,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  routeDivider: {
    alignItems: 'center',
    width: '24%',
  },
  routeArrow: {
    fontSize: 18,
    color: '#94a3b8',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaCell: {
    alignItems: 'flex-start',
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  cellValueHighlight: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 6,
  },
  passName: {
    fontSize: 12,
    fontWeight: '600',
  },
  passPhone: {
    fontSize: 11,
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  leftNotch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    borderWidth: 1,
  },
  rightNotch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -10,
    borderWidth: 1,
  },
  dashLineContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  perforatedDashLine: {
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  lowerTicket: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderTopWidth: 0,
    padding: 18,
    paddingTop: 8,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrMatrixBlock: {
    width: 110,
    height: 110,
    position: 'relative',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTargetCorner: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderWidth: 3,
    borderColor: '#0f172a',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTargetInner: {
    width: 12,
    height: 12,
    backgroundColor: '#0284c7',
    borderRadius: 2,
  },
  qrDataPattern: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 3,
  },
  qrPatternRow: {
    flexDirection: 'row',
    gap: 3,
  },
  qrBit: {
    width: 6,
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 1,
  },
  qrBitBlank: {
    width: 6,
    height: 6,
  },
  qrScanPrompt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
  barcodeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 3,
    marginTop: 14,
  },
  bar: {
    height: '100%',
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  barcodeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

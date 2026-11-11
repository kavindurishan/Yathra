import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun, Globe } from 'lucide-react-native';

export default function Header({ title, showBack = false, onBack, subtitle }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();

  const cycleLanguage = () => {
    if (lang === 'en') setLang('si');
    else if (lang === 'si') setLang('ta');
    else setLang('en');
  };

  const langLabels = { en: 'EN', si: 'සිං', ta: 'தம' };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.logoIconBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.logoIconText, { color: colors.primary }]}>🚌</Text>
          </View>
        )}

        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.text }]}>{title || 'Yathra'}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Language switcher pill */}
        <TouchableOpacity
          onPress={cycleLanguage}
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Globe size={15} color={colors.primary} />
          <Text style={[styles.langText, { color: colors.primary }]}>{langLabels[lang]}</Text>
        </TouchableOpacity>

        {/* Dark/Light mode toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          {isDark ? (
            <Sun size={17} color={colors.warning} />
          ) : (
            <Moon size={17} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIconText: {
    fontSize: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

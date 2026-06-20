import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';

export function AuthLayout({ children, title = 'CampusCare' }: PropsWithChildren<{ title?: string }>) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.logo}>CampusCare</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Laporkan dan pantau perbaikan fasilitas kampus.</Text>
      </View>
      {children}
    </Screen>
  );
}
const styles = StyleSheet.create({ header: { marginTop: 24, marginBottom: 16, gap: 8 }, logo: { fontSize: 28, fontWeight: '900', color: '#2563EB' }, title: { fontSize: 22, fontWeight: '800', color: '#0F172A' }, subtitle: { color: '#64748B' } });

import type { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  if (!scroll) return <SafeAreaView style={styles.safe}><View style={styles.container}>{children}</View></SafeAreaView>;
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flexGrow: 1, padding: 16, gap: 12 },
});

import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
});

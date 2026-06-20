import { StyleSheet, Text } from 'react-native';

export function Badge({ label }: { label: string }) {
  return <Text style={styles.badge}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: '700', overflow: 'hidden' },
});

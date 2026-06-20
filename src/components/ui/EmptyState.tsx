import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return <View style={styles.wrap}><Text style={styles.title}>{title}</Text>{message ? <Text style={styles.msg}>{message}</Text> : null}</View>;
}
const styles = StyleSheet.create({ wrap: { padding: 24, alignItems: 'center', gap: 8 }, title: { fontWeight: '800', fontSize: 16, color: '#0F172A' }, msg: { color: '#64748B', textAlign: 'center' } });

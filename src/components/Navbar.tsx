import { StyleSheet, Text, View } from 'react-native';
export function Navbar({ title }: { title: string }) {
  return <View style={styles.nav}><Text style={styles.title}>{title}</Text></View>;
}
const styles = StyleSheet.create({ nav: { paddingVertical: 8 }, title: { fontSize: 24, fontWeight: '900', color: '#0F172A' } });

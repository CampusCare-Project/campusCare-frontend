import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return <View style={styles.wrap}><ActivityIndicator /><Text>{text}</Text></View>;
}

const styles = StyleSheet.create({ wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 } });

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export function Button({ title, onPress, loading, variant = 'primary', disabled }: { title: string; onPress?: () => void; loading?: boolean; variant?: 'primary' | 'danger' | 'secondary'; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.button, styles[variant], (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator /> : <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  primary: { backgroundColor: '#2563EB' },
  danger: { backgroundColor: '#DC2626' },
  secondary: { backgroundColor: '#E2E8F0' },
  disabled: { opacity: 0.6 },
  text: { color: 'white', fontWeight: '700' },
  secondaryText: { color: '#0F172A' },
});

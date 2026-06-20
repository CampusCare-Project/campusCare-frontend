import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export function Input({ label, error, ...props }: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor="#94A3B8" style={[styles.input, error && styles.inputError]} {...props} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontWeight: '700', color: '#0F172A' },
  input: { backgroundColor: 'white', borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 12, padding: 12, color: '#0F172A' },
  inputError: { borderColor: '#DC2626' },
  error: { color: '#DC2626', fontSize: 12 },
});

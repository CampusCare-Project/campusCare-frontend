import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type SearchInputProps = TextInputProps & {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
  helperText?: string;
};

export function SearchInput({
  label,
  value,
  onChangeText,
  onClear,
  helperText,
  placeholder = "Cari data...",
  style,
  ...props
}: SearchInputProps) {
  const clearSearch = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.inputWrap}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={[styles.input, style]}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {value.trim() ? (
          <Pressable style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "900",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 10,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#475569",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748B",
  },
});
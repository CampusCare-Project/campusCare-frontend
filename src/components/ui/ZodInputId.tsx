import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import {
  getFirstFieldError,
  hasFieldError,
  type ZodFieldErrors,
} from "@/utils/zodErrors";

type ZodInputProps = TextInputProps & {
  name: string;
  label?: string;
  errors?: ZodFieldErrors;
  clearError?: (fieldName: string) => void;
  helperText?: string;
  required?: boolean;
};

export function ZodInput({
  name,
  label,
  errors = {},
  clearError,
  helperText,
  required = false,
  value,
  onChangeText,
  style,
  ...props
}: ZodInputProps) {
  const errorMessage = getFirstFieldError(errors, name);
  const errorActive = hasFieldError(errors, name);

  const handleChangeText = (text: string) => {
    if (errorActive && clearError) {
      clearError(name);
    }

    onChangeText?.(text);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholderTextColor="#94A3B8"
        style={[
          styles.input,
          errorActive && styles.inputError,
          style,
        ]}
        {...props}
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748B",
  },
});
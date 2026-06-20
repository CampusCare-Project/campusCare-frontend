import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type SelectorInputProps<T> = {
  label?: string;
  placeholder?: string;

  options: T[];
  value: T | null;
  onSelect: (item: T) => void;

  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  getDescription?: (item: T) => string | undefined;

  loading?: boolean;
  error?: string | null;
  disabled?: boolean;

  emptyText?: string;
  maxVisibleItems?: number;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string) {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function getSearchScore(label: string, query: string) {
  const target = normalizeText(label);
  const q = normalizeText(query);

  if (!q) return 1;
  if (target === q) return 100;
  if (target.startsWith(q)) return 90;
  if (target.includes(q)) return 75;

  const targetWords = target.split(" ");
  const queryWords = q.split(" ");

  const wordMatch = queryWords.every((word) =>
    targetWords.some((targetWord) => targetWord.includes(word))
  );

  if (wordMatch) return 65;

  const distance = levenshtein(target, q);
  const maxLength = Math.max(target.length, q.length);
  const similarity = 1 - distance / maxLength;

  if (similarity >= 0.65) return Math.round(similarity * 50);

  return 0;
}

export function SelectorInput<T>({
  label,
  placeholder = "Cari dan pilih data",
  options,
  value,
  onSelect,
  getLabel,
  getValue,
  getDescription,
  loading = false,
  error = null,
  disabled = false,
  emptyText = "Data tidak ditemukan",
  maxVisibleItems = 8,
}: SelectorInputProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(getLabel(value));
    }
  }, [value, getLabel]);

  const filteredOptions = useMemo(() => {
    const q = normalizeText(query);

    const scored = options
      .map((item) => {
        const label = getLabel(item);
        const score = getSearchScore(label, q);

        return {
          item,
          score,
          label,
        };
      })
      .filter((entry) => {
        if (!q) return true;
        return entry.score > 0;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxVisibleItems)
      .map((entry) => entry.item);

    return scored;
  }, [options, query, getLabel, maxVisibleItems]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setOpen(true);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery(getLabel(item));
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputWrapper, disabled && styles.disabledInput]}>
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          editable={!disabled}
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />

        {loading ? <ActivityIndicator size="small" /> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {open && !disabled ? (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Memuat data...</Text>
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => getValue(item)}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}
              renderItem={({ item }) => {
                const selected = value
                  ? getValue(value) === getValue(item)
                  : false;

                return (
                  <Pressable
                    style={[
                      styles.optionItem,
                      selected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{getLabel(item)}</Text>

                      {getDescription ? (
                        <Text style={styles.optionDescription}>
                          {getDescription(item)}
                        </Text>
                      ) : null}
                    </View>

                    {selected ? (
                      <Text style={styles.selectedMark}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
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
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  disabledInput: {
    backgroundColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 10,
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
  },
  optionItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  optionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  selectedMark: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 8,
  },
  emptyBox: {
    padding: 14,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: "#DC2626",
  },
});
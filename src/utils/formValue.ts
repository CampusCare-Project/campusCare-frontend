export function toNumberOrUndefined(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const numberValue = Number(trimmed);

  if (Number.isNaN(numberValue)) {
    return value;
  }

  return numberValue;
}

export function isInvalidNumberInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;

  return Number.isNaN(Number(trimmed));
}
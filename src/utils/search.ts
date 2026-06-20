export function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchInFields(query: string, fields: unknown[]) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => {
    return normalizeSearchText(field).includes(normalizedQuery);
  });
}

export function filterBySearch<T>(
  items: T[],
  query: string,
  getFields: (item: T) => unknown[]
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    return searchInFields(normalizedQuery, getFields(item));
  });
}
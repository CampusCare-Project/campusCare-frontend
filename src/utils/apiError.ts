export function getApiErrorMessage(error: any, fallback = "Terjadi kesalahan") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}
import { useCallback, useState } from "react";
import {
  parseApiZodError,
  type ZodFieldErrors,
} from "@/utils/zodErrors";

export function useZodFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<ZodFieldErrors>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const setFromApiError = useCallback((error: any) => {
    const parsed = parseApiZodError(error);

    setFieldErrors(parsed.fieldErrors);
    setFormErrors(parsed.formErrors);
    setMessage(parsed.message);

    return parsed;
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;

      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setFormErrors([]);
    setMessage(null);
  }, []);

  return {
    fieldErrors,
    formErrors,
    message,
    setFieldErrors,
    setFormErrors,
    setMessage,
    setFromApiError,
    clearFieldError,
    clearAllErrors,
  };
}
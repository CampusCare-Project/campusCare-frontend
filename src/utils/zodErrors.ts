export type ZodFieldErrors = Record<string, string[]>;

export type ParsedZodErrors = {
  message: string;
  formErrors: string[];
  fieldErrors: ZodFieldErrors;
};

export function parseApiZodError(error: any): ParsedZodErrors {
  const responseData = error?.response?.data;

  const message =
    responseData?.message ||
    error?.message ||
    "Terjadi kesalahan validasi";

  /** yes this shit is right bruhh
   * Support format:
   * {
   *   errors: {
   *     formErrors: [],
   *     fieldErrors: { name: ["..."] }
   *   }
   * }
   */
  const nestedFieldErrors = responseData?.errors?.fieldErrors;
  const nestedFormErrors = responseData?.errors?.formErrors;

  /**
   * Support format:
   * {
   *   errors: {
   *     name: ["..."],
   *     code: ["..."]
   *   }
   * }
   */
  const flatErrors = responseData?.errors;

  let fieldErrors: ZodFieldErrors = {};
  let formErrors: string[] = [];

  if (nestedFieldErrors && typeof nestedFieldErrors === "object") {
    fieldErrors = nestedFieldErrors;
  } else if (flatErrors && typeof flatErrors === "object") {
    fieldErrors = Object.fromEntries(
      Object.entries(flatErrors).filter(([_, value]) => Array.isArray(value))
    ) as ZodFieldErrors;
  }

  if (Array.isArray(nestedFormErrors)) {
    formErrors = nestedFormErrors;
  }

  return {
    message,
    formErrors,
    fieldErrors,
  };
}

export function getFirstFieldError(
  fieldErrors: ZodFieldErrors,
  fieldName: string
) {
  const errors = fieldErrors[fieldName];

  if (!errors || errors.length === 0) {
    return undefined;
  }

  return errors[0];
}

export function hasFieldError(
  fieldErrors: ZodFieldErrors,
  fieldName: string
) {
  return Boolean(fieldErrors[fieldName]?.length);
}
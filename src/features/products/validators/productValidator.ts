export interface ProductSearchValidation {
  valid: boolean;
  query: string;
  error?: string;
}

const MAX_SEARCH_LENGTH = 100;

export function validateProductSearch(
  input: unknown
): ProductSearchValidation {
  if (typeof input !== "string") {
    return {
      valid: false,
      query: "",
      error: "Search query must be text.",
    };
  }

  const query = input.trim();

  if (!query) {
    return {
      valid: false,
      query: "",
      error: "Please enter a product name.",
    };
  }

  if (query.length > MAX_SEARCH_LENGTH) {
    return {
      valid: false,
      query: "",
      error: `Search must not exceed ${MAX_SEARCH_LENGTH} characters.`,
    };
  }

  return {
    valid: true,
    query,
  };
}
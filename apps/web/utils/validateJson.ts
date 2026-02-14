export function validateJson(raw: string) {
  if (!raw || !raw.trim()) {
    return { valid: false, error: "JSON payload is required" };
  }

  if (raw.length > 50_000) {
    return { valid: false, error: "JSON payload exceeds 50KB limit" };
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { valid: false, error: "Root must be a JSON object" };
    }

    const forbiddenKeys = ["__proto__", "constructor", "prototype"];

    for (const key of Object.keys(parsed)) {
      if (forbiddenKeys.includes(key)) {
        return { valid: false, error: `Illegal property detected: ${key}` };
      }
    }

    return { valid: true, parsed };
  } catch (err: any) {
    return {
      valid: false,
      error: "Invalid JSON format"
    };
  }
}

export type SearchActionError =
  | "EMPTY_QUERY"
  | "TOO_SHORT"
  | "INVALID_CHARACTERS"
  | "LOOKS_LIKE_GIBBERISH"
  | "ONLY_NUMBERS"
  | "POTENTIALLY_UNSAFE_QUERY"
  | "OBSCENE_CONTENT";

export type SearchActionResult =
  | {
      success: true;
      normalizedQuery: string;
    }
  | {
      success: false;
      error: SearchActionError;
      message: string;
    };

const MULTI_SPACE_REGEX = /\s+/g;
const ALLOWED_CHARACTERS_REGEX = /^[\p{L}\s-]+$/u;
const ONLY_NUMBERS_REGEX = /^[\d\s-]+$/;
const HAS_VOWEL_REGEX = /[aeiou]/i;
const REPEATED_CHARS_REGEX = /(.)\1{2,}/;
const SQL_INJECTION_REGEX =
  /('|"|;|--|\/\*|\*\/|\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+\w+\s+set|or\s+1\s*=\s*1|sleep\s*\(|benchmark\s*\(|information_schema|xp_)\b)/i;
const OBSCENE_TERMS_REGEX =
  /\b(fuck|fucking|shit|bitch|asshole|motherfucker|cunt|puta|puto|mierda|carajo|concha|pija|culo|verga|porno|porn)\b/i;

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function toTitleCaseWord(word: string): string {
  return word
    .split("-")
    .map((part) => {
      if (!part) return part;
      return part[0].toUpperCase() + part.slice(1);
    })
    .join("-");
}

export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(MULTI_SPACE_REGEX, " ")
    .split(" ")
    .map(toTitleCaseWord)
    .join(" ");
}

export function hasSqlInjectionIndicators(query: string): boolean {
  return SQL_INJECTION_REGEX.test(query);
}

export function hasObsceneContent(query: string): boolean {
  return OBSCENE_TERMS_REGEX.test(query);
}

function hasKeyboardSequence(query: string): boolean {
  const compact = query.toLowerCase().replace(/[\s-]/g, "");

  for (const row of KEYBOARD_ROWS) {
    const reversed = row.split("").reverse().join("");

    for (let i = 0; i <= compact.length - 4; i += 1) {
      const fragment = compact.slice(i, i + 4);
      if (row.includes(fragment) || reversed.includes(fragment)) {
        return true;
      }
    }
  }

  return false;
}

export function validateNormalizedQuery(normalizedQuery: string): SearchActionResult | null {
  if (!normalizedQuery.trim()) {
    return {
      success: false,
      error: "EMPTY_QUERY",
      message: "Please enter a search query.",
    };
  }

  const compact = normalizedQuery.replace(/[\s-]/g, "");

  if (hasSqlInjectionIndicators(normalizedQuery)) {
    return {
      success: false,
      error: "POTENTIALLY_UNSAFE_QUERY",
      message: "Your query contains potentially unsafe patterns.",
    };
  }

  if (hasObsceneContent(normalizedQuery)) {
    return {
      success: false,
      error: "OBSCENE_CONTENT",
      message: "Your query contains inappropriate language.",
    };
  }

  if (compact.length < 2) {
    return {
      success: false,
      error: "TOO_SHORT",
      message: "Your query must have at least 2 letters.",
    };
  }

  if (ONLY_NUMBERS_REGEX.test(normalizedQuery)) {
    return {
      success: false,
      error: "ONLY_NUMBERS",
      message: "Queries cannot contain only numbers.",
    };
  }

  if (!ALLOWED_CHARACTERS_REGEX.test(normalizedQuery)) {
    return {
      success: false,
      error: "INVALID_CHARACTERS",
      message: "Only letters, spaces, and hyphens are allowed.",
    };
  }

  if (
    REPEATED_CHARS_REGEX.test(compact.toLowerCase()) ||
    hasKeyboardSequence(normalizedQuery) ||
    !HAS_VOWEL_REGEX.test(compact)
  ) {
    return {
      success: false,
      error: "LOOKS_LIKE_GIBBERISH",
      message: "This query looks like a typo or gibberish. Try a clearer term.",
    };
  }

  return null;
}

export async function searchAction(query: string): Promise<SearchActionResult> {
  "use server";

  const normalizedQuery = normalizeQuery(query);
  const validation = validateNormalizedQuery(normalizedQuery);

  if (validation) {
    return validation;
  }

  return {
    success: true,
    normalizedQuery,
  };
}

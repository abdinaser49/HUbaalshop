/**
 * HUBAAL SHOP - Flexible Quantity Parser
 * Allows entering quantity as either a pure number or as text with units/names.
 *
 * Supported formats:
 * - Pure Numbers: "2", "5", "0.5", "1.5", "10"
 * - Number with Units: "2 kartoon", "5 kiilo", "1.5 kg", "3 xabbo", "2 jawaan", "4 dhalo", "10 litir"
 * - Fractional expressions: "1/2", "1/4", "3/4"
 * - Somali Quantity Words: "badh", "nus", "kala bar", "hal", "laba", "sadex", "saddex", "afar", "shan"
 * - Standalone Unit Words: "kartoon", "kiilo", "jawaan", "xabbo", "dhalo" (defaults to 1 unit)
 */

export interface ParsedQuantity {
  numeric: number;
  display: string;
}

export function parseQuantity(rawQty: string | number): ParsedQuantity {
  if (typeof rawQty === 'number') {
    const val = isNaN(rawQty) || rawQty <= 0 ? 0 : rawQty;
    return { numeric: val, display: String(rawQty) };
  }

  const trimmed = (rawQty || '').trim();
  if (!trimmed) {
    return { numeric: 0, display: '' };
  }

  const lower = trimmed.toLowerCase();

  // Somali & English Fractions / Half / Quarter
  if (
    lower === 'badh' ||
    lower === 'nus' ||
    lower === 'kala bar' ||
    lower === 'kala-bar' ||
    lower === 'half' ||
    lower === '1/2'
  ) {
    return { numeric: 0.5, display: trimmed };
  }

  if (lower === 'rubac' || lower === 'quarter' || lower === '1/4') {
    return { numeric: 0.25, display: trimmed };
  }

  if (lower === '3/4') {
    return { numeric: 0.75, display: trimmed };
  }

  // Common Somali Number Words
  if (lower === 'hal' || lower === 'kow' || lower === 'one') {
    return { numeric: 1, display: trimmed };
  }
  if (lower === 'laba' || lower === 'two') {
    return { numeric: 2, display: trimmed };
  }
  if (lower === 'sadex' || lower === 'saddex' || lower === 'three') {
    return { numeric: 3, display: trimmed };
  }
  if (lower === 'afar' || lower === 'four') {
    return { numeric: 4, display: trimmed };
  }
  if (lower === 'shan' || lower === 'five') {
    return { numeric: 5, display: trimmed };
  }

  // Regex to extract number from text: e.g. "2 kartoon", "1.5 kiilo", "xabbo 3", "2.5kg"
  const match = trimmed.match(/(\d+(\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) {
      return { numeric: val, display: trimmed };
    }
  }

  // If no digits found, but user entered a descriptive noun (e.g. "kartoon", "kiilo", "jawaan", "xabbo")
  // treat as 1 unit of that item so that "kartoon" at $25 calculates 1 * $25 = $25
  return { numeric: 1, display: trimmed };
}

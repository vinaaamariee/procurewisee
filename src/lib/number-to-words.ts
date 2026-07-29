/**
 * numberToWords — converts a numeric amount to Philippine Peso words
 * Used on Appendix 61 Purchase Order document for the "Total Amount in Words" field.
 *
 * Example: 125340.00 → "One Hundred Twenty-Five Thousand Three Hundred Forty Pesos Only"
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function belowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const rem = n % 10;
    return TENS[Math.floor(n / 10)] + (rem ? "-" + ONES[rem] : "");
  }
  const rem = n % 100;
  return ONES[Math.floor(n / 100)] + " Hundred" + (rem ? " " + belowThousand(rem) : "");
}

function integerToWords(n: number): string {
  if (n === 0) return "Zero";

  const GROUPS = [
    { value: 1_000_000_000, label: "Billion" },
    { value: 1_000_000, label: "Million" },
    { value: 1_000, label: "Thousand" },
    { value: 1, label: "" },
  ];

  let result = "";
  let remaining = Math.floor(Math.abs(n));

  for (const { value, label } of GROUPS) {
    if (remaining >= value) {
      const chunk = Math.floor(remaining / value);
      remaining %= value;
      const chunkWords = belowThousand(chunk);
      result += (result ? " " : "") + chunkWords + (label ? " " + label : "");
    }
  }

  return result.trim();
}

/**
 * Converts a numeric peso amount to its written-out form.
 *
 * @param amount - The numeric amount (can include centavos)
 * @returns e.g. "One Hundred Twenty-Five Thousand Pesos Only" or
 *          "One Thousand Five Hundred Pesos and 50/100 Centavos"
 */
export function numberToWords(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) return "";

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const pesos = Math.floor(abs);
  const centavos = Math.round((abs - pesos) * 100);

  const pesoWords = integerToWords(pesos);
  let result = `${pesoWords} Peso${pesos !== 1 ? "s" : ""}`;

  if (centavos > 0) {
    result += ` and ${String(centavos).padStart(2, "0")}/100 Centavos`;
  } else {
    result += " Only";
  }

  return (isNegative ? "Negative " : "") + result;
}

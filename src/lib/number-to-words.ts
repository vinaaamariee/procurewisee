/**
 * Converts a numeric peso amount to Philippine English words form.
 * Used by the PO Appendix 61 "Total Amount in Words" field.
 * Output: "TWELVE THOUSAND THREE HUNDRED FORTY-FIVE PESOS AND 00/100"
 */

const ones = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY',
];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const remainder = n % 100;
  let result = '';
  if (h > 0) {
    result += ones[h] + ' HUNDRED';
    if (remainder > 0) result += ' ';
  }
  if (remainder > 0) {
    if (remainder < 20) {
      result += ones[remainder];
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      result += tens[t];
      if (o > 0) result += '-' + ones[o];
    }
  }
  return result;
}

function convertLargeNumber(n: number): string {
  if (n === 0) return 'ZERO';

  const billion = Math.floor(n / 1_000_000_000);
  const million = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((n % 1_000_000) / 1_000);
  const hundred = n % 1_000;

  const parts: string[] = [];
  if (billion > 0) parts.push(convertHundreds(billion) + ' BILLION');
  if (million > 0) parts.push(convertHundreds(million) + ' MILLION');
  if (thousand > 0) parts.push(convertHundreds(thousand) + ' THOUSAND');
  if (hundred > 0) parts.push(convertHundreds(hundred));

  return parts.join(' ');
}

/**
 * Converts a peso amount to its Philippine English words form.
 * @param amount - The numeric peso amount (e.g. 12345.67)
 * @returns Formatted string (e.g. "TWELVE THOUSAND THREE HUNDRED FORTY-FIVE PESOS AND 67/100")
 */
export function numberToWords(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const intPart = Math.floor(absAmount);
  const centsPart = Math.round((absAmount - intPart) * 100);

  const pesoWords = intPart === 0 ? 'ZERO' : convertLargeNumber(intPart);
  const centsStr = String(centsPart).padStart(2, '0');

  let result = `${pesoWords} PESOS AND ${centsStr}/100`;
  if (isNegative) result = 'MINUS ' + result;

  return result;
}

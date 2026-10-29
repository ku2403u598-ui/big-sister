/**
 * Pure helper functions for budgeting calculations, amount parsing,
 * privacy safety checks, and input validation.
 */

export interface ExpenseItem {
  name: string;
  amount: number;
  category?: 'fixed' | 'essential' | 'flexible' | 'occasional' | 'other';
  notes?: string;
}

export interface BudgetCalculationResult {
  income: number;
  totalExpenses: number;
  remainder: number;
  unallocatedPercentage: number;
  isDeficit: boolean;
  formattedRemainder: string;
  formattedIncome: string;
  formattedTotalExpenses: string;
}

/**
 * Format amounts in standard Indian Rupee notation (e.g. ₹18,000)
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absVal);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Parse colloquial Indian amounts like "18000", "₹18,000", "6.5k", "15k", "2 lakh"
 */
export function parseAmount(input: string): number | null {
  if (!input) return null;
  const cleaned = input.toLowerCase().replace(/,/g, '').trim();

  // match lakh
  const lakhMatch = cleaned.match(/([\d.]+)\s*(?:lakh|lac|l)\b/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return isNaN(val) ? null : Math.round(val * 100000);
  }

  // match k (thousands)
  const kMatch = cleaned.match(/([\d.]+)\s*k\b/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    return isNaN(val) ? null : Math.round(val * 1000);
  }

  // match plain numbers with optional currency symbol
  const numMatch = cleaned.match(/(?:rs\.?|inr|₹)?\s*([\d]+(?:\.\d+)?)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return isNaN(val) ? null : val;
  }

  return null;
}

/**
 * Compute budget remainder and unallocated amount.
 * Remainder is labelled unallocated, never assumed to be pure savings.
 */
export function calculateBudgetRemainder(income: number, expenses: ExpenseItem[]): BudgetCalculationResult {
  const safeIncome = Math.max(0, income);
  const totalExpenses = expenses.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  const remainder = safeIncome - totalExpenses;
  const isDeficit = remainder < 0;
  const unallocatedPercentage = safeIncome > 0 ? Math.max(0, Math.round((remainder / safeIncome) * 100)) : 0;

  return {
    income: safeIncome,
    totalExpenses,
    remainder,
    unallocatedPercentage,
    isDeficit,
    formattedIncome: formatINR(safeIncome),
    formattedTotalExpenses: formatINR(totalExpenses),
    formattedRemainder: formatINR(remainder),
  };
}

/**
 * Detect sensitive patterns like UPI IDs, 16-digit card numbers, or passwords
 * to warn users to keep their data private and redacted.
 */
export function detectSensitiveContent(text: string): { containsSensitive: boolean; issues: string[] } {
  const issues: string[] = [];

  // UPI pattern: string@bank
  const upiPattern = /\b[\w.\-_]{2,256}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|ibl|axl|upi)\b/i;
  if (upiPattern.test(text)) {
    issues.push('Possible UPI ID detected. Please avoid sharing real payment handles.');
  }

  // 16-digit card number pattern
  const cardPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;
  if (cardPattern.test(text)) {
    issues.push('Possible card number detected. Never share credit/debit card numbers.');
  }

  // OTP or PIN mention
  const pinPattern = /\b(?:my pin is|otp is|cvv is|upi pin)\s*[:=]?\s*\d{3,6}\b/i;
  if (pinPattern.test(text)) {
    issues.push('Possible PIN or OTP mentioned. Never share passwords or PINs.');
  }

  return {
    containsSensitive: issues.length > 0,
    issues,
  };
}

/**
 * Validate image attachment client & server side
 */
export function validateImageUpload(file: { size: number; type: string }): { valid: boolean; error?: string } {
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_MIME.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are supported.' };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Image size exceeds the 5MB limit. Please upload a smaller or compressed image.' };
  }

  return { valid: true };
}

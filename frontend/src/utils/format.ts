/**
 * Centralized Indian Rupee (INR) currency formatting utility.
 * Applies standard Indian numbering system (Lakhs / Crores grouping):
 * e.g., 899 -> "₹899"
 * e.g., 2499 -> "₹2,499"
 * e.g., 12999 -> "₹12,999"
 * e.g., 124999 -> "₹1,24,999"
 */
export function formatINR(
  amount: number | string | undefined | null,
  options?: { showDecimals?: boolean }
): string {
  if (amount === undefined || amount === null || amount === '') {
    return '₹0';
  }

  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) {
    return '₹0';
  }

  const useDecimals = options?.showDecimals ?? false;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: useDecimals ? 2 : 0,
    maximumFractionDigits: useDecimals ? 2 : 0,
  }).format(numeric);
}

// Convenient aliases for consistent codebase usage
export const formatPrice = formatINR;
export const formatCurrency = formatINR;

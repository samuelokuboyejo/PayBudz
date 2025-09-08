export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatSignedAmount(
  amount: number,
  currency: string,
  isCredit: boolean,
): string {
  const formatted = formatCurrency(amount, currency);
  return isCredit ? `+${formatted}` : `-${formatted}`;
}

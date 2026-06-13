export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

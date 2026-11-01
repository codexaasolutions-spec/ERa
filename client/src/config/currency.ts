export function formatMoney(amount: number, _currency: string = 'PKR') {
  return `PKR ${Number(amount || 0).toFixed(2)}`;
}

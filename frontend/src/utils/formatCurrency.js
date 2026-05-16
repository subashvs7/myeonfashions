export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatPrice = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

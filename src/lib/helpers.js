import { differenceInDays, format, parseISO } from 'date-fns';

export function formatCurrency(amount, locale = 'en') {
  if (amount == null) return '€0.00';
  return new Intl.NumberFormat(locale === 'el' ? 'el-GR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateStr, locale = 'en') {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, locale === 'el' ? 'dd/MM/yyyy' : 'MMM d, yyyy');
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return differenceInDays(date, new Date());
}

export function getUrgencyColor(days) {
  if (days == null) return 'text-muted-foreground';
  if (days < 0) return 'text-destructive';
  if (days <= 7) return 'text-destructive';
  if (days <= 30) return 'text-warning';
  if (days <= 60) return 'text-chart-3';
  return 'text-success';
}

export function getUrgencyBg(days) {
  if (days == null) return 'bg-muted';
  if (days < 0) return 'bg-destructive/10';
  if (days <= 7) return 'bg-destructive/10';
  if (days <= 30) return 'bg-warning/10';
  if (days <= 60) return 'bg-chart-3/10';
  return 'bg-success/10';
}

export const categoryIcons = {
  fuel: 'Fuel',
  service: 'Wrench',
  repairs: 'Hammer',
  tires: 'Circle',
  insurance: 'Shield',
  kteo: 'ClipboardCheck',
  tolls: 'Milestone',
  accessories: 'Sparkles',
  other: 'MoreHorizontal',
};

export const categoryColors = {
  fuel: 'bg-blue-500/10 text-blue-600',
  service: 'bg-emerald-500/10 text-emerald-600',
  repairs: 'bg-orange-500/10 text-orange-600',
  tires: 'bg-slate-500/10 text-slate-600',
  insurance: 'bg-violet-500/10 text-violet-600',
  kteo: 'bg-cyan-500/10 text-cyan-600',
  tolls: 'bg-amber-500/10 text-amber-600',
  accessories: 'bg-pink-500/10 text-pink-600',
  other: 'bg-gray-500/10 text-gray-600',
};
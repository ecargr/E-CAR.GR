import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getUrgencyBg } from '@/lib/helpers';
import { Link } from 'react-router-dom';
import StatCard from '@/components/shared/StatCard';
import LanguageSwitcher from '@/components/dashboard/LanguageSwitcher';
import PullToRefresh from '@/components/shared/PullToRefresh';
import {
  Car, Receipt, Wrench, Bell, Shield, ClipboardCheck,
  ArrowRight, Plus, AlertTriangle, FileX, FileWarning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { t, locale } = useI18n();

  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-date', 200) });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.ServiceRecord.list('-date', 10) });
  const { data: insurances = [] } = useQuery({ queryKey: ['insurances'], queryFn: () => base44.entities.InsurancePolicy.list() });
  const { data: kteos = [] } = useQuery({ queryKey: ['kteos'], queryFn: () => base44.entities.KteoRecord.list() });
  const { data: reminders = [] } = useQuery({ queryKey: ['reminders'], queryFn: () => base44.entities.Reminder.filter({ dismissed: false }, '-due_date', 20) });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTotal = expenses
    .filter(e => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const annualTotal = expenses
    .filter(e => new Date(e.date).getFullYear() === currentYear)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const activeReminders = reminders.filter(r => !r.dismissed && getDaysUntil(r.due_date) <= 60);

  const expiringItems = [
    ...insurances.filter(i => { const d = getDaysUntil(i.expiration_date); return d != null && d <= 60 && d >= 0; }).map(i => ({
      type: 'insurance', label: t('insurance'), vehicle_id: i.vehicle_id, date: i.expiration_date, days: getDaysUntil(i.expiration_date)
    })),
    ...kteos.filter(k => { const d = getDaysUntil(k.expiration_date); return d != null && d <= 60 && d >= 0; }).map(k => ({
      type: 'kteo', label: t('kteo'), vehicle_id: k.vehicle_id, date: k.expiration_date, days: getDaysUntil(k.expiration_date)
    }))
  ].sort((a, b) => a.days - b.days);

  // Missing document alerts
  const expensesWithoutDocs = expenses.filter(e => {
    const urls = e.receipt_urls || (e.receipt_url ? [e.receipt_url] : []);
    return urls.length === 0;
  });

  const vehiclesWithoutPurchaseDocs = vehicles.filter(v => {
    const docs = v.purchase_documents || [];
    return docs.length === 0;
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
      queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      queryClient.invalidateQueries({ queryKey: ['services'] }),
      queryClient.invalidateQueries({ queryKey: ['insurances'] }),
      queryClient.invalidateQueries({ queryKey: ['kteos'] }),
      queryClient.invalidateQueries({ queryKey: ['reminders'] }),
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Language Switcher */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight">{t('welcome_back')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Alerts */}
      {(expensesWithoutDocs.length > 0 || vehiclesWithoutPurchaseDocs.length > 0) && (
        <div className="space-y-2 mb-6">
          {expensesWithoutDocs.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              <FileWarning className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
                <span className="font-medium">{expensesWithoutDocs.length}</span> {t('expenses_without_docs')}
              </p>
              <Link to="/expenses">
                <Button variant="outline" size="sm" className="text-xs gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          )}
          {vehiclesWithoutPurchaseDocs.length > 0 && (
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
              <FileX className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                <span className="font-medium">{vehiclesWithoutPurchaseDocs.length}</span> {t('vehicles_without_purchase_docs')}
              </p>
              <Link to="/vehicles">
                <Button variant="outline" size="sm" className="text-xs gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <StatCard icon={Car} label={t('total_vehicles')} value={vehicles.length} color="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={Receipt} label={t('monthly_expenses')} value={formatCurrency(monthlyTotal, locale)} color="text-emerald-600" bgColor="bg-emerald-500/10" />
        <StatCard icon={Receipt} label={t('annual_expenses')} value={formatCurrency(annualTotal, locale)} color="text-violet-600" bgColor="bg-violet-500/10" />
        <StatCard icon={Bell} label={t('upcoming_reminders')} value={activeReminders.length} color="text-amber-600" bgColor="bg-amber-500/10" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/vehicles?action=add">
          <Button variant="outline" size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />{t('add_vehicle')}</Button>
        </Link>
        <Link to="/expenses?action=add">
          <Button variant="outline" size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />{t('add_expense')}</Button>
        </Link>
        <Link to="/services?action=add">
          <Button variant="outline" size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />{t('add_service')}</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold">{t('expiring_soon')}</h2>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="divide-y divide-border">
            {expiringItems.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">{t('no_data')}</p>
            ) : (
              expiringItems.slice(0, 5).map((item, i) => {
                const vehicle = vehicleMap[item.vehicle_id];
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getUrgencyBg(item.days))}>
                      {item.type === 'insurance' ? <Shield className={cn("w-4 h-4", getUrgencyColor(item.days))} /> : <ClipboardCheck className={cn("w-4 h-4", getUrgencyColor(item.days))} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label} — {vehicle?.name || vehicle?.make}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date, locale)}</p>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs shrink-0", getUrgencyColor(item.days))}>
                      {item.days} {t('days_remaining')}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold">{t('recent_expenses')}</h2>
            <Link to="/expenses" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              {t('view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">{t('no_data')}</p>
            ) : (
              expenses.slice(0, 5).map(exp => {
                const vehicle = vehicleMap[exp.vehicle_id];
                const urls = exp.receipt_urls || (exp.receipt_url ? [exp.receipt_url] : []);
                return (
                  <div key={exp.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", urls.length === 0 ? "bg-amber-500/10" : "bg-muted")}>
                      {urls.length === 0 ? <FileWarning className="w-4 h-4 text-amber-600" /> : <Receipt className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t(exp.category === 'tires' ? 'tires_cat' : exp.category === 'insurance' ? 'insurance_cat' : exp.category === 'kteo' ? 'kteo_cat' : exp.category)} — {vehicle?.name || vehicle?.make || '—'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(exp.date, locale)}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatCurrency(exp.amount, locale)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold">{t('recent_services')}</h2>
            <Link to="/services" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              {t('view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">{t('no_data')}</p>
            ) : (
              services.slice(0, 5).map(svc => {
                const vehicle = vehicleMap[svc.vehicle_id];
                return (
                  <div key={svc.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t(svc.service_type)} — {vehicle?.name || vehicle?.make || '—'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(svc.date, locale)}</p>
                    </div>
                    {svc.cost && <span className="text-sm font-semibold shrink-0">{formatCurrency(svc.cost, locale)}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold">{t('upcoming_reminders')}</h2>
            <Link to="/reminders" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              {t('view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {activeReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">{t('no_data')}</p>
            ) : (
              activeReminders.slice(0, 5).map(rem => {
                const days = getDaysUntil(rem.due_date);
                const vehicle = vehicleMap[rem.vehicle_id];
                return (
                  <div key={rem.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getUrgencyBg(days))}>
                      <Bell className={cn("w-4 h-4", getUrgencyColor(days))} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rem.title}</p>
                      <p className="text-xs text-muted-foreground">{vehicle?.name || '—'} · {formatDate(rem.due_date, locale)}</p>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs shrink-0", getUrgencyColor(days))}>
                      {days < 0 ? t('overdue') : days === 0 ? t('due_today') : `${days}d`}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}
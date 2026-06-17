import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import VehicleSelector from '@/components/shared/VehicleSelector';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#6b7280'];

export default function Reports() {
  const { t, locale } = useI18n();
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses-all'], queryFn: () => base44.entities.Expense.list('-date', 500) });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const filtered = vehicleFilter === 'all' ? expenses : expenses.filter(e => e.vehicle_id === vehicleFilter);

  const monthlyData = useMemo(() => {
    const months = {};
    filtered.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + (e.amount || 0);
    });
    return Object.entries(months).sort().slice(-12).map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const cats = {};
    filtered.forEach(e => {
      const cat = e.category || 'other';
      cats[cat] = (cats[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(cats).map(([name, value]) => ({
      name: t(name === 'tires' ? 'tires_cat' : name === 'insurance' ? 'insurance_cat' : name === 'kteo' ? 'kteo_cat' : name),
      value: Math.round(value * 100) / 100
    })).sort((a, b) => b.value - a.value);
  }, [filtered, t]);

  const vehicleCostData = useMemo(() => {
    const vCosts = {};
    expenses.forEach(e => {
      const v = vehicleMap[e.vehicle_id];
      const name = v?.name || v?.make || 'Unknown';
      vCosts[name] = (vCosts[name] || 0) + (e.amount || 0);
    });
    return Object.entries(vCosts).map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }));
  }, [expenses, vehicleMap]);

  const totalExpenses = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('reports')} actionIcon={BarChart3} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
        <p className="text-sm text-muted-foreground">{t('total')}: <span className="font-bold text-foreground">{formatCurrency(totalExpenses, locale)}</span></p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">{t('expense_trends')}</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [formatCurrency(val, locale), t('total')]}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-20 text-center">{t('no_data')}</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">{t('category_breakdown')}</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-20 text-center">{t('no_data')}</p>
          )}
        </div>

        {/* Cost Per Vehicle */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold mb-4">{t('cost_per_vehicle')}</h3>
          {vehicleCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vehicleCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [formatCurrency(val, locale), t('total')]}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {vehicleCostData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-20 text-center">{t('no_data')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
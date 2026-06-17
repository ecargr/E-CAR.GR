import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, categoryColors } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import VehicleSelector from '@/components/shared/VehicleSelector';
import { Receipt, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Expenses() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: expenses = [], isLoading } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-date', 200) });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); setDeleteId(null); }
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const filtered = vehicleFilter === 'all' ? expenses : expenses.filter(e => e.vehicle_id === vehicleFilter);

  const totalFiltered = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('expenses')} action={() => setShowForm(true)} actionLabel={t('add_expense')} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
        <div className="text-sm text-muted-foreground">
          {t('total')}: <span className="font-semibold text-foreground">{formatCurrency(totalFiltered, locale)}</span>
          <span className="ml-2">({filtered.length} records)</span>
        </div>
      </div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={Receipt} title={t('no_data')} actionLabel={t('add_expense')} action={() => setShowForm(true)} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('date')}</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('vehicles')}</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('category')}</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">{t('amount')}</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">{t('mileage')}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(exp => {
                  const vehicle = vehicleMap[exp.vehicle_id];
                  const catKey = exp.category === 'tires' ? 'tires_cat' : exp.category === 'insurance' ? 'insurance_cat' : exp.category === 'kteo' ? 'kteo_cat' : exp.category;
                  return (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm">{formatDate(exp.date, locale)}</td>
                      <td className="px-4 py-3 text-sm">{vehicle?.name || vehicle?.make || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn("text-xs", categoryColors[exp.category])}>{t(catKey)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(exp.amount, locale)}</td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">{exp.mileage ? `${exp.mileage.toLocaleString()} km` : '—'}</td>
                      <td className="px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditItem(exp); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(exp.id)} className="text-destructive">
                              <Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          expense={editItem}
          vehicles={vehicles}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
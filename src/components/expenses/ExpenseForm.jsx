import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import VehicleSelector from '@/components/shared/VehicleSelector';

const categories = ['fuel', 'service', 'repairs', 'tires', 'insurance', 'kteo', 'tolls', 'accessories', 'other'];

export default function ExpenseForm({ open, onClose, expense, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!expense;

  const [form, setForm] = useState({
    vehicle_id: expense?.vehicle_id || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    amount: expense?.amount || '',
    category: expense?.category || 'fuel',
    notes: expense?.notes || '',
    mileage: expense?.mileage || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? base44.entities.Expense.update(expense.id, data) : base44.entities.Expense.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      amount: Number(form.amount),
      mileage: form.mileage ? Number(form.mileage) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('edit') : t('add')} {t('expenses')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('vehicles')}</Label>
            <VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('date')}</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <Label>{t('amount')} (€)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
          </div>
          <div>
            <Label>{t('category')}</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{t(c === 'tires' ? 'tires_cat' : c === 'insurance' ? 'insurance_cat' : c === 'kteo' ? 'kteo_cat' : c)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('mileage')} (km)</Label>
            <Input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} />
          </div>
          <div>
            <Label>{t('notes_label')}</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending}>{t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
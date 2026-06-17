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

const serviceTypes = ['oil_change', 'filters', 'brake_service', 'battery_replacement', 'timing_belt', 'ac_service', 'major_service', 'other'];

export default function ServiceForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;

  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    date: record?.date || new Date().toISOString().split('T')[0],
    mileage: record?.mileage || '',
    service_type: record?.service_type || 'oil_change',
    service_center: record?.service_center || '',
    cost: record?.cost || '',
    notes: record?.notes || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? base44.entities.ServiceRecord.update(record.id, data) : base44.entities.ServiceRecord.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('edit') : t('add')} {t('services')}</DialogTitle>
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
              <Label>{t('service_type')}</Label>
              <Select value={form.service_type} onValueChange={v => set('service_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(st => <SelectItem key={st} value={st}>{t(st)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t('service_center')}</Label>
            <Input value={form.service_center} onChange={e => set('service_center', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('cost')} (€)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} />
            </div>
            <div>
              <Label>{t('mileage')} (km)</Label>
              <Input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} />
            </div>
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
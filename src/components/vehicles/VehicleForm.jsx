import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Bike } from 'lucide-react';

const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'];

export default function VehicleForm({ open, onClose, vehicle }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!vehicle;

  const [form, setForm] = useState({
    name: vehicle?.name || '',
    type: vehicle?.type || 'car',
    registration_number: vehicle?.registration_number || '',
    vin: vehicle?.vin || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    fuel_type: vehicle?.fuel_type || 'gasoline',
    engine_capacity: vehicle?.engine_capacity || '',
    horsepower: vehicle?.horsepower || '',
    color: vehicle?.color || '',
    purchase_date: vehicle?.purchase_date || '',
    purchase_price: vehicle?.purchase_price || '',
    current_mileage: vehicle?.current_mileage || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? base44.entities.Vehicle.update(vehicle.id, data) : base44.entities.Vehicle.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vehicles'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      year: form.year ? Number(form.year) : undefined,
      engine_capacity: form.engine_capacity ? Number(form.engine_capacity) : undefined,
      horsepower: form.horsepower ? Number(form.horsepower) : undefined,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      current_mileage: form.current_mileage ? Number(form.current_mileage) : undefined,
    };
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('edit') : t('add')} {t('vehicles')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={form.type === 'car' ? 'default' : 'outline'} size="sm" onClick={() => set('type', 'car')} className="gap-1.5">
              <Car className="w-4 h-4" /> {t('car')}
            </Button>
            <Button type="button" variant={form.type === 'motorcycle' ? 'default' : 'outline'} size="sm" onClick={() => set('type', 'motorcycle')} className="gap-1.5">
              <Bike className="w-4 h-4" /> {t('motorcycle')}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>{t('vehicle_name')}</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <Label>{t('make')}</Label>
              <Input value={form.make} onChange={e => set('make', e.target.value)} required />
            </div>
            <div>
              <Label>{t('model')}</Label>
              <Input value={form.model} onChange={e => set('model', e.target.value)} required />
            </div>
            <div>
              <Label>{t('year')}</Label>
              <Input type="number" value={form.year} onChange={e => set('year', e.target.value)} />
            </div>
            <div>
              <Label>{t('registration_number')}</Label>
              <Input value={form.registration_number} onChange={e => set('registration_number', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>{t('vin_number')}</Label>
              <Input value={form.vin} onChange={e => set('vin', e.target.value)} />
            </div>
            <div>
              <Label>{t('fuel_type')}</Label>
              <Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fuelTypes.map(ft => <SelectItem key={ft} value={ft}>{t(ft)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('engine_capacity')} (cc)</Label>
              <Input type="number" value={form.engine_capacity} onChange={e => set('engine_capacity', e.target.value)} />
            </div>
            <div>
              <Label>{t('horsepower')}</Label>
              <Input type="number" value={form.horsepower} onChange={e => set('horsepower', e.target.value)} />
            </div>
            <div>
              <Label>{t('color')}</Label>
              <Input value={form.color} onChange={e => set('color', e.target.value)} />
            </div>
            <div>
              <Label>{t('purchase_date')}</Label>
              <Input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
            </div>
            <div>
              <Label>{t('purchase_price')} (€)</Label>
              <Input type="number" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>{t('current_mileage')} (km)</Label>
              <Input type="number" value={form.current_mileage} onChange={e => set('current_mileage', e.target.value)} />
            </div>
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
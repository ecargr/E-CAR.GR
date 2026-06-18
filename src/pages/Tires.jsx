import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleSelector from '@/components/shared/VehicleSelector';
import AttachmentsUploader from '@/components/shared/AttachmentsUploader';
import { CircleDot, Pencil, Trash2, MoreVertical, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const seasonTypes = ['summer', 'winter', 'all_season'];
const actionTypes = ['installation', 'rotation', 'repair', 'replacement'];

function TireForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
  const defaultReminderDate = twoYearsLater.toISOString().split('T')[0];

  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    brand: record?.brand || '',
    model: record?.model || '',
    size: record?.size || '',
    seasonal_type: record?.seasonal_type || 'all_season',
    installation_date: record?.installation_date || '',
    mileage_at_installation: record?.mileage_at_installation || '',
    action_type: record?.action_type || 'installation',
    cost: record?.cost || '',
    notes: record?.notes || '',
    photos: record?.photos || [],
    reminder_date: defaultReminderDate,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const autoCreateExpense = async () => {
    if (!form.cost || isEdit) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    await base44.entities.Expense.create({
      vehicle_id: form.vehicle_id,
      date: form.installation_date || new Date().toISOString().split('T')[0],
      amount: Number(form.cost),
      category: 'tires',
      notes: `${t('tires')}: ${form.brand} ${form.model || ''} — ${t(form.action_type)}${vehicle ? ' — ' + (vehicle.name || vehicle.make + ' ' + vehicle.model) : ''}`,
    });
  };

  const autoCreateReminder = async () => {
    if (isEdit) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    await base44.entities.Reminder.create({
      vehicle_id: form.vehicle_id,
      type: 'tire',
      title: `${t('tires')}: ${form.brand} ${form.model || ''} — ${vehicle?.name || vehicle?.make + ' ' + vehicle?.model || ''}`,
      due_date: form.reminder_date,
    });
  };

  const mutation = useMutation({
    mutationFn: async (d) => isEdit ? await base44.entities.TireRecord.update(record.id, d) : await base44.entities.TireRecord.create(d),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] });
      await autoCreateExpense();
      await autoCreateReminder();
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      onClose();
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, mileage_at_installation: form.mileage_at_installation ? Number(form.mileage_at_installation) : undefined, cost: form.cost ? Number(form.cost) : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('tires')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('tire_brand')}</Label><Input value={form.brand} onChange={e => set('brand', e.target.value)} required /></div>
            <div><Label>{t('tire_model')}</Label><Input value={form.model} onChange={e => set('model', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('tire_size')}</Label><Input value={form.size} onChange={e => set('size', e.target.value)} placeholder="205/55R16" /></div>
            <div><Label>{t('seasonal_type')}</Label>
              <Select value={form.seasonal_type} onValueChange={v => set('seasonal_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{seasonTypes.map(st => <SelectItem key={st} value={st}>{t(st)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>{t('actions')}</Label>
            <Select value={form.action_type} onValueChange={v => set('action_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{actionTypes.map(at => <SelectItem key={at} value={at}>{t(at)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('installation_date')}</Label><Input type="date" value={form.installation_date} onChange={e => set('installation_date', e.target.value)} /></div>
            <div><Label>{t('mileage_at_installation')}</Label><Input type="number" value={form.mileage_at_installation} onChange={e => set('mileage_at_installation', e.target.value)} /></div>
          </div>
          <div><Label>{t('cost')} (€)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)} /></div>
          <AttachmentsUploader urls={form.photos} onChange={v => set('photos', v)} label={t('receipt_documents')} showCamera />
          {!isEdit && (
            <div>
              <Label>{t('reminder_date')}</Label>
              <Input type="date" value={form.reminder_date} onChange={e => set('reminder_date', e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">{t('auto_reminder_hint') || 'A reminder will be created for this date'}</p>
            </div>
          )}
          <div><Label>{t('notes_label')}</Label><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending}>{t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Tires() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: tires = [], isLoading } = useQuery({ queryKey: ['tires'], queryFn: () => base44.entities.TireRecord.list('-installation_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TireRecord.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tires'] }); setDeleteId(null); }
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });
  const filtered = vehicleFilter === 'all' ? tires : tires.filter(t => t.vehicle_id === vehicleFilter);

  const seasonBadgeColor = { summer: 'bg-amber-500/10 text-amber-600', winter: 'bg-blue-500/10 text-blue-600', all_season: 'bg-emerald-500/10 text-emerald-600' };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('tires')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('tires')}`} />
      <div className="mb-6"><VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} /></div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={CircleDot} title={t('no_data')} actionLabel={`${t('add')} ${t('tires')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {filtered.map(tire => {
            const vehicle = vehicleMap[tire.vehicle_id];
            return (
              <div key={tire.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center shrink-0">
                  <CircleDot className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{tire.brand} {tire.model}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{vehicle?.name || '—'} · {t(tire.action_type)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditItem(tire); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(tire.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tire.size && <Badge variant="secondary" className="text-xs">{tire.size}</Badge>}
                    <Badge variant="secondary" className={`text-xs ${seasonBadgeColor[tire.seasonal_type] || ''}`}>{t(tire.seasonal_type)}</Badge>
                    {tire.installation_date && <Badge variant="secondary" className="text-xs">{formatDate(tire.installation_date, locale)}</Badge>}
                    {tire.mileage_at_installation && <Badge variant="secondary" className="text-xs gap-1"><Gauge className="w-2.5 h-2.5" />{tire.mileage_at_installation.toLocaleString()} km</Badge>}
                  </div>
                  {tire.cost && <p className="text-sm font-bold mt-2">{formatCurrency(tire.cost, locale)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <TireForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
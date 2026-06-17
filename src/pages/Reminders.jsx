import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatDate, getDaysUntil, getUrgencyColor, getUrgencyBg } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleSelector from '@/components/shared/VehicleSelector';
import { Bell, Pencil, Trash2, MoreVertical, Check, Shield, ClipboardCheck, Wrench, CircleDot, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const reminderTypes = ['service', 'insurance', 'kteo', 'tire', 'custom'];
const typeIcons = { service: Wrench, insurance: Shield, kteo: ClipboardCheck, tire: CircleDot, custom: Star };

function ReminderForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    type: record?.type || 'custom',
    title: record?.title || '',
    due_date: record?.due_date || '',
    notes: record?.notes || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const mutation = useMutation({
    mutationFn: (d) => isEdit ? base44.entities.Reminder.update(record.id, d) : base44.entities.Reminder.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reminders'] }); onClose(); }
  });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(form); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('reminders')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div><Label>{t('title')}</Label><Input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{reminderTypes.map(rt => <SelectItem key={rt} value={rt}>{t(rt === 'tire' ? 'tires' : rt)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('date')}</Label><Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} required /></div>
          </div>
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

export default function Reminders() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: reminders = [], isLoading } = useQuery({ queryKey: ['reminders'], queryFn: () => base44.entities.Reminder.list('due_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reminders'] }); setDeleteId(null); }
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.update(id, { dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] })
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const filtered = (vehicleFilter === 'all' ? reminders : reminders.filter(r => r.vehicle_id === vehicleFilter))
    .filter(r => !r.dismissed);

  const overdue = filtered.filter(r => getDaysUntil(r.due_date) < 0);
  const upcoming = filtered.filter(r => getDaysUntil(r.due_date) >= 0);

  const renderReminder = (rem) => {
    const days = getDaysUntil(rem.due_date);
    const vehicle = vehicleMap[rem.vehicle_id];
    const TypeIcon = typeIcons[rem.type] || Bell;
    return (
      <div key={rem.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getUrgencyBg(days))}>
          <TypeIcon className={cn("w-5 h-5", getUrgencyColor(days))} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm">{rem.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{vehicle?.name || '—'} · {formatDate(rem.due_date, locale)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dismissMutation.mutate(rem.id)} title={t('dismiss')}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditItem(rem); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteId(rem.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Badge variant="secondary" className={cn("text-xs mt-2", getUrgencyColor(days))}>
            {days < 0 ? t('overdue') : days === 0 ? t('due_today') : `${days} ${t('days_remaining')}`}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('reminders')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('reminders')}`} />
      <div className="mb-6"><VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} /></div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={Bell} title={t('no_data')} actionLabel={`${t('add')} ${t('reminders')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-sm text-destructive mb-3">{t('overdue')} ({overdue.length})</h2>
              <div className="space-y-3">{overdue.map(renderReminder)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-sm text-muted-foreground mb-3">{t('upcoming')} ({upcoming.length})</h2>
              <div className="space-y-3">{upcoming.map(renderReminder)}</div>
            </div>
          )}
        </div>
      )}

      {showForm && <ReminderForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
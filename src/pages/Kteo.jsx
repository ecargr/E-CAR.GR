import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getUrgencyBg } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';
import VehicleSelector from '@/components/shared/VehicleSelector';
import AttachmentsUploader from '@/components/shared/AttachmentsUploader';
import { ClipboardCheck, Pencil, Trash2, MoreVertical, Calendar, CheckCircle, XCircle, AlertTriangle, Search, X, Car } from 'lucide-react';
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

const results = ['pass', 'minor_defects', 'major_defects', 'fail'];

function KteoForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    inspection_date: record?.inspection_date || '',
    expiration_date: record?.expiration_date || '',
    result: record?.result || 'pass',
    cost: record?.cost || '',
    notes: record?.notes || '',
    photos: record?.photos || [],
    reminder_date: record?.expiration_date || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const autoCreateExpense = async () => {
    if (!form.cost || isEdit) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    await base44.entities.Expense.create({
      vehicle_id: form.vehicle_id,
      date: form.inspection_date || new Date().toISOString().split('T')[0],
      amount: Number(form.cost),
      category: 'kteo',
      notes: `${t('kteo')} — ${t(form.result)}${vehicle ? ' — ' + (vehicle.name || vehicle.make + ' ' + vehicle.model) : ''}`,
    });
  };

  const autoCreateReminder = async () => {
    if (isEdit || !form.expiration_date) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    const title = `${t('kteo')} — ${vehicle?.name || vehicle?.make + ' ' + vehicle?.model || ''}`;
    // Create multiple reminders before expiry
    const offsets = [
      { label: '6 months', months: 6 },
      { label: '3 months', months: 3 },
      { label: '1 month', months: 1 },
      { label: '10 days', days: 10 },
      { label: '1 day', days: 1 },
    ];
    for (const offset of offsets) {
      const expiry = new Date(form.expiration_date);
      const reminderDate = new Date(expiry);
      if (offset.months) {
        reminderDate.setMonth(reminderDate.getMonth() - offset.months);
      } else {
        reminderDate.setDate(reminderDate.getDate() - offset.days);
      }
      const reminderStr = reminderDate.toISOString().split('T')[0];
      if (reminderStr > new Date().toISOString().split('T')[0]) {
        await base44.entities.Reminder.create({
          vehicle_id: form.vehicle_id,
          type: 'kteo',
          title: `${title} — ${offset.label} before expiry`,
          due_date: reminderStr,
        });
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (d) => isEdit ? await base44.entities.KteoRecord.update(record.id, d) : await base44.entities.KteoRecord.create(d),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['kteos'] });
      await autoCreateExpense();
      await autoCreateReminder();
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      onClose();
    }
  });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate({ ...form, cost: form.cost ? Number(form.cost) : undefined }); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('kteo')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('inspection_date')}</Label><Input type="date" value={form.inspection_date} onChange={e => set('inspection_date', e.target.value)} required /></div>
            <div><Label>{t('expiration_date')}</Label><Input type="date" value={form.expiration_date} onChange={e => set('expiration_date', e.target.value)} required /></div>
          </div>
          <div><Label>{t('result')}</Label>
            <Select value={form.result} onValueChange={v => set('result', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{results.map(r => <SelectItem key={r} value={r}>{t(r)}</SelectItem>)}</SelectContent>
            </Select>
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

const resultIcons = { pass: CheckCircle, minor_defects: AlertTriangle, major_defects: AlertTriangle, fail: XCircle };
const resultColors = { pass: 'text-success', minor_defects: 'text-warning', major_defects: 'text-destructive', fail: 'text-destructive' };

export default function Kteo() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: kteos = [], isLoading } = useQuery({ queryKey: ['kteos'], queryFn: () => base44.entities.KteoRecord.list('-inspection_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.KteoRecord.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['kteos'] }); setDeleteId(null); }
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const activeKteos = kteos.filter(k => getDaysUntil(k.expiration_date) >= 0);

  const filtered = (() => {
    let result = vehicleFilter === 'all' ? kteos : kteos.filter(k => k.vehicle_id === vehicleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(k => {
        const v = vehicleMap[k.vehicle_id];
        if (!v) return false;
        const plate = (v.registration_number || '').toLowerCase();
        const name = `${v.make || ''} ${v.model || ''}`.toLowerCase();
        return plate.includes(q) || name.includes(q);
      });
    }
    return result;
  })();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('kteo')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('kteo')}`} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Car} label={t('total_vehicles')} value={vehicles.length} color="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={ClipboardCheck} label={t('active_kteo')} value={activeKteos.length} color="text-blue-600" bgColor="bg-blue-500/10" />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search_vehicles')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-8" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search"><X className="w-4 h-4" /></button>}
        </div>
        <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
      </div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={ClipboardCheck} title={t('no_data')} actionLabel={`${t('add')} ${t('kteo')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {filtered.map(kteo => {
            const vehicle = vehicleMap[kteo.vehicle_id];
            const days = getDaysUntil(kteo.expiration_date);
            const ResultIcon = resultIcons[kteo.result] || CheckCircle;
            return (
              <div key={kteo.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getUrgencyBg(days))}>
                  <ClipboardCheck className={cn("w-5 h-5", getUrgencyColor(days))} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {vehicle && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-semibold text-base">{vehicle.make} {vehicle.model}</h3>
                          {vehicle.registration_number && (
                            <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2.5 py-1 rounded tracking-wide">{vehicle.registration_number}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">{t('kteo')}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(kteo.inspection_date, locale)} → {formatDate(kteo.expiration_date, locale)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditItem(kteo); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(kteo.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className={cn("text-xs gap-1", resultColors[kteo.result])}>
                      <ResultIcon className="w-3 h-3" />{t(kteo.result)}
                    </Badge>
                    <span className="font-bold text-sm">{t('expiration_date')}:</span>
                    <span className="text-sm font-medium">{formatDate(kteo.expiration_date, locale)}</span>
                    <Badge className={cn("font-bold text-xs px-2 py-0.5 ml-auto", days < 0 ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary")}>
                      {days < 0 ? t('expired') : days === 0 ? t('due_today') : `${days}d`}
                    </Badge>
                  </div>
                  {kteo.cost && <p className="text-sm font-bold mt-2">{formatCurrency(kteo.cost, locale)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <KteoForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
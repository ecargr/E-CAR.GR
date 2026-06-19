import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getUrgencyBg } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleSelector from '@/components/shared/VehicleSelector';
import AttachmentsUploader from '@/components/shared/AttachmentsUploader';
import AutocompleteInput from '@/components/shared/AutocompleteInput';
import { Shield, Pencil, Trash2, MoreVertical, Calendar, Building2 } from 'lucide-react';
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

const coverageTypes = ['basic', 'third_party', 'comprehensive', 'full'];

function InsuranceForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const { data: allInsurances = [] } = useQuery({ queryKey: ['insurances'], queryFn: () => base44.entities.InsurancePolicy.list(), enabled: open });
  const insuranceCompanies = [...new Set(allInsurances.map(i => i.company).filter(Boolean))].sort();
  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    company: record?.company || '',
    policy_number: record?.policy_number || '',
    coverage_type: record?.coverage_type || 'third_party',
    start_date: record?.start_date || '',
    expiration_date: record?.expiration_date || '',
    cost: record?.cost || '',
    notes: record?.notes || '',
    document_url: record?.document_url || '',
    photos: record?.photos || [],
    reminder_date: record?.expiration_date || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const autoCreateExpense = async () => {
    if (!form.cost || isEdit) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    await base44.entities.Expense.create({
      vehicle_id: form.vehicle_id,
      date: form.start_date || new Date().toISOString().split('T')[0],
      amount: Number(form.cost),
      category: 'insurance',
      supplier: form.company || undefined,
      notes: `${t('insurance')}: ${form.company} — ${t(form.coverage_type)}${vehicle ? ' — ' + (vehicle.name || vehicle.make + ' ' + vehicle.model) : ''}`,
    });
  };

  const autoCreateReminder = async () => {
    if (isEdit || !form.expiration_date) return;
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    const title = `${t('insurance')}: ${form.company} — ${vehicle?.name || vehicle?.make + ' ' + vehicle?.model || ''}`;
    // Create multiple reminders before expiry
    const offsets = [
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
          type: 'insurance',
          title: `${title} — ${offset.label} before expiry`,
          due_date: reminderStr,
        });
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (d) => isEdit ? await base44.entities.InsurancePolicy.update(record.id, d) : await base44.entities.InsurancePolicy.create(d),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
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
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('insurance')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div><Label>{t('insurance_company')}</Label><AutocompleteInput value={form.company} onChange={v => set('company', v)} options={insuranceCompanies} placeholder={t('supplier_placeholder')} required /></div>
          <div><Label>{t('policy_number')}</Label><Input value={form.policy_number} onChange={e => set('policy_number', e.target.value)} /></div>
          <div><Label>{t('coverage_type')}</Label>
            <Select value={form.coverage_type} onValueChange={v => set('coverage_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{coverageTypes.map(ct => <SelectItem key={ct} value={ct}>{t(ct)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('start_date')}</Label><Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required /></div>
            <div><Label>{t('expiration_date')}</Label><Input type="date" value={form.expiration_date} onChange={e => set('expiration_date', e.target.value)} required /></div>
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

export default function Insurance() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: insurances = [], isLoading } = useQuery({ queryKey: ['insurances'], queryFn: () => base44.entities.InsurancePolicy.list('-expiration_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InsurancePolicy.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurances'] }); setDeleteId(null); }
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });
  const filtered = vehicleFilter === 'all' ? insurances : insurances.filter(i => i.vehicle_id === vehicleFilter);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('insurance')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('insurance')}`} />
      <div className="mb-6"><VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} /></div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={Shield} title={t('no_data')} actionLabel={`${t('add')} ${t('insurance')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ins => {
            const vehicle = vehicleMap[ins.vehicle_id];
            const days = getDaysUntil(ins.expiration_date);
            const isExpired = days != null && days < 0;
            return (
              <div key={ins.id} className={cn("bg-card rounded-xl border p-5 hover:shadow-md transition-shadow", isExpired ? "border-destructive/30" : "border-border")}>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getUrgencyBg(days))}>
                    <Shield className={cn("w-5 h-5", getUrgencyColor(days))} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditItem(ins); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(ins.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold">{ins.company}</h3>
                {vehicle && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm font-medium">{vehicle.make} {vehicle.model}</span>
                    {vehicle.registration_number && (
                      <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded tracking-wide">{vehicle.registration_number}</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{t(ins.coverage_type)}</p>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>{formatDate(ins.start_date, locale)} → {formatDate(ins.expiration_date, locale)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {ins.cost && <span className="text-sm font-bold">{formatCurrency(ins.cost, locale)}</span>}
                  <Badge variant="secondary" className={cn("text-xs", getUrgencyColor(days))}>
                    {isExpired ? t('expired') : `${days} ${t('days_remaining')}`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <InsuranceForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleSelector from '@/components/shared/VehicleSelector';
import { StickyNote, Pencil, Trash2, MoreVertical, CheckCircle, Circle, Calendar } from 'lucide-react';
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

const priorities = ['low', 'medium', 'high'];
const priorityColors = { low: 'bg-emerald-500/10 text-emerald-600', medium: 'bg-amber-500/10 text-amber-600', high: 'bg-destructive/10 text-destructive' };

function NoteForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    title: record?.title || '',
    description: record?.description || '',
    priority: record?.priority || 'medium',
    reminder_date: record?.reminder_date || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const mutation = useMutation({
    mutationFn: (d) => isEdit ? base44.entities.VehicleNote.update(record.id, d) : base44.entities.VehicleNote.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notes'] }); onClose(); }
  });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(form); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('notes')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div><Label>{t('title')}</Label><Input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div><Label>{t('description')}</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('priority')}</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{t(p)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('reminder_date')}</Label><Input type="date" value={form.reminder_date} onChange={e => set('reminder_date', e.target.value)} /></div>
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

export default function Notes() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: notes = [], isLoading } = useQuery({ queryKey: ['notes'], queryFn: () => base44.entities.VehicleNote.list('-created_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VehicleNote.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notes'] }); setDeleteId(null); }
  });

  const toggleComplete = useMutation({
    mutationFn: (note) => base44.entities.VehicleNote.update(note.id, { completed: !note.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });
  const filtered = vehicleFilter === 'all' ? notes : notes.filter(n => n.vehicle_id === vehicleFilter);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('notes')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('notes')}`} />
      <div className="mb-6"><VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} /></div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={StickyNote} title={t('no_data')} actionLabel={`${t('add')} ${t('notes')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => {
            const vehicle = vehicleMap[note.vehicle_id];
            return (
              <div key={note.id} className={cn("bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow", note.completed && "opacity-60")}>
                <div className="flex items-start justify-between mb-2">
                  <button onClick={() => toggleComplete.mutate(note)} className="mt-0.5">
                    {note.completed ? <CheckCircle className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditItem(note); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(note.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className={cn("font-semibold text-sm", note.completed && "line-through")}>{note.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{vehicle?.name || '—'}</p>
                {note.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{note.description}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className={cn("text-xs", priorityColors[note.priority])}>{t(note.priority)}</Badge>
                  {note.reminder_date && (
                    <Badge variant="secondary" className="text-xs gap-1"><Calendar className="w-2.5 h-2.5" />{formatDate(note.reminder_date, locale)}</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <NoteForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
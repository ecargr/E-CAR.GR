import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleSelector from '@/components/shared/VehicleSelector';
import { FileText, Pencil, Trash2, MoreVertical, Upload, ExternalLink, File, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const docCategories = ['registration', 'insurance', 'kteo', 'service_invoice', 'purchase', 'warranty', 'custom'];

function DocumentForm({ open, onClose, record, vehicles }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEdit = !!record;
  const [form, setForm] = useState({
    vehicle_id: record?.vehicle_id || '',
    title: record?.title || '',
    category: record?.category || 'custom',
    notes: record?.notes || '',
    expiry_date: record?.expiry_date || '',
    file_url: record?.file_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: (d) => isEdit ? base44.entities.VehicleDocument.update(record.id, d) : base44.entities.VehicleDocument.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); onClose(); }
  });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('file_url', file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(form); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? t('edit') : t('add')} {t('documents')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t('vehicles')}</Label><VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={v => set('vehicle_id', v)} showAll={false} /></div>
          <div><Label>{t('document_title')}</Label><Input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div><Label>{t('document_category')}</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{docCategories.map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('upload_file')}</Label>
            <div className="mt-1">
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploading ? t('loading') : form.file_url ? 'File uploaded' : 'Choose file'}</span>
                <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.webp" />
              </label>
            </div>
          </div>
          <div><Label>{t('expiration_date')}</Label><Input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></div>
          <div><Label>{t('notes_label')}</Label><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending || uploading}>{t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Documents() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: docs = [], isLoading } = useQuery({ queryKey: ['documents'], queryFn: () => base44.entities.VehicleDocument.list('-created_date') });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VehicleDocument.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); setDeleteId(null); }
  });

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });
  const filtered = (() => {
    let result = vehicleFilter === 'all' ? docs : docs.filter(d => d.vehicle_id === vehicleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => {
        const v = vehicleMap[d.vehicle_id];
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
      <PageHeader title={t('documents')} action={() => setShowForm(true)} actionLabel={`${t('add')} ${t('documents')}`} />
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search_vehicles')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-8" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search"><X className="w-4 h-4" /></button>}
        </div>
        <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
      </div>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title={t('no_data')} actionLabel={`${t('add')} ${t('documents')}`} action={() => setShowForm(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const vehicle = vehicleMap[doc.vehicle_id];
            return (
              <div key={doc.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <File className="w-5 h-5 text-violet-600" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditItem(doc); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(doc.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold text-sm">{doc.title}</h3>
                <p className="text-xs text-muted-foreground">{vehicle?.name || '—'} · {t(doc.category)}</p>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View file
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && <DocumentForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />}
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
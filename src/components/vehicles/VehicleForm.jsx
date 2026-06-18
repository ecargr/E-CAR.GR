import React, { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Bike, Upload, FileText, X, Image, Camera } from 'lucide-react';

const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'];
const purchaseMethods = ['dealer', 'private_seller', 'company'];
const paymentMethods = ['cash', 'bank_transfer', 'financing', 'lease'];

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
    seller_name: vehicle?.seller_name || '',
    seller_contact: vehicle?.seller_contact || '',
    purchase_method: vehicle?.purchase_method || '',
    payment_method: vehicle?.payment_method || '',
    purchase_notes: vehicle?.purchase_notes || '',
    purchase_documents: vehicle?.purchase_documents || [],
    current_mileage: vehicle?.current_mileage || '',
    photos: vehicle?.photos || [],
  });

  const [uploading, setUploading] = useState(false);
  const photoFileRef = useRef(null);
  const photoCameraRef = useRef(null);
  const docFileRef = useRef(null);

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

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [...form.purchase_documents];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    set('purchase_documents', urls);
    setUploading(false);
    e.target.value = '';
  };

  const removeDoc = (idx) => {
    set('purchase_documents', form.purchase_documents.filter((_, i) => i !== idx));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [...form.photos];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    set('photos', urls);
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    set('photos', form.photos.filter((_, i) => i !== idx));
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
            <div><Label>{t('make')}</Label><Input value={form.make} onChange={e => set('make', e.target.value)} required /></div>
            <div><Label>{t('model')}</Label><Input value={form.model} onChange={e => set('model', e.target.value)} required /></div>
            <div><Label>{t('year')}</Label><Input type="number" value={form.year} onChange={e => set('year', e.target.value)} /></div>
            <div><Label>{t('registration_number')}</Label><Input value={form.registration_number} onChange={e => set('registration_number', e.target.value)} /></div>
            <div className="col-span-2"><Label>{t('vin_number')}</Label><Input value={form.vin} onChange={e => set('vin', e.target.value)} /></div>
            <div>
              <Label>{t('fuel_type')}</Label>
              <Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{fuelTypes.map(ft => <SelectItem key={ft} value={ft}>{t(ft)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t('engine_capacity')} (cc)</Label><Input type="number" value={form.engine_capacity} onChange={e => set('engine_capacity', e.target.value)} /></div>
            <div><Label>{t('horsepower')}</Label><Input type="number" value={form.horsepower} onChange={e => set('horsepower', e.target.value)} /></div>
            <div><Label>{t('color')}</Label><Input value={form.color} onChange={e => set('color', e.target.value)} /></div>
            <div className="col-span-2"><Label>{t('current_mileage')} (km)</Label><Input type="number" value={form.current_mileage} onChange={e => set('current_mileage', e.target.value)} /></div>
          </div>

          {/* Photos */}
          <div>
            <Label>{t('vehicle_photo')}</Label>
            <div className="flex gap-2 mt-1">
              <input ref={photoFileRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => photoFileRef.current?.click()}>
                {uploading ? <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" /> : <Image className="w-4 h-4" />}
                {t('upload_file')}
              </Button>
              <input ref={photoCameraRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => photoCameraRef.current?.click()}>
                <Camera className="w-4 h-4" />
                {t('take_photo') || 'Take Photo'}
              </Button>
            </div>
            {form.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.photos.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Section */}
          <div className="border-t border-border pt-4">
            <h4 className="font-heading font-semibold text-sm mb-3">{t('purchase_information')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('purchase_date')}</Label><Input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} /></div>
              <div><Label>{t('purchase_price')} (€)</Label><Input type="number" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} /></div>
              <div><Label>{t('seller_name')}</Label><Input value={form.seller_name} onChange={e => set('seller_name', e.target.value)} /></div>
              <div><Label>{t('seller_contact')}</Label><Input value={form.seller_contact} onChange={e => set('seller_contact', e.target.value)} /></div>
              <div>
                <Label>{t('purchase_method')}</Label>
                <Select value={form.purchase_method} onValueChange={v => set('purchase_method', v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{purchaseMethods.map(m => <SelectItem key={m} value={m}>{t(m)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('payment_method')}</Label>
                <Select value={form.payment_method} onValueChange={v => set('payment_method', v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{t(m)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>{t('notes_label')}</Label><Textarea value={form.purchase_notes} onChange={e => set('purchase_notes', e.target.value)} rows={2} /></div>
            </div>
          </div>

          {/* Purchase Documents */}
          <div>
            <Label>{t('purchase_documents')}</Label>
            <div className="flex gap-2 mt-1">
              <input ref={docFileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleDocUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => docFileRef.current?.click()}>
                {uploading ? <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                {t('upload_file')}
              </Button>
            </div>
            {form.purchase_documents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.purchase_documents.map((url, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                    <button type="button" onClick={() => removeDoc(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
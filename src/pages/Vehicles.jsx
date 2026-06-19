import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleForm from '@/components/vehicles/VehicleForm';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { Car, Bike, MoreVertical, Pencil, Trash2, Gauge, User, Building, Banknote, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Vehicles() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('none');

  const { data: vehicles = [], isLoading, refetch } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });

  const makes = useMemo(() => {
    const unique = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
    return unique.sort();
  }, [vehicles]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] });
      const previous = queryClient.getQueryData(['vehicles']);
      queryClient.setQueryData(['vehicles'], old => (old || []).filter(v => v.id !== id));
      setDeleteId(null);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['vehicles'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const handleRefresh = async () => { await refetch(); };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title={t('vehicles')} action={() => setShowForm(true)} actionLabel={t('add_vehicle')} />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('make')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')} {t('makes')}</SelectItem>
              {makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('transmission')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="manual">{t('manual')}</SelectItem>
              <SelectItem value="automatic">{t('automatic')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('sort_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('none')}</SelectItem>
              <SelectItem value="mileage_asc">{t('mileage_low_high')}</SelectItem>
              <SelectItem value="mileage_desc">{t('mileage_high_low')}</SelectItem>
              <SelectItem value="reg_date_desc">{t('reg_date_newest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {vehicles.length === 0 && !isLoading ? (
          <EmptyState icon={Car} title={t('no_data')} actionLabel={t('add_vehicle')} action={() => setShowForm(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              let filtered = vehicles.filter(v => {
                if (transmissionFilter !== 'all' && v.transmission !== transmissionFilter) return false;
                if (makeFilter !== 'all' && v.make !== makeFilter) return false;
                return true;
              });

              if (sortBy === 'mileage_asc') {
                filtered = [...filtered].sort((a, b) => (a.current_mileage ?? Infinity) - (b.current_mileage ?? Infinity));
              } else if (sortBy === 'mileage_desc') {
                filtered = [...filtered].sort((a, b) => (b.current_mileage ?? 0) - (a.current_mileage ?? 0));
              } else if (sortBy === 'reg_date_desc') {
                filtered = [...filtered].sort((a, b) => {
                  const da = a.registration_date ? new Date(a.registration_date).getTime() : 0;
                  const db = b.registration_date ? new Date(b.registration_date).getTime() : 0;
                  return db - da;
                });
              }

              return filtered.map(v => {
              const hasPurchaseDocs = (v.purchase_documents || []).length > 0;
              const hasPurchaseInfo = v.seller_name || v.purchase_method;
              return (
                <div key={v.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative overflow-hidden">
                    {v.photos?.[0] ? (
                      <img src={v.photos[0]} alt={v.name} className="w-full h-full object-cover" />
                    ) : (
                      v.type === 'motorcycle' ? <Bike className="w-14 h-14 text-primary/30" /> : <Car className="w-14 h-14 text-primary/30" />
                    )}
                    <Badge className="absolute top-3 left-3 text-[10px]" variant="secondary">{t(v.type)}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Actions for ${v.name}`}>
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailVehicle(v)}>
                          <Car className="w-3.5 h-3.5 mr-2" />{t('vehicle_details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditVehicle(v); setShowForm(true); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(v.id)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-lg">{v.make} {v.model}</h3>
                    <p className="text-sm text-muted-foreground">{v.name || (v.registration_date ? formatDate(v.registration_date, locale) : '')}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {v.registration_number && (
                        <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-mono font-bold text-sm tracking-wider">
                          {v.registration_number}
                        </span>
                      )}
                      {v.current_mileage != null && (
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
                          {v.current_mileage.toLocaleString()} km
                        </span>
                      )}
                      {v.fuel_type && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{t(v.fuel_type)}</span>
                      )}
                      {v.transmission && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{t(v.transmission)}</span>
                      )}
                    </div>
                    {hasPurchaseInfo && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        {v.seller_name && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <User className="w-3 h-3" /> {v.seller_name}
                          </span>
                        )}
                        {v.purchase_price != null && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Banknote className="w-3 h-3" /> {formatCurrency(v.purchase_price, locale)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] ml-auto">
                          {hasPurchaseDocs ? (
                            <span className="text-emerald-600 flex items-center gap-0.5"><FileText className="w-3 h-3" /> {v.purchase_documents.length}</span>
                          ) : (
                            <span className="text-amber-500">—</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
              });
            })()}
          </div>
        )}

        {detailVehicle && (
          <Dialog open={!!detailVehicle} onOpenChange={() => setDetailVehicle(null)}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{detailVehicle.make} {detailVehicle.model} — {t('vehicle_details')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {(detailVehicle.photos || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {detailVehicle.photos.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                        <img src={url} alt={`${detailVehicle.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{t('make')}:</span> <span className="font-medium">{detailVehicle.make}</span></div>
                  <div><span className="text-muted-foreground">{t('model')}:</span> <span className="font-medium">{detailVehicle.model}</span></div>
                  {detailVehicle.registration_date && <div><span className="text-muted-foreground">{t('registration_date_label')}:</span> <span className="font-medium">{formatDate(detailVehicle.registration_date, locale)}</span></div>}
                  {detailVehicle.registration_number && <div><span className="text-muted-foreground">{t('registration_number')}:</span> <span className="font-medium">{detailVehicle.registration_number}</span></div>}
                  {detailVehicle.vin && <div><span className="text-muted-foreground">{t('vin_number')}:</span> <span className="font-medium text-xs">{detailVehicle.vin}</span></div>}
                  {detailVehicle.fuel_type && <div><span className="text-muted-foreground">{t('fuel_type')}:</span> <span className="font-medium">{t(detailVehicle.fuel_type)}</span></div>}
                  {detailVehicle.transmission && <div><span className="text-muted-foreground">{t('transmission')}:</span> <span className="font-medium">{t(detailVehicle.transmission)}</span></div>}
                  {detailVehicle.current_mileage != null && <div><span className="text-muted-foreground">{t('current_mileage')}:</span> <span className="font-medium">{detailVehicle.current_mileage.toLocaleString()} km</span></div>}
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    {t('purchase_information')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailVehicle.purchase_date && <div><span className="text-muted-foreground">{t('purchase_date')}:</span> <span className="font-medium">{formatDate(detailVehicle.purchase_date, locale)}</span></div>}
                    {detailVehicle.purchase_price != null && <div><span className="text-muted-foreground">{t('purchase_price')}:</span> <span className="font-medium">{formatCurrency(detailVehicle.purchase_price, locale)}</span></div>}
                    {detailVehicle.seller_name && <div><span className="text-muted-foreground">{t('seller_name')}:</span> <span className="font-medium">{detailVehicle.seller_name}</span></div>}
                    {detailVehicle.seller_contact && <div><span className="text-muted-foreground">{t('seller_contact')}:</span> <span className="font-medium">{detailVehicle.seller_contact}</span></div>}
                    {detailVehicle.purchase_method && <div><span className="text-muted-foreground">{t('purchase_method')}:</span> <span className="font-medium">{t(detailVehicle.purchase_method)}</span></div>}
                    {detailVehicle.payment_method && <div><span className="text-muted-foreground">{t('payment_method')}:</span> <span className="font-medium">{t(detailVehicle.payment_method)}</span></div>}
                  </div>
                  {detailVehicle.purchase_notes && (
                    <p className="text-sm text-muted-foreground mt-2">{detailVehicle.purchase_notes}</p>
                  )}
                </div>
                {(detailVehicle.purchase_documents || []).length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t('purchase_documents')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detailVehicle.purchase_documents.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                          {t('document')} {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showForm && (
          <VehicleForm
            open={showForm}
            onClose={() => { setShowForm(false); setEditVehicle(null); }}
            vehicle={editVehicle}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>{t('confirm_delete')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}
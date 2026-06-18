import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ServiceForm from '@/components/services/ServiceForm';
import VehicleSelector from '@/components/shared/VehicleSelector';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { Wrench, Pencil, Trash2, MoreVertical, MapPin, Gauge, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';

export default function Services() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: services = [], isLoading, refetch } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.ServiceRecord.list('-date', 200) });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceRecord.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['services'] });
      const previous = queryClient.getQueryData(['services']);
      queryClient.setQueryData(['services'], old => (old || []).filter(s => s.id !== id));
      setDeleteId(null);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['services'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const handleRefresh = async () => { await refetch(); };

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const filtered = (() => {
    let result = vehicleFilter === 'all' ? services : services.filter(s => s.vehicle_id === vehicleFilter);
    if (dateFrom) result = result.filter(s => s.date >= dateFrom);
    if (dateTo) result = result.filter(s => s.date <= dateTo);
    return result;
  })();

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title={t('service_history')} action={() => setShowForm(true)} actionLabel={t('add_service')} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
          <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 text-xs" placeholder={t('date_from')} />
            <span className="text-xs text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 text-xs" placeholder={t('date_to')} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-muted-foreground hover:text-foreground" aria-label="Clear date range">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={Wrench} title={t('no_data')} actionLabel={t('add_service')} action={() => setShowForm(true)} />
        ) : (
          <div className="space-y-3">
            {filtered.map(svc => {
              const vehicle = vehicleMap[svc.vehicle_id];
              return (
                <div key={svc.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Wrench className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{t(svc.service_type)}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}${vehicle.registration_number ? ` · ${vehicle.registration_number}` : ''}`.trim() || vehicle.name || '—' : '—'} · {formatDate(svc.date, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {svc.cost && <span className="text-sm font-bold">{formatCurrency(svc.cost, locale)}</span>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${t(svc.service_type)}`}><MoreVertical className="w-3.5 h-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditItem(svc); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(svc.id)} className="text-destructive">
                              <Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {svc.service_center && (
                        <Badge variant="secondary" className="text-xs gap-1"><MapPin className="w-2.5 h-2.5" />{svc.service_center}</Badge>
                      )}
                      {svc.mileage && (
                        <Badge variant="secondary" className="text-xs gap-1"><Gauge className="w-2.5 h-2.5" />{svc.mileage.toLocaleString()} km</Badge>
                      )}
                    </div>
                    {svc.notes && <p className="text-xs text-muted-foreground mt-2">{svc.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <ServiceForm open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} record={editItem} vehicles={vehicles} />
        )}

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
    </PullToRefresh>
  );
}
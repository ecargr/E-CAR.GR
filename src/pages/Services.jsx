import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';
import ServiceForm from '@/components/services/ServiceForm';
import VehicleSelector from '@/components/shared/VehicleSelector';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { Wrench, Pencil, Trash2, MoreVertical, MapPin, Gauge, X, Calendar, Clock, Search, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [serviceCenterFilter, setServiceCenterFilter] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const serviceCenters = [...new Set(services.map(s => s.service_center).filter(Boolean))].sort();

  const today = new Date().toISOString().split('T')[0];

  const filtered = (() => {
    let result = vehicleFilter === 'all' ? services : services.filter(s => s.vehicle_id === vehicleFilter);
    if (dateFrom) result = result.filter(s => s.date >= dateFrom);
    if (dateTo) result = result.filter(s => s.date <= dateTo);
    if (serviceCenterFilter !== 'all') {
      result = result.filter(s => s.service_center === serviceCenterFilter);
    }
    if (showUpcoming) {
      result = result.filter(s => s.next_service_date && s.next_service_date >= today);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => {
        const v = vehicleMap[s.vehicle_id];
        if (!v) return false;
        const plate = (v.registration_number || '').toLowerCase();
        const name = `${v.make || ''} ${v.model || ''}`.toLowerCase();
        return plate.includes(q) || name.includes(q);
      });
    }
    return result;
  })();

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title={t('service_history')} action={() => setShowForm(true)} actionLabel={t('add_service')} />

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={Car} label={t('total_vehicles')} value={vehicles.length} color="text-primary" bgColor="bg-primary/10" />
          <StatCard icon={Wrench} label={t('total_services')} value={services.length} color="text-emerald-600" bgColor="bg-emerald-500/10" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('search_vehicles')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-8" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search"><X className="w-4 h-4" /></button>}
          </div>
          <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
          <Select value={serviceCenterFilter} onValueChange={setServiceCenterFilter}>
            <SelectTrigger className="w-44 text-xs">
              <SelectValue placeholder={t('service_center_filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')} {t('service_center_filter')}</SelectItem>
              {serviceCenters.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
            </SelectContent>
          </Select>
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
          <Button
            variant={showUpcoming ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="gap-1.5 text-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            {t('upcoming_services')}
          </Button>
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
                   <div className="flex items-start justify-between gap-3">
                     <div className="flex-1 min-w-0">
                       {vehicle && (
                         <div className="flex items-center gap-2">
                           <h3 className="font-heading font-semibold text-base">{vehicle.make} {vehicle.model}</h3>
                           {vehicle.registration_number && (
                             <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded tracking-wide">{vehicle.registration_number}</span>
                           )}
                         </div>
                       )}
                       <div className="flex items-center gap-3 mt-1 flex-wrap">
                         <div className="flex items-center gap-2">
                           {svc.mileage && (
                             <span className="flex items-center gap-1 text-lg font-bold"><Gauge className="w-4 h-4 text-muted-foreground" />{svc.mileage.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">km</span></span>
                           )}
                         </div>
                         <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{formatDate(svc.date, locale)}</span>
                         <span className="text-sm font-medium">{t(svc.service_type)}</span>
                       </div>
                       {svc.service_center && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{svc.service_center}</p>}
                     </div>
                     <div className="flex flex-col items-end gap-2 shrink-0">
                       <div className="flex items-center gap-2">
                         {svc.cost && <span className="text-base font-bold">{formatCurrency(svc.cost, locale)}</span>}
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
                       <div className="flex flex-col items-end gap-1">
                         {svc.next_service_date && (
                           <span className="text-[10px] text-primary font-medium whitespace-nowrap"><Calendar className="w-2.5 h-2.5 inline mr-0.5" />{t('next_service_date')}: {formatDate(svc.next_service_date, locale)}</span>
                         )}
                         {svc.next_service_km && (
                           <span className="text-[10px] text-muted-foreground whitespace-nowrap"><Gauge className="w-2.5 h-2.5 inline mr-0.5" />{t('next_service_km')}: {svc.next_service_km.toLocaleString()} km</span>
                         )}
                       </div>
                     </div>
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
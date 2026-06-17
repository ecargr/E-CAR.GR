import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { Car, Bike, MoreVertical, Pencil, Trash2, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Vehicles() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vehicles'] }); setDeleteId(null); }
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader title={t('vehicles')} action={() => setShowForm(true)} actionLabel={t('add_vehicle')} />

      {vehicles.length === 0 && !isLoading ? (
        <EmptyState icon={Car} title={t('no_data')} actionLabel={t('add_vehicle')} action={() => setShowForm(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-36 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                {v.photos?.[0] ? (
                  <img src={v.photos[0]} alt={v.name} className="w-full h-full object-cover" />
                ) : (
                  v.type === 'motorcycle' ? <Bike className="w-14 h-14 text-primary/30" /> : <Car className="w-14 h-14 text-primary/30" />
                )}
                <Badge className="absolute top-3 left-3 text-[10px]" variant="secondary">{t(v.type)}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                <h3 className="font-heading font-semibold text-lg">{v.name}</h3>
                <p className="text-sm text-muted-foreground">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {v.registration_number && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md font-mono font-medium">
                      {v.registration_number}
                    </span>
                  )}
                  {v.fuel_type && (
                    <span className="flex items-center gap-1">{t(v.fuel_type)}</span>
                  )}
                  {v.current_mileage != null && (
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{v.current_mileage.toLocaleString()} km</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
  );
}
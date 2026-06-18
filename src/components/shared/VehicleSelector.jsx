import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { Car, Bike } from 'lucide-react';
import MobileSelectDrawer from './MobileSelectDrawer';
import { Button } from '@/components/ui/button';

export default function VehicleSelector({ vehicles, value, onChange, showAll = true }) {
  const { t } = useI18n();

  const selectedVehicle = vehicles?.find(v => v.id === value);

  return (
    <>
      {/* Desktop: standard Select */}
      <div className="hidden sm:block">
        <Select value={value || 'all'} onValueChange={onChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t('vehicles')} />
          </SelectTrigger>
          <SelectContent>
            {showAll && <SelectItem value="all">{t('all')} {t('vehicles')}</SelectItem>}
            {vehicles?.map(v => (
              <SelectItem key={v.id} value={v.id}>
                <span className="flex items-center gap-2">
                  {v.type === 'motorcycle' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                  {v.name || `${v.make} ${v.model}${v.registration_number ? ` · ${v.registration_number}` : ''}`}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: bottom sheet Drawer */}
      <div className="sm:hidden">
        <MobileSelectDrawer vehicles={vehicles} value={value || 'all'} onChange={onChange} showAll={showAll} />
      </div>
    </>
  );
}
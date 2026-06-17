import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { Car, Bike } from 'lucide-react';

export default function VehicleSelector({ vehicles, value, onChange, showAll = true }) {
  const { t } = useI18n();

  return (
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder={t('vehicles')} />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">{t('all')} {t('vehicles')}</SelectItem>}
        {vehicles?.map(v => (
          <SelectItem key={v.id} value={v.id}>
            <span className="flex items-center gap-2">
              {v.type === 'motorcycle' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
              {v.name || `${v.make} ${v.model}`}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
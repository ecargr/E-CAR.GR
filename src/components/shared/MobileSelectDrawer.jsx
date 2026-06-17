import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Car, Bike, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MobileSelectDrawer({ vehicles, value, onChange, showAll = true, trigger }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const options = [
    ...(showAll ? [{ id: 'all', name: `${t('all')} ${t('vehicles')}`, type: null }] : []),
    ...(vehicles || []).map(v => ({ id: v.id, name: v.name || `${v.make} ${v.model}`, type: v.type }))
  ];

  const selected = options.find(o => o.id === (value || 'all'));

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-between gap-2">
            <span className="flex items-center gap-2 truncate text-sm">
              {selected?.type === 'motorcycle' ? <Bike className="w-3.5 h-3.5 shrink-0" /> : selected?.type === 'car' ? <Car className="w-3.5 h-3.5 shrink-0" /> : null}
              <span className="truncate">{selected?.name || t('vehicles')}</span>
            </span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('vehicles')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-1 max-h-[50vh] overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.id === (value || 'all');
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                )}
              >
                {opt.type === 'motorcycle' ? <Bike className="w-4 h-4 shrink-0" /> : opt.type === 'car' ? <Car className="w-4 h-4 shrink-0" /> : null}
                <span className="flex-1 text-left">{opt.name}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
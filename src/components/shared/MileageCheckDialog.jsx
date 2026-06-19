import React from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function MileageCheckDialog({ open, onClose, vehicle, newMileage, onComplete }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const handleYes = async () => {
    if (vehicle) {
      await base44.entities.Vehicle.update(vehicle.id, { current_mileage: newMileage });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
    handleClose(true);
  };

  const handleNo = () => handleClose(false);

  const handleClose = (updated) => {
    onComplete?.(updated);
    onClose();
  };

  if (!vehicle || !newMileage) return null;

  const currentDisplay = vehicle.current_mileage?.toLocaleString();
  const newDisplay = newMileage.toLocaleString();

  return (
    <AlertDialog open={open} onOpenChange={() => handleClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('update_mileage_title') || 'Update Vehicle Mileage'}</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          {currentDisplay
            ? `${t('mileage_higher_than_current') || 'The mileage entered'} (${newDisplay} km ${t('is_higher_than') || 'is higher than'} ${t('current_mileage')} ${currentDisplay} km). ${t('update_vehicle_mileage_question') || 'Update vehicle mileage?'}`
            : `${t('update_vehicle_mileage_to') || 'Update vehicle mileage to'} ${newDisplay} km?`
          }
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleNo}>{t('no')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleYes}>{t('yes')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
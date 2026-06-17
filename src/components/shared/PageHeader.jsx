import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, action, actionLabel, actionIcon: ActionIcon = Plus }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && (
        <Button onClick={action} className="gap-2 shrink-0">
          <ActionIcon className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
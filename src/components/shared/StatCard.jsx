import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, subtitle, color = 'text-primary', bgColor = 'bg-primary/10' }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-heading font-bold mt-1.5 truncate">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
    </div>
  );
}
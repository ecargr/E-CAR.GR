import React from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ compact = false }) {
  const { locale, switchLocale } = useI18n();

  return (
    <div className={cn("flex items-center gap-1 bg-muted rounded-lg p-0.5", compact && "gap-0")}>
      <button
        onClick={() => switchLocale('en')}
        className={cn(
          "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
          locale === 'en'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {compact ? 'EN' : 'EN'}
      </button>
      <button
        onClick={() => switchLocale('el')}
        className={cn(
          "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
          locale === 'el'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {compact ? 'GR' : 'GR'}
      </button>
    </div>
  );
}
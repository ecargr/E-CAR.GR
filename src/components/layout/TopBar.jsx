import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function TopBar({ onMenuClick, title }) {
  const { locale, switchLocale } = useI18n();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0 lg:hidden sticky top-0 z-30">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-1">
        <Menu className="w-5 h-5" />
      </Button>
      <h1 className="font-heading font-semibold text-base truncate flex-1">{title}</h1>
      <button
        onClick={() => switchLocale(locale === 'en' ? 'el' : 'en')}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
      >
        {locale === 'en' ? 'EL' : 'EN'}
      </button>
    </header>
  );
}
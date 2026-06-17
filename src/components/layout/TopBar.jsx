import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuClick, title }) {
  const { locale, switchLocale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/';

  return (
    <header
      className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0 lg:hidden sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={isRoot ? onMenuClick : () => navigate(-1)}
        className="-ml-1 min-h-[44px] min-w-[44px]"
      >
        {isRoot ? <Menu className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
      </Button>
      <h1 className="font-heading font-semibold text-base truncate flex-1">{title}</h1>
      <button
        onClick={() => switchLocale(locale === 'en' ? 'el' : 'en')}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {locale === 'en' ? 'EL' : 'EN'}
      </button>
    </header>
  );
}
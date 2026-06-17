import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { LayoutDashboard, Car, Receipt, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'vehicles', path: '/vehicles', icon: Car },
  { key: 'expenses', path: '/expenses', icon: Receipt },
  { key: 'reminders', path: '/reminders', icon: Bell },
  { key: 'settings', path: '/settings', icon: Settings },
];

export default function MobileBottomNav() {
  const { t } = useI18n();
  const location = useLocation();

  const activeIndex = tabs.findIndex(tab => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ key, path, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={key}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]",
                "transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{t(key)}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
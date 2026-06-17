import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import {
  LayoutDashboard, Car, Receipt, Wrench, CircleDot, Shield,
  ClipboardCheck, FileText, StickyNote, Bell, BarChart3,
  Settings, Sun, Moon, X, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'vehicles', path: '/vehicles', icon: Car },
  { key: 'expenses', path: '/expenses', icon: Receipt },
  { key: 'services', path: '/services', icon: Wrench },
  { key: 'tires', path: '/tires', icon: CircleDot },
  { key: 'insurance', path: '/insurance', icon: Shield },
  { key: 'kteo', path: '/kteo', icon: ClipboardCheck },
  { key: 'documents', path: '/documents', icon: FileText },
  { key: 'notes', path: '/notes', icon: StickyNote },
  { key: 'reminders', path: '/reminders', icon: Bell },
  { key: 'reports', path: '/reports', icon: BarChart3 },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border flex flex-col transition-all duration-300",
        "lg:relative lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-[68px]" : "lg:w-64",
        "w-72"
      )}>
        <div className={cn("flex items-center h-16 px-4 border-b border-border shrink-0", collapsed && "lg:justify-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">VehicleHub</span>
            </div>
          )}
          {collapsed && (
            <div className="hidden lg:flex w-8 h-8 rounded-lg bg-primary items-center justify-center">
              <Car className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="hidden lg:flex ml-auto"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          <div className="space-y-0.5">
            {navItems.map(({ key, path, icon: Icon }) => {
              const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
              return (
                <Link
                  key={key}
                  to={path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "lg:justify-center lg:px-2"
                  )}
                  title={collapsed ? t(key) : undefined}
                >
                  <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span className="lg:block">{t(key)}</span>}
                  {collapsed && <span className="lg:hidden">{t(key)}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-2 border-t border-border space-y-0.5 shrink-0">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? t('light_mode') : t('dark_mode')}</span>}
          </button>
          <Link
            to="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              location.pathname === '/settings'
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{t('settings')}</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
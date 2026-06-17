import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const defaultNavItems = [
  { key: 'dashboard', path: '/' },
  { key: 'vehicles', path: '/vehicles' },
  { key: 'expenses', path: '/expenses' },
  { key: 'services', path: '/services' },
  { key: 'tires', path: '/tires' },
  { key: 'insurance', path: '/insurance' },
  { key: 'kteo', path: '/kteo' },
  { key: 'documents', path: '/documents' },
  { key: 'notes', path: '/notes' },
  { key: 'reminders', path: '/reminders' },
  { key: 'reports', path: '/reports' },
];

const STORAGE_KEY_ORDER = 'nav_custom_order';
const STORAGE_KEY_NAMES = 'nav_custom_names';
const STORAGE_KEY_HIDDEN = 'nav_custom_hidden';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function NavigationCustomizer({ locale }) {
  const [items, setItems] = useState(() => {
    const order = loadFromStorage(STORAGE_KEY_ORDER, defaultNavItems.map(i => i.key));
    const names = loadFromStorage(STORAGE_KEY_NAMES, {});
    const hidden = loadFromStorage(STORAGE_KEY_HIDDEN, []);
    
    const nameMap = names[locale] || {};
    return order.map(key => {
      const def = defaultNavItems.find(d => d.key === key);
      return {
        key,
        path: def?.path || `/${key}`,
        customName: nameMap[key] || '',
        hidden: hidden.includes(key),
      };
    });
  });

  const [dragIndex, setDragIndex] = useState(null);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    const order = items.map(i => i.key);
    saveToStorage(STORAGE_KEY_ORDER, order);
    
    const names = loadFromStorage(STORAGE_KEY_NAMES, {});
    const nameMap = {};
    items.forEach(i => { if (i.customName) nameMap[i.key] = i.customName; });
    names[locale] = nameMap;
    saveToStorage(STORAGE_KEY_NAMES, names);
    
    const hidden = items.filter(i => i.hidden).map(i => i.key);
    saveToStorage(STORAGE_KEY_HIDDEN, hidden);
  }, [items, locale]);

  const moveItem = (from, to) => {
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  };

  const toggleHidden = (key) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, hidden: !i.hidden } : i));
  };

  const updateName = (key, name) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, customName: name } : i));
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY_ORDER);
    localStorage.removeItem(STORAGE_KEY_NAMES);
    localStorage.removeItem(STORAGE_KEY_HIDDEN);
    setItems(defaultNavItems.map(d => ({ ...d, customName: '', hidden: false })));
  };

  const { t } = useI18n();

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const displayName = item.customName || t(item.key);
        return (
          <div
            key={item.key}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 group",
              item.hidden && "opacity-50"
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
            <span className="flex-1 text-sm font-medium min-w-0">
              {editingKey === item.key ? (
                <input
                  autoFocus
                  className="w-full bg-transparent border-b border-primary outline-none text-sm"
                  value={item.customName}
                  onChange={e => updateName(item.key, e.target.value)}
                  onBlur={() => setEditingKey(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingKey(null); }}
                  placeholder={t(item.key)}
                />
              ) : (
                <span
                  className={cn("cursor-pointer", item.customName && "text-primary")}
                  onClick={() => setEditingKey(item.key)}
                  title={item.customName ? `${t(item.key)} → ${item.customName}` : t(item.key)}
                >
                  {displayName}
                </span>
              )}
            </span>
            {item.customName && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">{t(item.key)}</span>
            )}
            <div className="flex gap-0.5">
              {idx > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, idx - 1)}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                </Button>
              )}
              {idx < items.length - 1 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, idx + 1)}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleHidden(item.key)}>
                {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={resetAll} className="gap-1.5 mt-3">
        <RotateCcw className="w-3.5 h-3.5" />
        {t('restore_defaults')}
      </Button>
    </div>
  );
}

export function getCustomNavItems() {
  const order = loadFromStorage('nav_custom_order', defaultNavItems.map(i => i.key));
  const hidden = loadFromStorage('nav_custom_hidden', []);
  const names = loadFromStorage('nav_custom_names', {});
  const currentLocale = localStorage.getItem('app_locale') || 'en';
  const nameMap = names[currentLocale] || {};

  return order
    .filter(key => !hidden.includes(key))
    .map(key => {
      const def = defaultNavItems.find(d => d.key === key);
      return {
        key,
        path: def?.path || `/${key}`,
        customName: nameMap[key] || '',
      };
    });
}
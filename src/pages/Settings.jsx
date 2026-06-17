import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import PageHeader from '@/components/shared/PageHeader';
import NavigationCustomizer from '@/components/settings/NavigationCustomizer';
import { Globe, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { t, locale, switchLocale } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <PageHeader title={t('settings')} />

      <div className="space-y-6">
        {/* Language */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">{t('language')}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchLocale('en')}
            >
              EN
            </Button>
            <Button
              variant={locale === 'el' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchLocale('el')}
            >
              GR
            </Button>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">{t('theme')}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="gap-1.5"
            >
              <Sun className="w-3.5 h-3.5" /> {t('light_mode')}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="gap-1.5"
            >
              <Moon className="w-3.5 h-3.5" /> {t('dark_mode')}
            </Button>
          </div>
        </div>

        {/* Navigation Customization */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Menu className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">{t('customize_navigation')}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t('customize_navigation_desc')}</p>
          <NavigationCustomizer locale={locale} />
        </div>

        {/* App Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-2">VehicleHub</h3>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Your complete vehicle management solution.</p>
        </div>
      </div>
    </div>
  );
}
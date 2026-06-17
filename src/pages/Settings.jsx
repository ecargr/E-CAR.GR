import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import PageHeader from '@/components/shared/PageHeader';
import NavigationCustomizer from '@/components/settings/NavigationCustomizer';
import { Globe, Sun, Moon, Menu, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Settings() {
  const { t, locale, switchLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.deleteAccount();
    window.location.href = '/';
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto animate-fade-in pb-safe">
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

        {/* Delete Account */}
        <div className="bg-card rounded-xl border border-destructive/30 p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-heading font-semibold text-destructive">{t('delete_account') || 'Delete Account'}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('delete_account_desc') || 'This action is permanent and cannot be undone. All your data will be permanently deleted.'}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1.5">
                <Trash2 className="w-4 h-4" />
                {t('delete_account_button') || 'Delete My Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('delete_account_confirm') || 'Are you absolutely sure?'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('delete_account_warning') || 'This will permanently delete your account and all associated data (vehicles, expenses, services, documents, and all records). This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? t('deleting') || 'Deleting...' : t('delete_account_final') || 'Delete My Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
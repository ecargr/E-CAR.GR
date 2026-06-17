import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';
import { useI18n } from '@/lib/i18n';

const pageTitles = {
  '/': 'VehicleHub',
  '/vehicles': 'vehicles',
  '/expenses': 'expenses',
  '/services': 'services',
  '/tires': 'tires',
  '/insurance': 'insurance',
  '/kteo': 'kteo',
  '/documents': 'documents',
  '/notes': 'notes',
  '/reminders': 'reminders',
  '/reports': 'reports',
  '/settings': 'settings',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname]
    ? t(pageTitles[location.pathname])
    : 'VehicleHub';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          title={currentTitle}
        />
        <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
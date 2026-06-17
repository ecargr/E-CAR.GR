import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
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
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full overflow-y-auto pb-[72px] lg:pb-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
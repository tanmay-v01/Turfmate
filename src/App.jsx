import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import DevHeader from './components/layout/DevHeader';
import Toast from './components/ui/Toast';
import UserWebLayout from './components/layout/UserWebLayout';
import CheckoutModal from './components/layout/CheckoutModal';
import AvatarPickerModal from './components/onboarding/AvatarPickerModal';
import JoinSplitReviewSheet from './components/split/JoinSplitReviewSheet';
import SplitSuccessModal from './components/split/SplitSuccessModal';
import BookingSuccessModal from './components/layout/BookingSuccessModal';

const OwnerDashboardPage = lazy(() => import('./pages/owner/OwnerDashboardPage'));
const SuperAdminDashboardPage = lazy(() => import('./pages/admin/SuperAdminDashboardPage'));

const PORTAL_VIEWS = new Set(['owner_dashboard', 'super_admin']);

function PortalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm font-bold text-brand-muted animate-pulse">loading dashboard…</p>
    </div>
  );
}

function AppShell() {
  const { view, userProfile } = useApp();
  const isPortal = PORTAL_VIEWS.has(view);
  const favSport = userProfile?.favoriteSports?.[0] || 'football';

  const sportTheme = favSport === 'basketball' ? {
    '--grass': '#f59e0b',
    '--grass-light': '#fbbf24',
    '--grass-fresh': '#d97706',
    '--grass-deep': '#b45309'
  } : favSport === 'tennis' ? {
    '--grass': '#0ea5e9',
    '--grass-light': '#38bdf8',
    '--grass-fresh': '#0284c7',
    '--grass-deep': '#0369a1'
  } : favSport === 'cricket' ? {
    '--grass': '#8b5cf6',
    '--grass-light': '#a78bfa',
    '--grass-fresh': '#7c3aed',
    '--grass-deep': '#6d28d9'
  } : {};

  return (
    <div className="min-h-screen w-full tm-mesh-bg text-slate-800 antialiased relative" style={sportTheme}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
      {!isPortal && import.meta.env.DEV && <DevHeader />}
      {!isPortal && <Toast />}

      {view === 'owner_dashboard' ? (
        <Suspense fallback={<PortalLoading />}>
          <OwnerDashboardPage />
        </Suspense>
      ) : view === 'super_admin' ? (
        <Suspense fallback={<PortalLoading />}>
          <SuperAdminDashboardPage />
        </Suspense>
      ) : (
        <UserWebLayout />
      )}

      <CheckoutModal />
      <BookingSuccessModal />
      <JoinSplitReviewSheet />
      <SplitSuccessModal />
      <AvatarPickerModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

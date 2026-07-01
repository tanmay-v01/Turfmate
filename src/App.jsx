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
  const { view } = useApp();
  const isPortal = PORTAL_VIEWS.has(view);

  return (
    <div className="min-h-screen w-full bg-[#090D19] text-slate-100 antialiased">
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

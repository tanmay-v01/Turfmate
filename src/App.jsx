import { AppProvider, useApp } from './context/AppContext';
import DevHeader from './components/layout/DevHeader';
import Toast from './components/ui/Toast';
import UserWebLayout from './components/layout/UserWebLayout';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import SuperAdminDashboardPage from './pages/admin/SuperAdminDashboardPage';
import CheckoutModal from './components/layout/CheckoutModal';
import AvatarPickerModal from './components/onboarding/AvatarPickerModal';
import JoinSplitReviewSheet from './components/split/JoinSplitReviewSheet';
import SplitSuccessModal from './components/split/SplitSuccessModal';

const PORTAL_VIEWS = new Set(['owner_dashboard', 'super_admin']);

function AppShell() {
  const { view } = useApp();
  const isPortal = PORTAL_VIEWS.has(view);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-brand-text antialiased">
      {!isPortal && import.meta.env.DEV && <DevHeader />}
      {!isPortal && <Toast />}

      {view === 'owner_dashboard' ? (
        <OwnerDashboardPage />
      ) : view === 'super_admin' ? (
        <SuperAdminDashboardPage />
      ) : (
        <UserWebLayout />
      )}

      <CheckoutModal />
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

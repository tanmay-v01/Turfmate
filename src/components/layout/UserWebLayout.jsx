import { useApp } from '../../context/AppContext';
import { ONBOARDING_VIEWS } from '../../constants/views';
import PageRouter from './PageRouter';
import AppNav from './AppNav';
import NotificationsDrawer from './NotificationsDrawer';
import ConfettiOverlay from './ConfettiOverlay';

export default function UserWebLayout() {
  const { view } = useApp();
  const isOnboarding = ONBOARDING_VIEWS.includes(view);
  const showNav = !isOnboarding;

  return (
    <div className="min-h-screen w-full app-mesh-bg">
      {showNav && <AppNav />}

      <div className={`relative min-h-screen flex flex-col ${showNav ? 'lg:pl-[248px] pb-[148px] lg:pb-0' : ''}`}>
        <NotificationsDrawer />
        <ConfettiOverlay />
        <main className="flex-1 w-full">
          <PageRouter />
        </main>
      </div>
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { useApp } from '../../context/AppContext';
import { ONBOARDING_VIEWS } from '../../constants/views';

import SplashPage from '../../pages/onboarding/SplashPage';
import WelcomeCarouselPage from '../../pages/onboarding/WelcomeCarouselPage';
import LoginPage from '../../pages/onboarding/LoginPage';
import OtpVerifyPage from '../../pages/onboarding/OtpVerifyPage';
import HomePage from '../../pages/user/HomePage';

const RoleSelectionPage = lazy(() => import('../../pages/onboarding/RoleSelectionPage'));
const ProfileSetupPage = lazy(() => import('../../pages/onboarding/ProfileSetupPage'));
const SportsDnaPage = lazy(() => import('../../pages/onboarding/SportsDnaPage'));
const LocationPermissionPage = lazy(() => import('../../pages/onboarding/LocationPermissionPage'));
const LocationManualPage = lazy(() => import('../../pages/onboarding/LocationManualPage'));
const OwnerBusinessPage = lazy(() => import('../../pages/onboarding/OwnerBusinessPage'));
const OwnerMapPage = lazy(() => import('../../pages/onboarding/OwnerMapPage'));
const OwnerKycPage = lazy(() => import('../../pages/onboarding/OwnerKycPage'));
const OwnerPayoutPage = lazy(() => import('../../pages/onboarding/OwnerPayoutPage'));
const OwnerPendingPage = lazy(() => import('../../pages/onboarding/OwnerPendingPage'));
const MyBookingsPage = lazy(() => import('../../pages/user/MyBookingsPage'));
const SearchEnginePage = lazy(() => import('../../pages/user/SearchEnginePage'));
const TurfDetailsPage = lazy(() => import('../../pages/user/TurfDetailsPage'));
const PlayRadiusPage = lazy(() => import('../../pages/user/PlayRadiusPage'));
const LockerRoomPage = lazy(() => import('../../pages/user/LockerRoomPage'));
const ChatPage = lazy(() => import('../../pages/user/ChatPage'));
const SplitHubPage = lazy(() => import('../../pages/user/SplitHubPage'));
const PlayerRadarPage = lazy(() => import('../../pages/user/PlayerRadarPage'));
const MySquadPage = lazy(() => import('../../pages/user/MySquadPage'));
const LeaderboardPage = lazy(() => import('../../pages/user/LeaderboardPage'));
const ScoreCalculatorPage = lazy(() => import('../../pages/user/ScoreCalculatorPage'));
const TournamentsPage = lazy(() => import('../../pages/user/TournamentsPage'));

const VIEW_MAP = {
  splash: SplashPage,
  welcome_carousel: WelcomeCarouselPage,
  login: LoginPage,
  otp_verify: OtpVerifyPage,
  home: HomePage,
  role_selection: RoleSelectionPage,
  profile_setup: ProfileSetupPage,
  sports_dna: SportsDnaPage,
  location_permission: LocationPermissionPage,
  location_manual: LocationManualPage,
  owner_business: OwnerBusinessPage,
  owner_map: OwnerMapPage,
  owner_kyc: OwnerKycPage,
  owner_payout: OwnerPayoutPage,
  owner_pending: OwnerPendingPage,
  my_bookings: MyBookingsPage,
  search_engine: SearchEnginePage,
  turf_details: TurfDetailsPage,
  play_radius: PlayRadiusPage,
  locker_room: LockerRoomPage,
  chat: ChatPage,
  split_hub: SplitHubPage,
  radar: PlayerRadarPage,
  squad: MySquadPage,
  leaderboard: LeaderboardPage,
  score_calculator: ScoreCalculatorPage,
  tournaments: TournamentsPage,
};

const FULL_WIDTH_VIEWS = new Set(['home', 'my_bookings', 'turf_details', 'search_engine', 'chat', 'owner_dashboard', 'super_admin', ...ONBOARDING_VIEWS]);

function PageLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-sm font-bold text-brand-muted animate-pulse">loading…</p>
    </div>
  );
}

export default function PageRouter() {
  const { view } = useApp();
  const Page = VIEW_MAP[view] || HomePage;
  const isEager = view === 'splash' || view === 'welcome_carousel' || view === 'login' || view === 'otp_verify' || view === 'home';

  const content = isEager ? (
    <Page />
  ) : (
    <Suspense fallback={<PageLoading />}>
      <Page />
    </Suspense>
  );

  if (FULL_WIDTH_VIEWS.has(view)) {
    return content;
  }

  return (
    <div className="tm-page animate-fade-up pb-24 lg:pb-10">
      {content}
    </div>
  );
}

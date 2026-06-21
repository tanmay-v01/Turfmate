import { useApp } from '../../context/AppContext';
import { ONBOARDING_VIEWS } from '../../constants/views';
import SplashPage from '../../pages/onboarding/SplashPage';
import WelcomeCarouselPage from '../../pages/onboarding/WelcomeCarouselPage';
import LoginPage from '../../pages/onboarding/LoginPage';
import OtpVerifyPage from '../../pages/onboarding/OtpVerifyPage';
import RoleSelectionPage from '../../pages/onboarding/RoleSelectionPage';
import ProfileSetupPage from '../../pages/onboarding/ProfileSetupPage';
import SportsDnaPage from '../../pages/onboarding/SportsDnaPage';
import LocationPermissionPage from '../../pages/onboarding/LocationPermissionPage';
import LocationManualPage from '../../pages/onboarding/LocationManualPage';
import OwnerBusinessPage from '../../pages/onboarding/OwnerBusinessPage';
import OwnerMapPage from '../../pages/onboarding/OwnerMapPage';
import OwnerKycPage from '../../pages/onboarding/OwnerKycPage';
import OwnerPayoutPage from '../../pages/onboarding/OwnerPayoutPage';
import OwnerPendingPage from '../../pages/onboarding/OwnerPendingPage';
import HomePage from '../../pages/user/HomePage';
import SearchEnginePage from '../../pages/user/SearchEnginePage';
import TurfDetailsPage from '../../pages/user/TurfDetailsPage';
import PlayRadiusPage from '../../pages/user/PlayRadiusPage';
import LockerRoomPage from '../../pages/user/LockerRoomPage';
import ChatPage from '../../pages/user/ChatPage';
import SplitHubPage from '../../pages/user/SplitHubPage';
import PlayerRadarPage from '../../pages/user/PlayerRadarPage';
import MySquadPage from '../../pages/user/MySquadPage';
import LeaderboardPage from '../../pages/user/LeaderboardPage';
import ScoreCalculatorPage from '../../pages/user/ScoreCalculatorPage';
import TournamentsPage from '../../pages/user/TournamentsPage';
import OwnerDashboardPage from '../../pages/owner/OwnerDashboardPage';
import SuperAdminDashboardPage from '../../pages/admin/SuperAdminDashboardPage';

const VIEW_MAP = {
  splash: SplashPage,
  welcome_carousel: WelcomeCarouselPage,
  login: LoginPage,
  otp_verify: OtpVerifyPage,
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
  home: HomePage,
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
  owner_dashboard: OwnerDashboardPage,
  super_admin: SuperAdminDashboardPage,
};

const FULL_WIDTH_VIEWS = new Set(['home', 'turf_details', 'search_engine', 'chat', 'owner_dashboard', 'super_admin', ...ONBOARDING_VIEWS]);

export default function PageRouter() {
  const { view } = useApp();
  const Page = VIEW_MAP[view] || HomePage;

  if (FULL_WIDTH_VIEWS.has(view)) {
    return <Page />;
  }

  return (
    <div className="tm-page animate-fade-up pb-24 lg:pb-10">
      <Page />
    </div>
  );
}

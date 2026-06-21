import fs from 'fs';
import path from 'path';

const root = path.resolve('src');
const content = fs.readFileSync(path.join(root, 'App.jsx'), 'utf8');
const lines = content.split('\n');

const views = [
  'splash', 'welcome_carousel', 'login', 'otp_verify', 'role_selection',
  'profile_setup', 'sports_dna', 'location_permission', 'location_manual',
  'owner_business', 'owner_map', 'owner_kyc', 'owner_payout', 'owner_pending',
  'home', 'search_engine', 'turf_details', 'play_radius', 'locker_room', 'chat'
];

const startRegex = (v) => new RegExp(`\\{view === '${v}' && \\(`);

const starts = [];
for (let i = 0; i < lines.length; i++) {
  for (const v of views) {
    if (startRegex(v).test(lines[i])) {
      starts.push({ view: v, line: i });
    }
  }
}

starts.sort((a, b) => a.line - b.line);

function extractBlock(startLine) {
  let depth = 0;
  let started = false;
  const blockLines = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    if (!started) {
      started = true;
      // skip opening line `{view === 'x' && (`
      const openParen = line.indexOf('(');
      const afterOpen = line.slice(openParen + 1);
      if (afterOpen.trim()) blockLines.push(afterOpen);
      depth = 1;
      continue;
    }
    // track parens naively (good enough for this file)
    for (const ch of line) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
    if (depth <= 0) {
      // remove trailing `)}` from last meaningful line
      const last = blockLines[blockLines.length - 1] || '';
      blockLines[blockLines.length - 1] = last.replace(/\)\s*\}\s*$/, '').replace(/\)\s*$/, '');
      break;
    }
    blockLines.push(line);
  }
  return blockLines.join('\n').trim();
}

const pagesDir = path.join(root, 'pages');
fs.mkdirSync(path.join(pagesDir, 'onboarding'), { recursive: true });
fs.mkdirSync(path.join(pagesDir, 'user'), { recursive: true });

const onboardingViews = new Set([
  'splash', 'welcome_carousel', 'login', 'otp_verify', 'role_selection',
  'profile_setup', 'sports_dna', 'location_permission', 'location_manual',
  'owner_business', 'owner_map', 'owner_kyc', 'owner_payout', 'owner_pending'
]);

const nameMap = {
  splash: 'SplashPage',
  welcome_carousel: 'WelcomeCarouselPage',
  login: 'LoginPage',
  otp_verify: 'OtpVerifyPage',
  role_selection: 'RoleSelectionPage',
  profile_setup: 'ProfileSetupPage',
  sports_dna: 'SportsDnaPage',
  location_permission: 'LocationPermissionPage',
  location_manual: 'LocationManualPage',
  owner_business: 'OwnerBusinessPage',
  owner_map: 'OwnerMapPage',
  owner_kyc: 'OwnerKycPage',
  owner_payout: 'OwnerPayoutPage',
  owner_pending: 'OwnerPendingPage',
  home: 'HomePage',
  search_engine: 'SearchEnginePage',
  turf_details: 'TurfDetailsPage',
  play_radius: 'PlayRadiusPage',
  locker_room: 'LockerRoomPage',
  chat: 'ChatPage',
};

for (let i = 0; i < starts.length; i++) {
  const { view, line } = starts[i];
  const jsx = extractBlock(line);
  const componentName = nameMap[view];
  const folder = onboardingViews.has(view) ? 'onboarding' : 'user';
  const filePath = path.join(pagesDir, folder, `${componentName}.jsx`);

  const fileContent = `import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ${componentName}() {
  const app = useApp();
  const {
    ${getDestructuredProps(view)}
  } = app;

  return (
${indent(jsx, 4)}
  );
}
`;

  fs.writeFileSync(filePath, fileContent);
  console.log('Wrote', filePath);
}

function indent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(l => pad + l).join('\n');
}

function getDestructuredProps(view) {
  // Will be replaced manually - placeholder returns common props
  return 'view, setView, navigateTo, onboardingData, updateOnboardingData, userProfile, setUserProfile, phoneNumber, setPhoneNumber, otpCode, setOtpCode, loginTimer, carouselIndex, setCarouselIndex, handleSendOTP, handleVerifyOTP, handleUsernameChange, selectSuggestion, handleProfileSubmit, usernameError, usernameSuggestions, grantLocation, selectManualLocation, kycErrors, setKycErrors, payoutErrors, setPayoutErrors, uploadingFile, uploadProgress, setUploadingFile, setUploadProgress, triggerConfetti, setIsAdminMode, bookings, announcements, chats, notifications, showNotifications, setShowNotifications, selectedSportFilter, setSelectedSportFilter, searchQuery, setSearchQuery, searchViewMode, setSearchViewMode, showFilterSheet, setShowFilterSheet, selectedTurfForPreview, setSelectedTurfForPreview, galleryImageIndex, setGalleryImageIndex, selectedPitchId, setSelectedPitchId, filterSport, setFilterSport, filterDate, setFilterDate, filterTimeRange, setFilterTimeRange, filterPitchSize, setFilterPitchSize, filterRadius, setFilterRadius, getDistance, activeTurfId, setActiveTurfId, activeTurf, bookingDate, setBookingDate, selectedSlotId, setSelectedSlotId, checkoutOption, setCheckoutOption, splitPlayersCount, setSplitPlayersCount, setShowCheckoutModal, adminBlockedSlots, adminSlotPrices, joinSplitGame, hoveredMapPin, setHoveredMapPin, activeChatId, setActiveChatId, chatInput, setChatInput, sendChatMessage, MOCK_TURFS, MOCK_PLAYERS, SPORTS';
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const appPath = path.join(src, 'App.jsx');
const lines = fs.readFileSync(appPath, 'utf8').split('\n');

const APP_IDENTIFIERS = [
  'isAdminMode', 'setIsAdminMode', 'view', 'setView',
  'onboardingData', 'setOnboardingData', 'userProfile', 'setUserProfile',
  'bookings', 'setBookings', 'announcements', 'setAnnouncements',
  'chats', 'setChats', 'notifications', 'setNotifications',
  'phoneNumber', 'setPhoneNumber', 'otpSent', 'setOtpSent',
  'otpCode', 'setOtpCode', 'loginTimer', 'setLoginTimer',
  'carouselIndex', 'setCarouselIndex', 'showConfetti', 'setShowConfetti',
  'confettiParticles', 'setConfettiParticles', 'usernameError', 'setUsernameError',
  'usernameSuggestions', 'setUsernameSuggestions', 'whatsappNotification', 'setWhatsappNotification',
  'uploadingFile', 'setUploadingFile', 'uploadProgress', 'setUploadProgress',
  'kycErrors', 'setKycErrors', 'payoutErrors', 'setPayoutErrors',
  'selectedSportFilter', 'setSelectedSportFilter', 'searchQuery', 'setSearchQuery',
  'searchViewMode', 'setSearchViewMode', 'showFilterSheet', 'setShowFilterSheet',
  'selectedTurfForPreview', 'setSelectedTurfForPreview', 'galleryImageIndex', 'setGalleryImageIndex',
  'selectedPitchId', 'setSelectedPitchId', 'filterSport', 'setFilterSport',
  'filterDate', 'setFilterDate', 'filterTimeRange', 'setFilterTimeRange',
  'filterPitchSize', 'setFilterPitchSize', 'filterRadius', 'setFilterRadius',
  'getDistance', 'activeTurfId', 'setActiveTurfId', 'activeTurf',
  'bookingDate', 'setBookingDate', 'selectedSlotId', 'setSelectedSlotId',
  'checkoutOption', 'setCheckoutOption', 'splitPlayersCount', 'setSplitPlayersCount',
  'showCheckoutModal', 'setShowCheckoutModal', 'isProcessingPayment', 'setIsProcessingPayment',
  'bookingSuccessData', 'setBookingSuccessData', 'activeChatId', 'setActiveChatId',
  'chatInput', 'setChatInput', 'hoveredMapPin', 'setHoveredMapPin',
  'showNotifications', 'setShowNotifications', 'adminSelectedDate', 'setAdminSelectedDate',
  'adminBlockedSlots', 'setAdminBlockedSlots', 'adminSlotPrices', 'setAdminSlotPrices',
  'newAnnouncementText', 'setNewAnnouncementText', 'newAnnouncementSport', 'setNewAnnouncementSport',
  'newAnnouncementTurf', 'setNewAnnouncementTurf',
  'navigateTo', 'updateOnboardingData', 'handleSendOTP', 'handleVerifyOTP',
  'handleUsernameChange', 'selectSuggestion', 'handleProfileSubmit', 'triggerConfetti',
  'grantLocation', 'selectManualLocation', 'processBookingPayment', 'joinSplitGame',
  'sendChatMessage', 'createAdminAnnouncement', 'toggleAdminSlot', 'handlePriceChange',
  'totalRevenue', 'pendingSplitRevenue', 'resetApp',
];

const LUCIDE_ICONS = [
  'MapPin', 'Bell', 'Search', 'Calendar', 'DollarSign', 'Users', 'MessageSquare',
  'Settings', 'Shield', 'Plus', 'Check', 'ChevronRight', 'Star', 'Share2',
  'LogOut', 'Compass', 'Lock', 'Unlock', 'Clock', 'CreditCard', 'TrendingUp',
  'PlusCircle', 'User', 'AlertTriangle', 'Send', 'SendHorizontal', 'Menu', 'X', 'ArrowLeft',
];

function prefixAppIdentifiers(code) {
  let result = code;
  const sorted = [...APP_IDENTIFIERS].sort((a, b) => b.length - a.length);
  for (const id of sorted) {
    const re = new RegExp(`(?<![.a-zA-Z0-9_])${id}(?![a-zA-Z0-9_])`, 'g');
    result = result.replace(re, `app.${id}`);
  }
  return result;
}

function detectLucideIcons(code) {
  return LUCIDE_ICONS.filter(icon => code.includes(icon));
}

function extractViewBlock(viewName) {
  const startPattern = `{view === '${viewName}' && (`;
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startPattern)) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) throw new Error(`View not found: ${viewName}`);

  let depth = 0;
  let started = false;
  let endIdx = -1;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '(') { depth++; started = true; }
      if (ch === ')') depth--;
    }
    if (started && depth === 0) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) throw new Error(`End not found for view: ${viewName}`);

  let block = lines.slice(startIdx, endIdx + 1).join('\n');
  block = block.replace(new RegExp(`\\s*\\{view === '${viewName}' && \\(`), '');
  block = block.replace(/\)\}\s*$/, '');
  return block.trim();
}

function makePage(name, componentName, folder, viewName, extraImports = '') {
  let jsx = extractViewBlock(viewName);
  jsx = prefixAppIdentifiers(jsx);
  const icons = detectLucideIcons(jsx);
  const iconImport = icons.length ? `import { ${icons.join(', ')} } from 'lucide-react';\n` : '';
  const mockImport = (jsx.includes('MOCK_TURFS') || jsx.includes('MOCK_PLAYERS') || jsx.includes('SPORTS'))
    ? `import { MOCK_TURFS, MOCK_PLAYERS, SPORTS } from '../../data/mockData';\n`.replace('../../', folder === 'admin' ? '../' : '../../')
    : '';
  const mockImportFixed = folder === 'admin'
    ? (jsx.includes('MOCK_TURFS') || jsx.includes('SPORTS') ? `import { MOCK_TURFS, SPORTS } from '../data/mockData';\n` : '')
    : mockImport;

  const depth = folder === 'admin' ? '../' : '../../';
  const content = `import React from 'react';
${iconImport}${mockImportFixed}${extraImports}import { useApp } from '${depth}context/AppContext';

export default function ${componentName}() {
  const app = useApp();

  return (
${jsx.split('\n').map(l => '    ' + l).join('\n')}
  );
}
`;
  const dir = path.join(src, 'pages', folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.jsx`), content);
  console.log(`Created ${folder}/${name}.jsx`);
}

// useAppState.js
const stateLines = lines.slice(10, 701);
let stateBody = stateLines.join('\n');
stateBody = stateBody.replace(/^export default function App\(\) \{\n/, '');
stateBody = `import { useState, useEffect } from 'react';
import { SPORTS, MOCK_TURFS, INITIAL_ANNOUNCEMENTS, INITIAL_CHATS } from '../data/mockData';

export function useAppState() {
${stateBody}

  const resetApp = () => {
    localStorage.removeItem('tm_profile');
    localStorage.removeItem('tm_onboarding_progress');
    setOnboardingData({
      view: 'welcome_carousel',
      phoneNumber: '',
      role: '',
      name: 'Rahul Mehta',
      username: '',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      favoriteSports: [],
      sportsDNA: {},
      location: null,
      businessName: '',
      ownerName: '',
      businessEmail: '',
      pinnedLocation: { lat: 19.456, lng: 72.812, address: 'Virar West, Mumbai' },
      gstin: '',
      pan: '',
      kycDoc: null,
      bankAccount: '',
      ifsc: '',
      accountHolder: ''
    });
    setUserProfile({
      isLoggedIn: false,
      name: 'Rahul Mehta',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      favoriteSports: ['football', 'cricket'],
      position: 'Midfielder',
      skillLevel: 'Intermediate',
      location: 'Virar',
      radius: 5,
      phone: '9876543210',
      username: '@rahul_cricket'
    });
    setPhoneNumber('');
    setOtpSent(false);
    setOtpCode('');
    setIsAdminMode(false);
    setView('splash');
    triggerConfetti();
  };

  return {
    isAdminMode, setIsAdminMode, view, setView,
    onboardingData, setOnboardingData, userProfile, setUserProfile,
    bookings, setBookings, announcements, setAnnouncements,
    chats, setChats, notifications, setNotifications,
    phoneNumber, setPhoneNumber, otpSent, setOtpSent,
    otpCode, setOtpCode, loginTimer, setLoginTimer,
    carouselIndex, setCarouselIndex, showConfetti, setShowConfetti,
    confettiParticles, setConfettiParticles, usernameError, setUsernameError,
    usernameSuggestions, setUsernameSuggestions, whatsappNotification, setWhatsappNotification,
    uploadingFile, setUploadingFile, uploadProgress, setUploadProgress,
    kycErrors, setKycErrors, payoutErrors, setPayoutErrors,
    selectedSportFilter, setSelectedSportFilter, searchQuery, setSearchQuery,
    searchViewMode, setSearchViewMode, showFilterSheet, setShowFilterSheet,
    selectedTurfForPreview, setSelectedTurfForPreview, galleryImageIndex, setGalleryImageIndex,
    selectedPitchId, setSelectedPitchId, filterSport, setFilterSport,
    filterDate, setFilterDate, filterTimeRange, setFilterTimeRange,
    filterPitchSize, setFilterPitchSize, filterRadius, setFilterRadius,
    getDistance, activeTurfId, setActiveTurfId, activeTurf,
    bookingDate, setBookingDate, selectedSlotId, setSelectedSlotId,
    checkoutOption, setCheckoutOption, splitPlayersCount, setSplitPlayersCount,
    showCheckoutModal, setShowCheckoutModal, isProcessingPayment, setIsProcessingPayment,
    bookingSuccessData, setBookingSuccessData, activeChatId, setActiveChatId,
    chatInput, setChatInput, hoveredMapPin, setHoveredMapPin,
    showNotifications, setShowNotifications, adminSelectedDate, setAdminSelectedDate,
    adminBlockedSlots, setAdminBlockedSlots, adminSlotPrices, setAdminSlotPrices,
    newAnnouncementText, setNewAnnouncementText, newAnnouncementSport, setNewAnnouncementSport,
    newAnnouncementTurf, setNewAnnouncementTurf,
    navigateTo, updateOnboardingData, handleSendOTP, handleVerifyOTP,
    handleUsernameChange, selectSuggestion, handleProfileSubmit, triggerConfetti,
    grantLocation, selectManualLocation, processBookingPayment, joinSplitGame,
    sendChatMessage, createAdminAnnouncement, toggleAdminSlot, handlePriceChange,
    totalRevenue, pendingSplitRevenue, resetApp,
  };
}
`;

fs.mkdirSync(path.join(src, 'hooks'), { recursive: true });
fs.writeFileSync(path.join(src, 'hooks', 'useAppState.js'), stateBody);
console.log('Created hooks/useAppState.js');

// Fix useAppState - remove the "// Render Subviews" part and return statement from original
let hookContent = fs.readFileSync(path.join(src, 'hooks', 'useAppState.js'), 'utf8');
hookContent = hookContent.replace(/\n  \/\/ Render Subviews[\s\S]*$/, '');
fs.writeFileSync(path.join(src, 'hooks', 'useAppState.js'), hookContent);

// AppContext
fs.mkdirSync(path.join(src, 'context'), { recursive: true });
fs.writeFileSync(path.join(src, 'context', 'AppContext.jsx'), `import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const value = useAppState();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
`);
console.log('Created context/AppContext.jsx');

const pages = [
  ['SplashPage', 'SplashPage', 'onboarding', 'splash'],
  ['WelcomeCarouselPage', 'WelcomeCarouselPage', 'onboarding', 'welcome_carousel'],
  ['LoginPage', 'LoginPage', 'onboarding', 'login'],
  ['OtpVerifyPage', 'OtpVerifyPage', 'onboarding', 'otp_verify'],
  ['RoleSelectionPage', 'RoleSelectionPage', 'onboarding', 'role_selection'],
  ['ProfileSetupPage', 'ProfileSetupPage', 'onboarding', 'profile_setup'],
  ['SportsDnaPage', 'SportsDnaPage', 'onboarding', 'sports_dna'],
  ['LocationPermissionPage', 'LocationPermissionPage', 'onboarding', 'location_permission'],
  ['LocationManualPage', 'LocationManualPage', 'onboarding', 'location_manual'],
  ['OwnerBusinessPage', 'OwnerBusinessPage', 'onboarding', 'owner_business'],
  ['OwnerMapPage', 'OwnerMapPage', 'onboarding', 'owner_map'],
  ['OwnerKycPage', 'OwnerKycPage', 'onboarding', 'owner_kyc'],
  ['OwnerPayoutPage', 'OwnerPayoutPage', 'onboarding', 'owner_payout'],
  ['OwnerPendingPage', 'OwnerPendingPage', 'onboarding', 'owner_pending'],
  ['HomePage', 'HomePage', 'user', 'home'],
  ['SearchEnginePage', 'SearchEnginePage', 'user', 'search_engine'],
  ['TurfDetailsPage', 'TurfDetailsPage', 'user', 'turf_details'],
  ['PlayRadiusPage', 'PlayRadiusPage', 'user', 'play_radius'],
  ['LockerRoomPage', 'LockerRoomPage', 'user', 'locker_room'],
  ['ChatPage', 'ChatPage', 'user', 'chat'],
];

for (const [file, comp, folder, view] of pages) {
  makePage(file, comp, folder, view);
}

// Admin dashboard - extract lines 3583-3846
const adminStart = lines.findIndex(l => l.includes('{isAdminMode && ('));
let adminBlock = '';
{
  let depth = 0;
  let started = false;
  let endIdx = -1;
  for (let i = adminStart; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '(') { depth++; started = true; }
      if (ch === ')') depth--;
    }
    if (started && depth === 0) {
      endIdx = i;
      break;
    }
  }
  adminBlock = lines.slice(adminStart + 1, endIdx).join('\n');
  adminBlock = adminBlock.replace(/^\s*<div className="w-full bg-slate-850[\s\S]*?\n\s*<div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-\[780px\] bg-slate-900\/40">\s*\n/, '');
  // Actually keep full admin inner content from sidebar
}
// Extract admin inner from line 3584-3845
adminBlock = lines.slice(3583, 3845).join('\n');
adminBlock = prefixAppIdentifiers(adminBlock);
const adminIcons = detectLucideIcons(adminBlock);
fs.mkdirSync(path.join(src, 'pages', 'admin'), { recursive: true });
fs.writeFileSync(path.join(src, 'pages', 'admin', 'AdminDashboardPage.jsx'), `import React from 'react';
import { ${adminIcons.join(', ')} } from 'lucide-react';
import { MOCK_TURFS, SPORTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function AdminDashboardPage() {
  const app = useApp();

  return (
    <div className="w-full bg-slate-850 rounded-3xl border border-slate-750 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[700px] text-slate-200 animate-fade-in">
${adminBlock.split('\n').map(l => '      ' + l).join('\n')}
    </div>
  );
}
`);
console.log('Created pages/admin/AdminDashboardPage.jsx');

console.log('Done extracting pages.');

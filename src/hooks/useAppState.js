import { useState, useEffect, useRef, useCallback } from 'react';
import { SPORTS, MOCK_TURFS, INITIAL_ANNOUNCEMENTS, INITIAL_CHATS } from '../data/mockData';
import { INITIAL_FRIEND_STATS } from '../data/leaderboardData';
import { extractPlayerDeltas, applyStatDelta } from '../utils/scoreEngine';
import { INITIAL_OWNERS, SUPER_ADMIN_PHONE } from '../data/ownersData';
import { enrichBookingPayment, calcCommission } from '../constants/commission';
import { bookingApi } from '../services/api';
import { authApi } from '../services/authApi';
import { turfsApi } from '../services/turfsApi';
import { ownersApi } from '../services/ownersApi';
import { adminApi } from '../services/adminApi';
import { paymentsApi } from '../services/paymentsApi';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import { socketService } from '../services/socket';
import { INITIAL_FRIEND_REQUESTS } from '../data/chatData';
import env from '../config/env';
import { readJson } from '../utils/safeStorage';
import { getToken } from '../services/apiClient';
import { mapApiBooking } from '../utils/bookingMapper';
import { lockerApi } from '../services/lockerApi';
import { mapLockerPost, mergeLockerAnnouncements } from '../utils/lockerMapper';
import { chatApi } from '../services/chatApi';
import { mapApiChatRoom, mergeChats } from '../utils/chatMapper';
import { socialApi } from '../services/socialApi';
import { leaderboardApi } from '../services/leaderboardApi';
import { broadcastsApi } from '../services/broadcastsApi';
import { notificationsApi } from '../services/notificationsApi';
import { getOrCreatePushToken } from '../utils/pushToken';

/** Merge saved turfs with mock data so image/gallery fields stay valid after app updates */
function loadTurfs() {
  const parsed = readJson('tm_turfs', null);
  if (!parsed || !Array.isArray(parsed)) return MOCK_TURFS;
  const mockById = Object.fromEntries(MOCK_TURFS.map((t) => [t.id, t]));
  const merged = parsed.map((t) => {
    const mock = mockById[t.id];
    if (!mock) return { ...t, image: t.image || t.gallery?.[0] };
    return {
      ...mock,
      ...t,
      image: t.image || mock.image,
      gallery: t.gallery?.length ? t.gallery : mock.gallery,
    };
  });
  const savedIds = new Set(parsed.map((t) => t.id));
  MOCK_TURFS.forEach((t) => {
    if (!savedIds.has(t.id)) merged.push(t);
  });
  return merged;
}

export function useAppState() {
  // App-wide state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [view, setView] = useState('splash'); // splash, welcome_carousel, login, otp_verify, role_selection, profile_setup, sports_dna, location_permission, location_manual, owner_business, owner_map, owner_kyc, owner_payout, owner_pending, home, turf_details, play_radius, locker_room, chat, admin
  
  // Track onboarding data locally
  const [onboardingData, setOnboardingData] = useState(() => readJson('tm_onboarding_progress', {
      view: 'welcome_carousel',
      phoneNumber: '',
      role: '', // PLAYER or OWNER
      name: 'Rahul Mehta',
      username: '',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      favoriteSports: [],
      sportsDNA: {}, // e.g. { football: { skillLevel: 'Intermediate', position: 'Midfielder' } }
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
    }));

  const [userProfile, setUserProfile] = useState(() => readJson('tm_profile', {
      isLoggedIn: false,
      name: 'Rahul Mehta',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
      favoriteSports: ['football', 'cricket'],
      position: 'Midfielder',
      skillLevel: 'Intermediate',
      location: 'Virar',
      radius: 10,
      lat: 19.456,
      lng: 72.812,
      phone: '9876543210',
      username: '@rahul_cricket'
    }));

  const [bookings, setBookings] = useState(() => {
    const raw = readJson('tm_bookings', [
      {
        id: 'B-7891',
        turfId: 'turf-1',
        turfName: 'Green Valley Arena',
        slotTime: '08:00 PM - 09:00 PM',
        date: 'Today',
        type: 'split',
        paidAmount: 400,
        totalAmount: 1200,
        status: 'Confirmed (Split Active)',
        qrCode: 'TMT-SPLIT-B-7891-GRN-VALY',
        roster: ['Rahul Mehta', 'Sneha Rao', 'Vikram Singh'],
        ownerId: 'owner-1',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400',
        grossAmount: 1200,
        commissionAmount: 40,
        ownerPayout: 360,
        source: 'app',
        bookedAt: '2026-06-19T18:00:00.000Z',
      },
    ]);
    return raw.map((b) => {
      if (b.commissionAmount != null) return b;
      const turf = MOCK_TURFS.find((t) => t.id === b.turfId);
      const collected = b.paidAmount || 0;
      return enrichBookingPayment(b, turf, collected, b.totalAmount || collected);
    });
  });

  const [turfs, setTurfs] = useState(loadTurfs);
  const turfsRef = useRef(turfs);
  useEffect(() => { turfsRef.current = turfs; }, [turfs]);

  const refreshMyBookings = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { bookings: rows } = await bookingApi.listMine();
      setBookings((prev) => {
        const apiBookings = (rows || []).map((row) => mapApiBooking(row, turfsRef.current));
        if (!apiBookings.length) return prev;
        const apiIds = new Set(apiBookings.map((b) => b.id));
        const localOnly = prev.filter((b) => !apiIds.has(b.id));
        return [...apiBookings, ...localOnly];
      });
    } catch (err) {
      console.warn('[bookings] refresh failed:', err.message);
    }
  }, []);

  const [owners, setOwners] = useState(() => readJson('tm_owners', INITIAL_OWNERS));

  const [ownerRevenue, setOwnerRevenue] = useState(null);
  const [platformLedger, setPlatformLedger] = useState(null);

  const [suspendedTurfIds, setSuspendedTurfIds] = useState(() => readJson('tm_suspended_turfs', []));
  const [bannedUsers, setBannedUsers] = useState(() => readJson('tm_banned_users', []));

  const banUser = (username) => {
    setBannedUsers(prev => {
      const next = prev.includes(username) ? prev : [...prev, username];
      localStorage.setItem('tm_banned_users', JSON.stringify(next));
      return next;
    });
    showToast(`User ${username} has been permanently banned`, 'info');
  };

  const unbanUser = (username) => {
    setBannedUsers(prev => {
      const next = prev.filter(u => u !== username);
      localStorage.setItem('tm_banned_users', JSON.stringify(next));
      return next;
    });
    showToast(`User ${username} unbanned`, 'success');
  };

  const [ownerActiveTurfId, setOwnerActiveTurfId] = useState('turf-1');

  const [announcements, setAnnouncements] = useState(() => readJson('tm_announcements', INITIAL_ANNOUNCEMENTS));

  const [chats, setChats] = useState(() => readJson('tm_chats', INITIAL_CHATS));

  const [friendRequests, setFriendRequests] = useState(() => readJson('tm_friend_requests', INITIAL_FRIEND_REQUESTS));

  const [friendStats, setFriendStats] = useState(() => readJson('tm_friend_stats', INITIAL_FRIEND_STATS));

  const [liveGame, setLiveGame] = useState(() => readJson('tm_live_game', null));

  const [gameHistory, setGameHistory] = useState(() => readJson('tm_game_history', []));

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Sneha Rao requested to join your game tonight!", time: "5 mins ago", read: false },
    { id: 2, text: "Slot booking B-7891 confirmed for 8 PM.", time: "1 hour ago", read: true }
  ]);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', title = '') => {
    setToast({ message, type, title });
  };

  const dismissToast = () => setToast(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Onboarding & login states
  const [phoneNumber, setPhoneNumber] = useState(onboardingData.phoneNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loginTimer, setLoginTimer] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [whatsappNotification, setWhatsappNotification] = useState(null);
  
  // File upload simulation states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Validation errors
  const [kycErrors, setKycErrors] = useState({});
  const [payoutErrors, setPayoutErrors] = useState({});

  // Home Screen Filters
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Discovery & Search Engine States
  const [searchViewMode, setSearchViewMode] = useState('list'); // list or map
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedTurfForPreview, setSelectedTurfForPreview] = useState(null);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [selectedPitchId, setSelectedPitchId] = useState('pitch-a'); // pitch-a or pitch-b
  
  // Search Filters
  const [filterSport, setFilterSport] = useState('all');
  const [filterDate, setFilterDate] = useState('Today');
  const [filterTimeRange, setFilterTimeRange] = useState([6, 23]); // 6 AM to 11 PM
  const [filterPitchSize, setFilterPitchSize] = useState('all'); // all, 5v5, 7v7, Box Cricket
  const [filterRadius, setFilterRadiusState] = useState(() => readJson('tm_profile', {})?.radius || 10);

  const setPlayRadius = (km) => {
    const r = Math.max(2, Math.min(20, Number(km) || 10));
    setFilterRadiusState(r);
    setUserProfile((prev) => ({ ...prev, radius: r }));
  };
  const setFilterRadius = setPlayRadius;

  // Phase 1b: load turfs from API when logged in
  useEffect(() => {
    if (!userProfile?.isLoggedIn) return undefined;
    let cancelled = false;
    const lat = userProfile.lat ?? 19.456;
    const lng = userProfile.lng ?? 72.812;
    const radius = userProfile.radius ?? filterRadius ?? 10;

    turfsApi.list({ lat, lng, radius_km: radius, sport: selectedSportFilter })
      .then(({ turfs: apiTurfs }) => {
        if (!cancelled && apiTurfs?.length) {
          setTurfs(apiTurfs);
          localStorage.setItem('tm_turfs', JSON.stringify(apiTurfs));
        }
      })
      .catch((err) => {
        console.warn('[turfs] API unavailable, using local data:', err.message);
      });

    return () => { cancelled = true; };
  }, [userProfile?.isLoggedIn, userProfile?.lat, userProfile?.lng, userProfile?.radius, filterRadius, selectedSportFilter]);

  const refreshLockerFeed = useCallback(async () => {
    if (!userProfile?.isLoggedIn) return;
    try {
      const [splitsRes, feedRes, broadcastRes] = await Promise.all([
        bookingApi.listOpenSplits().catch(() => ({ splits: [] })),
        lockerApi.getFeed().catch(() => ({ posts: [] })),
        broadcastsApi.listActive().catch(() => ({ broadcasts: [] })),
      ]);
      const splits = splitsRes.splits || [];
      const posts = (feedRes.posts || []).map(mapLockerPost);
      const broadcasts = broadcastRes.broadcasts || [];
      setAnnouncements((prev) => mergeLockerAnnouncements(splits, posts, prev, broadcasts));
    } catch (err) {
      console.warn('[locker] refresh failed:', err.message);
    }
  }, [userProfile?.isLoggedIn]);

  const refreshChats = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { rooms = [] } = await chatApi.getInbox();
      const mapped = rooms.map(mapApiChatRoom);
      setChats((prev) => mergeChats(mapped, prev));
    } catch (err) {
      console.warn('[chat] refresh failed:', err.message);
    }
  }, []);

  const refreshSocial = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [reqRes, squadRes] = await Promise.all([
        socialApi.listFriendRequests().catch(() => ({ requests: [] })),
        socialApi.listSquads().catch(() => ({ squads: [] })),
      ]);
      if (reqRes.requests?.length) {
        setFriendRequests(reqRes.requests);
      }
      if (squadRes.squads) {
        setSquadGroups((prev) => {
          if (!squadRes.squads.length) return prev;
          const apiIds = new Set(squadRes.squads.map((s) => s.id));
          const localOnly = prev.filter((g) => !apiIds.has(g.id) && String(g.id).startsWith('grp-'));
          return [...squadRes.squads, ...localOnly];
        });
      }
    } catch (err) {
      console.warn('[social] refresh failed:', err.message);
    }
  }, []);

  const refreshLeaderboard = useCallback(async (scope = 'squad') => {
    if (!getToken()) return;
    try {
      const [{ entries }, matchRes] = await Promise.all([
        leaderboardApi.getEntries({
          scope,
          lat: userProfile?.lat,
          lng: userProfile?.lng,
          radiusKm: filterRadius,
        }),
        leaderboardApi.getMatches().catch(() => ({ matches: [] })),
      ]);

      if (entries?.length) {
        setFriendStats((prev) => {
          const normalized = entries.map((e) => ({
            ...e,
            id: e.isMe ? 'me' : (e.id || e.userId),
          }));
          const hasOnlyMe = normalized.length === 1 && normalized[0].isMe;
          if (hasOnlyMe) {
            const demoFriends = prev.filter((p) => !p.isMe);
            return [...normalized, ...demoFriends];
          }
          return normalized;
        });
      }

      if (matchRes.matches?.length) {
        setGameHistory(matchRes.matches);
      }
    } catch (err) {
      console.warn('[leaderboard] refresh failed:', err.message);
    }
  }, [userProfile?.lat, userProfile?.lng, filterRadius]);

  const registerPushToken = useCallback(async () => {
    if (!getToken()) return;
    try {
      await notificationsApi.registerToken(getOrCreatePushToken(), 'web');
    } catch (err) {
      console.warn('[push] token register failed:', err.message);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { notifications: rows } = await notificationsApi.list();
      if (rows?.length) {
        setNotifications(rows);
      }
    } catch (err) {
      console.warn('[notifications] refresh failed:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!userProfile?.isLoggedIn || !getToken()) return undefined;
    refreshMyBookings();
    refreshChats();
    refreshSocial();
    refreshLeaderboard();
    registerPushToken();
    refreshNotifications();
    return undefined;
  }, [userProfile?.isLoggedIn, refreshMyBookings, refreshChats, refreshSocial, refreshLeaderboard, registerPushToken, refreshNotifications]);

  useEffect(() => {
    if (view !== 'leaderboard' || !userProfile?.isLoggedIn) return undefined;
    refreshLeaderboard('squad');
    return undefined;
  }, [view, userProfile?.isLoggedIn, refreshLeaderboard]);

  useEffect(() => {
    if (view !== 'chat' || !userProfile?.isLoggedIn) return undefined;
    refreshChats();
    const timer = setInterval(refreshChats, 30000);
    return () => clearInterval(timer);
  }, [view, userProfile?.isLoggedIn, refreshChats]);

  useEffect(() => {
    if (!userProfile?.isLoggedIn) return undefined;
    refreshLockerFeed();
    return undefined;
  }, [userProfile?.isLoggedIn, refreshLockerFeed]);

  useEffect(() => {
    if (view !== 'locker_room' || !userProfile?.isLoggedIn) return undefined;
    refreshLockerFeed();
    const timer = setInterval(refreshLockerFeed, 30000);
    return () => clearInterval(timer);
  }, [view, userProfile?.isLoggedIn, refreshLockerFeed]);

  // Phase 1e: load pending KYC queue for super admin
  useEffect(() => {
    if (userProfile?.role !== 'SUPER_ADMIN' || !userProfile?.isLoggedIn) return undefined;
    let cancelled = false;

    adminApi.listPendingKyc()
      .then(({ owners: pending = [] }) => {
        if (cancelled || !pending.length) return;
        setOwners((prev) => {
          const approved = prev.filter((o) => o.approvalStatus === 'Approved');
          const pendingIds = new Set(pending.map((o) => o.id));
          const kept = approved.filter((o) => !pendingIds.has(o.id));
          return [...kept, ...pending];
        });
      })
      .catch((err) => console.warn('[admin] pending KYC unavailable:', err.message));

    return () => { cancelled = true; };
  }, [userProfile?.role, userProfile?.isLoggedIn]);

  // Phase 2d: owner revenue from API ledger
  useEffect(() => {
    if (userProfile?.role !== 'OWNER' || !userProfile?.isLoggedIn) return undefined;
    let cancelled = false;
    ownersApi.getRevenue()
      .then((data) => { if (!cancelled) setOwnerRevenue(data); })
      .catch((err) => console.warn('[owners] revenue unavailable:', err.message));
    return () => { cancelled = true; };
  }, [userProfile?.role, userProfile?.isLoggedIn]);

  // Phase 2d: platform ledger for super admin
  useEffect(() => {
    if (userProfile?.role !== 'SUPER_ADMIN' || !userProfile?.isLoggedIn) return undefined;
    let cancelled = false;
    adminApi.getPlatformLedger()
      .then((data) => { if (!cancelled) setPlatformLedger(data); })
      .catch((err) => console.warn('[admin] ledger unavailable:', err.message));
    return () => { cancelled = true; };
  }, [userProfile?.role, userProfile?.isLoggedIn]);

  // Haversine formula for dynamic coordinates distance
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 1.0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Booking states
  const [activeTurfId, setActiveTurfId] = useState('turf-1');
  const [bookingDate, setBookingDate] = useState('Today');
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [checkoutOption, setCheckoutOption] = useState('private'); // private, split
  const [splitPlayersCount, setSplitPlayersCount] = useState(3);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [pendingJoinSplitId, setPendingJoinSplitId] = useState(null);
  const [showSplitSuccessModal, setShowSplitSuccessModal] = useState(false);
  const [splitSuccessAnnId, setSplitSuccessAnnId] = useState(null);
  const [checkoutSlotLockExpiresAt, setCheckoutSlotLockExpiresAt] = useState(null);
  const [squadGroups, setSquadGroups] = useState(() => readJson('tm_squad_groups', []));
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [impersonatingOwner, setImpersonatingOwner] = useState(null);
  const [checkoutInviteGroupId, setCheckoutInviteGroupId] = useState('');

  // Phase 1c: sync slot availability from API for active turf
  useEffect(() => {
    if (!userProfile?.isLoggedIn || !activeTurfId) return undefined;
    let cancelled = false;

    bookingApi.getAvailability(activeTurfId, bookingDate)
      .then(({ booked = [], locked = [] }) => {
        if (cancelled) return;
        setTurfs((prev) => prev.map((t) => {
          if (t.id !== activeTurfId) return t;
          return {
            ...t,
            slots: t.slots.map((s) => {
              const key = `${activeTurfId}:${s.id}:${bookingDate}`;
              const isBooked = booked.includes(key);
              const lock = locked.find((l) => l.slotKey === key);
              if (isBooked) return { ...s, status: 'booked' };
              if (lock && lock.lockedBy !== userProfile.userId) return { ...s, status: 'locked' };
              if (s.status === 'booked' || s.status === 'locked') return { ...s, status: 'available' };
              return s;
            }),
          };
        }));
      })
      .catch((err) => console.warn('[bookings] availability sync skipped:', err.message));

    return () => { cancelled = true; };
  }, [userProfile?.isLoggedIn, userProfile?.userId, activeTurfId, bookingDate]);

  // Chat Screen state
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  
  // Radius Screen state
  const [hoveredMapPin, setHoveredMapPin] = useState(null);

  // Notifications Drawer
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Admin states
  const [adminSelectedDate, setAdminSelectedDate] = useState('Today');
  const [adminBlockedSlots, setAdminBlockedSlots] = useState(() => readJson('tm_admin_blocked', {
      'turf-1': ['s3', 's6'],
      'turf-2': ['k1', 'k4', 'k5'],
      'turf-3': ['d4'],
      'turf-4': ['p3']
    }));
  const [adminSlotPrices, setAdminSlotPrices] = useState({}); // Custom pricing override e.g. { 's7': 1500 }
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [newAnnouncementSport, setNewAnnouncementSport] = useState('football');
  const [newAnnouncementTurf, setNewAnnouncementTurf] = useState('turf-1');

  // Trigger Splash screen timeout
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        const parsedProfile = readJson('tm_profile', null);
        
        if (parsedProfile && parsedProfile.isLoggedIn) {
          if (parsedProfile.role === 'SUPER_ADMIN') {
            setIsAdminMode(false);
            setView('super_admin');
          } else if (parsedProfile.role === 'OWNER') {
            setIsAdminMode(false);
            if (parsedProfile.approvalStatus === 'Pending_Approval') {
              setView('owner_pending');
            } else {
              const owner = INITIAL_OWNERS.find(o => o.phone === parsedProfile.phone || o.id === parsedProfile.ownerId);
              setOwnerActiveTurfId(owner?.turfIds?.[0] || parsedProfile.turfIds?.[0] || 'turf-1');
              setView('owner_dashboard');
            }
          } else {
            setIsAdminMode(false);
            setView('home');
          }
        } else {
          const progress = readJson('tm_onboarding_progress', null);
          if (progress) {
            setView(progress.view || 'welcome_carousel');
            if (progress.phoneNumber) {
              setPhoneNumber(progress.phoneNumber);
            }
          } else {
            setView('welcome_carousel');
          }
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Sync Onboarding Data to LocalStorage
  useEffect(() => {
    localStorage.setItem('tm_onboarding_progress', JSON.stringify(onboardingData));
  }, [onboardingData]);

  // Auto-play welcome carousel
  useEffect(() => {
    let interval;
    if (view === 'welcome_carousel') {
      interval = setInterval(() => {
        setCarouselIndex(prev => (prev + 1) % 3);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tm_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('tm_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('tm_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('tm_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('tm_friend_requests', JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem('tm_squad_groups', JSON.stringify(squadGroups));
  }, [squadGroups]);

  // Deep-link: #join/ann-id opens join split review
  useEffect(() => {
    if (!userProfile?.isLoggedIn || userProfile.role !== 'PLAYER') return;
    const match = window.location.hash.match(/^#join\/([^/?]+)/);
    if (match) {
      const annId = decodeURIComponent(match[1]);
      const ann = announcements.find((a) => a.id === annId && a.status === 'open' && a.playersNeeded > 0);
      if (ann) setPendingJoinSplitId(annId);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [userProfile?.isLoggedIn, userProfile?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Connect socket and listen globally
  useEffect(() => {
    if (userProfile && userProfile.isLoggedIn) {
      const userId = userProfile.userId || userProfile.username || 'testUser';
      socketService.connect(userId);

      // Join all current rooms
      chats.forEach((c) => {
        socketService.joinRoom(c.id);
      });

      socketService.onMessageReceived((msg) => {
        setChats((prevChats) => {
          return prevChats.map((c) => {
            if (c.id === msg.roomId) {
              const alreadyExists = c.messages.some(
                (m) =>
                  m.id === msg.id ||
                  (m.text === msg.text && m.sender === msg.sender)
              );
              if (alreadyExists) return c;

              const isCurrentRoom = activeChatIdRef.current === msg.roomId;
              return {
                ...c,
                unread: isCurrentRoom ? 0 : (c.unread || 0) + 1,
                messages: [
                  ...c.messages,
                  {
                    id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                    sender: msg.sender,
                    text: msg.text,
                    time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: msg.type || 'TEXT',
                  },
                ],
              };
            }
            return c;
          });
        });
      });
    }

    return () => {
      // Keep it connected for the session
    };
  }, [userProfile.isLoggedIn, userProfile.userId, userProfile.username]);

  // Join new chat rooms when they are added to chats list
  useEffect(() => {
    if (userProfile && userProfile.isLoggedIn) {
      chats.forEach((c) => {
        socketService.joinRoom(c.id);
      });
    }
  }, [chats.length, userProfile.isLoggedIn]);

  // Clear unread count when activeChatId changes to a room
  useEffect(() => {
    if (activeChatId) {
      setChats((prevChats) =>
        prevChats.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c))
      );
      if (getToken() && activeChatId.startsWith('chat-booking-')) {
        chatApi.markRead(activeChatId).catch(() => {});
      }
    }
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem('tm_friend_stats', JSON.stringify(friendStats));
  }, [friendStats]);

  useEffect(() => {
    if (liveGame) localStorage.setItem('tm_live_game', JSON.stringify(liveGame));
    else localStorage.removeItem('tm_live_game');
  }, [liveGame]);

  useEffect(() => {
    localStorage.setItem('tm_game_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  useEffect(() => {
    localStorage.setItem('tm_admin_blocked', JSON.stringify(adminBlockedSlots));
  }, [adminBlockedSlots]);

  useEffect(() => {
    localStorage.setItem('tm_turfs', JSON.stringify(turfs));
  }, [turfs]);

  useEffect(() => {
    localStorage.setItem('tm_owners', JSON.stringify(owners));
  }, [owners]);

  useEffect(() => {
    localStorage.setItem('tm_suspended_turfs', JSON.stringify(suspendedTurfIds));
  }, [suspendedTurfIds]);

  // OTP Countdown timer
  useEffect(() => {
    if (loginTimer > 0) {
      const timer = setTimeout(() => setLoginTimer(loginTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [loginTimer]);

  const activeTurf = turfs.find(t => t.id === activeTurfId) || turfs[0];

  const getCurrentOwnerId = () => {
    if (userProfile.ownerId) return userProfile.ownerId;
    const match = owners.find(o => o.phone === userProfile.phone);
    return match?.id || null;
  };

  const getOwnerTurfs = (ownerId = getCurrentOwnerId()) => {
    if (!ownerId) return [];
    const record = owners.find(o => o.id === ownerId);
    const ids = record?.turfIds || [];
    return turfs.filter(t => ids.includes(t.id) && !suspendedTurfIds.includes(t.id));
  };

  const getOwnerBookings = (turfId = null, ownerId = getCurrentOwnerId()) => {
    const ownerTurfIds = getOwnerTurfs(ownerId).map(t => t.id);
    return bookings.filter(b => {
      const matchesOwner = b.ownerId === ownerId || ownerTurfIds.includes(b.turfId);
      if (!matchesOwner) return false;
      if (turfId) return b.turfId === turfId;
      return true;
    });
  };

  const getOwnerRevenueMetrics = (turfId = null, ownerId = getCurrentOwnerId()) => {
    if (ownerRevenue?.summary && !turfId) {
      return {
        gross: ownerRevenue.summary.gross,
        commission: ownerRevenue.summary.commission,
        net: ownerRevenue.summary.net,
        pendingSplits: 0,
        bookingCount: ownerRevenue.summary.entryCount,
        pendingSettlement: ownerRevenue.summary.pendingSettlement,
      };
    }
    const ownerBookings = getOwnerBookings(turfId, ownerId);
    const gross = ownerBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const commission = ownerBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const net = ownerBookings.reduce((sum, b) => sum + (b.ownerPayout || 0), 0);
    const pendingSplits = ownerBookings.filter(b => b.type === 'split' && b.paidAmount < b.totalAmount).length;
    return { gross, commission, net, pendingSplits, bookingCount: ownerBookings.length };
  };

  const getPlatformMetrics = () => {
    if (platformLedger) {
      const pendingOwners = owners.filter(o => o.approvalStatus === 'Pending_Approval');
      return {
        globalGross: platformLedger.ledgerGross || platformLedger.paymentsVolumeInr,
        totalCommission: platformLedger.ledgerCommission,
        activeTurfs: turfs.filter(t => !suspendedTurfIds.includes(t.id)).length,
        pendingOwners,
        totalBookings: platformLedger.settledBookings,
        refundsIssued: platformLedger.refundsIssued,
      };
    }
    const appBookings = bookings.filter(b => b.source === 'app');
    const globalGross = appBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalCommission = appBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const activeTurfs = turfs.filter(t => !suspendedTurfIds.includes(t.id)).length;
    const pendingOwners = owners.filter(o => o.approvalStatus === 'Pending_Approval');
    return { globalGross, totalCommission, activeTurfs, pendingOwners, totalBookings: appBookings.length };
  };

  const getOwnerById = (ownerId) => owners.find(o => o.id === ownerId);

  const getTurfOwnerName = (ownerId) => {
    const owner = getOwnerById(ownerId);
    return owner?.name || owner?.businessName || 'Unknown';
  };

  const approveOwnerApplication = async (ownerId) => {
    try {
      const { owner } = await adminApi.approveKyc(ownerId);
      setOwners((prev) => prev.map((o) => (o.id === ownerId ? { ...o, ...owner } : o)));
      const approved = owner || owners.find((o) => o.id === ownerId);
      if (approved?.turfIds?.length) {
        setTurfs((prev) => prev.map((t) =>
          approved.turfIds.includes(t.id) ? { ...t, status: 'active' } : t
        ));
        turfsApi.list().then(({ turfs: apiTurfs }) => {
          if (apiTurfs?.length) setTurfs(apiTurfs);
        }).catch(() => {});
      }
      if (userProfile.ownerId === ownerId || userProfile.userId === ownerId || userProfile.phone === approved?.phone) {
        const nextProfile = {
          ...userProfile,
          approvalStatus: 'Approved',
          ownerId: ownerId,
          turfIds: approved?.turfIds || userProfile.turfIds,
        };
        setUserProfile(nextProfile);
        setOwnerActiveTurfId(approved?.turfIds?.[0] || ownerActiveTurfId);
        setView('owner_dashboard');
      }
      triggerConfetti();
      showToast('Owner application approved', 'success');
    } catch (err) {
      console.warn('[admin] approve failed, applying locally:', err.message);
      const owner = owners.find((o) => o.id === ownerId);
      setOwners((prev) => prev.map((o) =>
        o.id === ownerId ? { ...o, approvalStatus: 'Approved' } : o
      ));
      if (owner?.turfIds?.length) {
        setTurfs((prev) => prev.map((t) =>
          owner.turfIds.includes(t.id) ? { ...t, status: 'active' } : t
        ));
      }
      triggerConfetti();
    }
  };

  const rejectOwnerApplication = async (ownerId) => {
    try {
      await adminApi.rejectKyc(ownerId);
      setOwners((prev) => prev.filter((o) => o.id !== ownerId));
      showToast('Owner application rejected', 'info');
    } catch (err) {
      console.warn('[admin] reject failed, applying locally:', err.message);
      setOwners((prev) => prev.filter((o) => o.id !== ownerId));
    }
  };

  const suspendTurf = (turfId) => {
    setSuspendedTurfIds(prev => prev.includes(turfId) ? prev : [...prev, turfId]);
  };

  const activateTurf = (turfId) => {
    setSuspendedTurfIds(prev => prev.filter(id => id !== turfId));
  };

  const loginAsOwner = (ownerId) => {
    const owner = getOwnerById(ownerId);
    if (!owner) return;
    if (userProfile.role === 'SUPER_ADMIN' && !impersonatingOwner) {
      setImpersonatingOwner({
        ownerId,
        label: owner.businessName || owner.name,
        savedProfile: userProfile,
        savedView: view,
      });
    }
    const profile = {
      isLoggedIn: true,
      role: 'OWNER',
      name: owner.name,
      avatar: owner.avatar,
      phone: owner.phone,
      ownerId: owner.id,
      businessName: owner.businessName,
      approvalStatus: 'Approved',
      turfIds: owner.turfIds,
    };
    setUserProfile(profile);
    setOwnerActiveTurfId(owner.turfIds[0]);
    setView('owner_dashboard');
    showToast(`Viewing as ${owner.businessName || owner.name}`, 'info', 'Impersonation mode');
  };

  const exitImpersonation = () => {
    if (!impersonatingOwner?.savedProfile) return;
    setUserProfile(impersonatingOwner.savedProfile);
    setView(impersonatingOwner.savedView || 'super_admin');
    setImpersonatingOwner(null);
    showToast('Returned to Super Admin', 'success');
  };

  const getSplitInviteLink = (annId) => {
    const base = env.appUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://app.turfmate.in');
    return `${base.replace(/\/$/, '')}#join/${annId}`;
  };

  const submitOwnerApplication = async () => {
    const payload = {
      businessName: onboardingData.businessName,
      ownerName: onboardingData.ownerName || onboardingData.accountHolder,
      businessEmail: onboardingData.businessEmail,
      phoneNumber: onboardingData.phoneNumber || userProfile.phone,
      pan: onboardingData.pan,
      gstin: onboardingData.gstin,
      bankAccount: onboardingData.bankAccount,
      ifsc: onboardingData.ifsc,
      accountHolder: onboardingData.accountHolder,
      kycDoc: onboardingData.kycDoc,
      pinnedLocation: onboardingData.pinnedLocation,
    };

    try {
      const { owner, turf, profile } = await ownersApi.submitApplication(payload);
      const template = MOCK_TURFS[0];
      const newTurf = {
        ...template,
        id: turf.id,
        ownerId: owner.id,
        name: turf.name || onboardingData.businessName || 'New Partner Turf',
        location: onboardingData.pinnedLocation?.address || 'Virar West, Mumbai',
        lat: turf.lat || onboardingData.pinnedLocation?.lat || 19.456,
        lng: turf.lng || onboardingData.pinnedLocation?.lng || 72.812,
        status: 'pending_review',
        slots: template.slots.map((s) => ({ ...s, status: 'available' })),
      };
      setOwners((prev) => {
        const without = prev.filter((o) => o.id !== owner.id);
        return [...without, owner];
      });
      setTurfs((prev) => {
        const without = prev.filter((t) => t.id !== newTurf.id);
        return [...without, newTurf];
      });
      setUserProfile(profile);
      localStorage.setItem('tm_profile', JSON.stringify(profile));
      localStorage.removeItem('tm_onboarding_progress');
      triggerConfetti();
      navigateTo('owner_pending');
      return;
    } catch (err) {
      console.warn('[owners] submit application failed, using local fallback:', err.message);
    }

    const ownerId = userProfile.userId || `owner-${Date.now()}`;
    const turfId = `turf-${Date.now()}`;
    const template = MOCK_TURFS[0];
    const newTurf = {
      ...template,
      id: turfId,
      ownerId,
      name: onboardingData.businessName || 'New Partner Turf',
      location: onboardingData.pinnedLocation?.address || 'Virar West, Mumbai',
      lat: onboardingData.pinnedLocation?.lat || 19.456,
      lng: onboardingData.pinnedLocation?.lng || 72.812,
      status: 'pending_review',
      image: template.image,
      slots: template.slots.map((s) => ({ ...s, status: 'available' })),
    };
    const newOwner = {
      id: ownerId,
      name: onboardingData.ownerName || onboardingData.accountHolder,
      businessName: onboardingData.businessName,
      phone: onboardingData.phoneNumber,
      email: onboardingData.businessEmail,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${ownerId}`,
      turfIds: [turfId],
      approvalStatus: 'Pending_Approval',
      bankAccount: onboardingData.bankAccount,
      ifsc: onboardingData.ifsc,
      joinedAt: new Date().toISOString().slice(0, 10),
      gstin: onboardingData.gstin,
      pan: onboardingData.pan,
    };
    setOwners((prev) => [...prev, newOwner]);
    setTurfs((prev) => [...prev, newTurf]);
    const finalProfile = {
      isLoggedIn: true,
      role: 'OWNER',
      userId: userProfile.userId,
      phone: onboardingData.phoneNumber || userProfile.phone,
      ownerId,
      businessName: onboardingData.businessName,
      ownerName: onboardingData.ownerName,
      businessEmail: onboardingData.businessEmail,
      location: onboardingData.pinnedLocation?.address,
      gstin: onboardingData.gstin,
      pan: onboardingData.pan,
      bankAccount: onboardingData.bankAccount,
      ifsc: onboardingData.ifsc,
      accountHolder: onboardingData.accountHolder,
      approvalStatus: 'Pending_Approval',
      turfIds: [turfId],
    };
    setUserProfile(finalProfile);
    localStorage.setItem('tm_profile', JSON.stringify(finalProfile));
    localStorage.removeItem('tm_onboarding_progress');
    triggerConfetti();
    navigateTo('owner_pending');
  };

  const addOwnerTurf = (name) => {
    const ownerId = getCurrentOwnerId();
    if (!ownerId) return;
    const turfId = `turf-${Date.now()}`;
    const template = MOCK_TURFS[1];
    const newTurf = {
      ...template,
      id: turfId,
      ownerId,
      name: name || `New Venue ${getOwnerTurfs(ownerId).length + 1}`,
      status: 'active',
      slots: template.slots.map(s => ({ ...s, status: 'available' })),
    };
    setTurfs(prev => [...prev, newTurf]);
    setOwners(prev => prev.map(o =>
      o.id === ownerId ? { ...o, turfIds: [...o.turfIds, turfId] } : o
    ));
    setOwnerActiveTurfId(turfId);
    return newTurf;
  };

  const navigateTo = (nextView) => {
    setView(nextView);
    setOnboardingData(prev => {
      const next = { ...prev, view: nextView };
      localStorage.setItem('tm_onboarding_progress', JSON.stringify(next));
      return next;
    });
  };

  const updateOnboardingData = (fields) => {
    setOnboardingData(prev => {
      const next = { ...prev, ...fields };
      localStorage.setItem('tm_onboarding_progress', JSON.stringify(next));
      return next;
    });
  };

  const handleSendOTP = async (viaWhatsApp = false) => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    updateOnboardingData({ phoneNumber: phoneNumber });
    setOtpSent(true);
    setLoginTimer(30);

    try {
      await authApi.sendOtp(phoneNumber);
    } catch (err) {
      console.warn('[auth] send-otp failed, demo fallback available:', err.message);
    }

    if (viaWhatsApp) {
      setWhatsappNotification("TurfMate OTP: 1234 is your verification code.");
      setTimeout(() => setWhatsappNotification(null), 6000);
    }
    navigateTo('otp_verify');
  };

  const routeAfterAuth = (profile) => {
    setUserProfile(profile);
    localStorage.setItem('tm_profile', JSON.stringify(profile));
    localStorage.removeItem('tm_onboarding_progress');
    setIsAdminMode(false);
    if (profile.role === 'OWNER') {
      const pending = profile.approvalStatus === 'Pending_Approval' || profile.approvalStatus === 'Rejected';
      if (pending) {
        setView('owner_pending');
      } else {
        setOwnerActiveTurfId(profile.turfIds?.[0] || 'turf-1');
        setView('owner_dashboard');
      }
    } else if (profile.role === 'SUPER_ADMIN') {
      setView('super_admin');
    } else if (profile.onboardingComplete === false) {
      navigateTo('role_selection');
    } else {
      setView('home');
    }
  };

  const handleVerifyOTP = async () => {
    if (!(otpCode === '1234' || otpCode.length === 4)) {
      showToast('Enter the 4-digit OTP (demo: 1234)', 'error', 'Invalid OTP');
      return;
    }

    try {
      const { profile } = await authApi.verifyOtp(phoneNumber, otpCode);
      routeAfterAuth(profile);
      return;
    } catch (err) {
      console.warn('[auth] verify-otp failed, trying local demo fallback:', err.message);
    }

    if (env.demoMode && phoneNumber === '9876543210') {
        const profile = {
          isLoggedIn: true,
          role: 'PLAYER',
          name: 'Rahul Mehta',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
          favoriteSports: ['football', 'cricket'],
          position: 'Midfielder',
          skillLevel: 'Intermediate',
          location: 'Virar',
          radius: 10,
          lat: 19.456,
          lng: 72.812,
          phone: '9876543210',
          username: '@rahul_cricket'
        };
        setUserProfile(profile);
        localStorage.setItem('tm_profile', JSON.stringify(profile));
        localStorage.removeItem('tm_onboarding_progress');
        setIsAdminMode(false);
        setView('home');
      } else if (env.demoMode && phoneNumber === '1111111111') {
        const profile = {
          isLoggedIn: true,
          role: 'OWNER',
          ownerId: 'owner-1',
          name: 'Manager Singh',
          businessName: 'Green Valley Sports Group',
          avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Admin',
          phone: '1111111111',
          approvalStatus: 'Approved',
          turfIds: ['turf-1', 'turf-2'],
        };
        setUserProfile(profile);
        localStorage.setItem('tm_profile', JSON.stringify(profile));
        localStorage.removeItem('tm_onboarding_progress');
        setIsAdminMode(false);
        setOwnerActiveTurfId('turf-1');
        setView('owner_dashboard');
      } else if (env.demoMode && phoneNumber === SUPER_ADMIN_PHONE) {
        const profile = {
          isLoggedIn: true,
          role: 'SUPER_ADMIN',
          name: 'Platform Admin',
          avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=SuperAdmin',
          phone: SUPER_ADMIN_PHONE,
        };
        setUserProfile(profile);
        localStorage.setItem('tm_profile', JSON.stringify(profile));
        localStorage.removeItem('tm_onboarding_progress');
        setIsAdminMode(false);
        setView('super_admin');
      } else {
        navigateTo('role_selection');
      }
  };

  const handleUsernameChange = (val) => {
    let cleaned = val.toLowerCase();
    let hasAt = cleaned.startsWith('@');
    let usernamePart = hasAt ? cleaned.slice(1) : cleaned;
    // Swap spaces with underscores, then strip invalid characters (keep a-z, 0-9, and _)
    usernamePart = usernamePart.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    cleaned = '@' + usernamePart;
    updateOnboardingData({ username: cleaned });
    
    if (!cleaned || cleaned === '@') {
      setUsernameError('Username is required');
      setUsernameSuggestions([]);
      return;
    }
    
    const taken = ['@virar_striker', '@rahul_cricket'];
    if (taken.includes(cleaned.toLowerCase())) {
      setUsernameError(`Username ${cleaned} is already taken!`);
      const base = cleaned.replace('@', '');
      setUsernameSuggestions([
        `@${base}_99`,
        `@${base}_pro`,
        `@${base}_play`
      ]);
    } else {
      setUsernameError('');
      setUsernameSuggestions([]);
    }
  };

  const selectSuggestion = (sug) => {
    updateOnboardingData({ username: sug });
    setUsernameError('');
    setUsernameSuggestions([]);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!onboardingData.name.trim()) return;
    if (usernameError || !onboardingData.username.trim()) {
      handleUsernameChange(onboardingData.username || '');
      return;
    }
    navigateTo('sports_dna');
  };

  const triggerConfetti = () => {
    const colors = ['#4ADE80', '#2D6A4F', '#1B4332', '#F8FAFC', '#FACC15', '#EF4444', '#3B82F6'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      delay: Math.random() * 0.5,
      duration: Math.random() * 1.5 + 1.5
    }));
    setConfettiParticles(particles);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 2800);
  };

  const completePlayerOnboarding = (locationInfo) => {
    updateOnboardingData({ location: locationInfo });

    const finalProfile = {
      isLoggedIn: true,
      role: 'PLAYER',
      name: onboardingData.name,
      avatar: onboardingData.avatar,
      favoriteSports: onboardingData.favoriteSports.length > 0 ? onboardingData.favoriteSports : ['football'],
      position: onboardingData.sportsDNA[onboardingData.favoriteSports[0] || 'football']?.position || 'Midfielder',
      skillLevel: onboardingData.sportsDNA[onboardingData.favoriteSports[0] || 'football']?.skillLevel || 'Intermediate',
      location: locationInfo.name,
      radius: 10,
      lat: locationInfo.lat,
      lng: locationInfo.lng,
      phone: onboardingData.phoneNumber,
      username: onboardingData.username,
      sportsDNA: onboardingData.sportsDNA,
    };

    setUserProfile(finalProfile);
    localStorage.setItem('tm_profile', JSON.stringify(finalProfile));
    setFilterRadiusState(10);
    localStorage.removeItem('tm_onboarding_progress');

    triggerConfetti();
    setTimeout(() => {
      setIsAdminMode(false);
      setView('home');
    }, 2500);
  };

  const detectAndSetLocation = async ({ finishOnboarding = false } = {}) => {
    setIsLocating(true);
    try {
      const loc = await detectUserLocation();
      if (finishOnboarding) {
        completePlayerOnboarding(loc);
      } else {
        setUserProfile((prev) => {
          const next = {
            ...prev,
            location: loc.name,
            lat: loc.lat,
            lng: loc.lng,
          };
          localStorage.setItem('tm_profile', JSON.stringify(next));
          return next;
        });
      }
      const accuracyNote = loc.accuracyMeters ? ` · ~${loc.accuracyMeters}m accuracy` : '';
      showToast(`${loc.name}${accuracyNote}`, 'success');
      return loc;
    } catch {
      if (finishOnboarding) {
        showToast('GPS unavailable — using Virar West', 'info');
        completePlayerOnboarding(DEFAULT_FALLBACK);
        return DEFAULT_FALLBACK;
      }
      showToast('Allow location access in browser settings', 'error');
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  const grantLocation = (granted) => {
    if (!granted) {
      navigateTo('location_manual');
      return;
    }
    detectAndSetLocation({ finishOnboarding: true });
  };

  const refreshUserLocation = () => detectAndSetLocation({ finishOnboarding: false });

  const selectManualLocation = (cityInfo) => {
    updateOnboardingData({ location: cityInfo });
    
    const finalProfile = {
      isLoggedIn: true,
      role: 'PLAYER',
      name: onboardingData.name,
      avatar: onboardingData.avatar,
      favoriteSports: onboardingData.favoriteSports.length > 0 ? onboardingData.favoriteSports : ['football'],
      position: onboardingData.sportsDNA[onboardingData.favoriteSports[0] || 'football']?.position || 'Midfielder',
      skillLevel: onboardingData.sportsDNA[onboardingData.favoriteSports[0] || 'football']?.skillLevel || 'Intermediate',
      location: cityInfo.name,
      radius: 10,
      lat: cityInfo.lat,
      lng: cityInfo.lng,
      phone: onboardingData.phoneNumber,
      username: onboardingData.username,
      sportsDNA: onboardingData.sportsDNA
    };
    
    setUserProfile(finalProfile);
    localStorage.setItem('tm_profile', JSON.stringify(finalProfile));
    setFilterRadiusState(10);
    localStorage.removeItem('tm_onboarding_progress');
    
    triggerConfetti();
    setTimeout(() => {
      setIsAdminMode(false);
      setView('home');
    }, 2500);
  };

  const updatePlayerLocation = (cityInfo) => {
    setUserProfile((prev) => {
      const next = {
        ...prev,
        location: cityInfo.name,
        lat: cityInfo.lat,
        lng: cityInfo.lng,
      };
      localStorage.setItem('tm_profile', JSON.stringify(next));
      return next;
    });
    showToast(`Playing near ${cityInfo.name}`, 'success');
  };

  const updateUserAvatar = (avatarUrl) => {
    setUserProfile((prev) => {
      const next = { ...prev, avatar: avatarUrl };
      localStorage.setItem('tm_profile', JSON.stringify(next));
      return next;
    });
    setOnboardingData((prev) => {
      const next = { ...prev, avatar: avatarUrl };
      localStorage.setItem('tm_onboarding_progress', JSON.stringify(next));
      return next;
    });
  };

  const createLockerPost = async (category, text, extra = {}) => {
    const isHighlight = category === 'HIGHLIGHT' || extra.isHighlight;
    const payloadExtra = {
      ...extra,
      isHighlight,
      sport: extra.sport || 'general',
      turfId: extra.turfId || 'turf-1',
      turfName: extra.turfName || userProfile.location || 'Nearby',
    };

    if (getToken() && userProfile.userId) {
      try {
        const { post } = await lockerApi.createPost({
          contentType: category,
          contentText: text,
          extra: payloadExtra,
          lat: userProfile.lat,
          lng: userProfile.lng,
        });
        setAnnouncements((prev) => [mapLockerPost(post), ...prev]);
        showToast('Posted to Locker Room', 'success');
        return;
      } catch (err) {
        console.warn('[locker] create post failed:', err.message);
        if (err.status === 429) {
          showToast(err.message, 'error', 'Rate limit');
          return;
        }
      }
    }

    const newPost = {
      id: `ann-post-${Date.now()}`,
      hostId: 'me',
      hostName: userProfile.name,
      hostAvatar: userProfile.avatar,
      hostLevel: userProfile.skillLevel || 'Intermediate',
      sport: extra.sport || 'general',
      sportLabel: isHighlight ? 'Match Highlight' : category,
      sportIcon: isHighlight ? '📸' : category === 'LFG' ? '👋' : category.includes('GEAR') ? '🎒' : '💬',
      turfId: extra.turfId || 'turf-1',
      turfName: extra.turfName || userProfile.location || 'Nearby',
      distance: '0.5 km',
      time: 'Just now',
      costPerHead: 0,
      playersNeeded: 0,
      totalSpots: 0,
      roster: extra.roster || [],
      status: category === 'LFG' ? 'lfg' : 'open',
      text,
      isHighlight,
      highlightScore: extra.highlightScore || null,
      turfImage: extra.turfImage || turfs.find((t) => t.id === 'turf-1')?.image,
    };
    setAnnouncements((prev) => [newPost, ...prev]);
    showToast('Posted to Locker Room', 'success');
  };

  // Open Checkout (Triggers Lock)
  const openCheckoutModal = async () => {
    if (!userProfile.userId) {
      showToast('Please log in again to book', 'error', 'Session required');
      return;
    }
    try {
      const res = await bookingApi.lockSlot(activeTurf.id, selectedSlotId, bookingDate);
      setCheckoutSlotLockExpiresAt(res.lockedUntil || Date.now() + 5 * 60 * 1000);
      setShowCheckoutModal(true);
    } catch (error) {
      console.error('Lock Error:', error);
      showToast(error.message, 'error', 'Could not lock slot');
    }
  };

  // Perform Booking Payment
  const fulfillViaPayments = async (orderBody) => {
    const order = await paymentsApi.createOrder(orderBody);
    if (order.demo) {
      return paymentsApi.verify({ orderId: order.orderId, demo: true });
    }
    if (order.keyId || env.razorpayKey) {
      return new Promise((resolve, reject) => {
        openRazorpayCheckout({
          order,
          userProfile,
          onSuccess: async (payment) => {
            try {
              resolve(await paymentsApi.verify(payment));
            } catch (err) {
              reject(err);
            }
          },
          onFailure: reject,
        });
      });
    }
    return null;
  };

  const processBookingPayment = async () => {
    setIsProcessingPayment(true);
    
    const slot = activeTurf.slots.find(s => s.id === selectedSlotId);
    const price = slot.surgePrice || activeTurf.pricePerHour;
    const taxes = Math.floor(price * 0.18);
    const totalPayable = price + 20 + taxes;
    const perHeadShare = Math.ceil(totalPayable / splitPlayersCount);
    
    try {
      let bId = '';
      let apiSplit = null;

      if (checkoutOption === 'split') {
        const splitPayload = {
          purpose: 'SPLIT_HOST',
          amount: perHeadShare,
          turfId: activeTurf.id,
          slotId: selectedSlotId,
          date: bookingDate,
          slotTime: slot.time,
          totalAmount: price,
          hostAdvance: perHeadShare,
          playersNeeded: splitPlayersCount - 1,
          isPublic: !checkoutInviteGroupId,
          sport: selectedSportFilter !== 'all' ? selectedSportFilter : activeTurf.sports[0],
          inviteSquadId: checkoutInviteGroupId && !String(checkoutInviteGroupId).startsWith('grp-')
            ? checkoutInviteGroupId
            : undefined,
        };
        let res = await fulfillViaPayments(splitPayload);
        if (!res) {
          res = await bookingApi.initiateSplit({
            turfId: activeTurf.id,
            slotId: selectedSlotId,
            date: bookingDate,
            slotTime: slot.time,
            totalAmount: price,
            hostAdvance: perHeadShare,
            playersNeeded: splitPlayersCount - 1,
            isPublic: !checkoutInviteGroupId,
            sport: splitPayload.sport,
            inviteSquadId: splitPayload.inviteSquadId,
          });
        }
        bId = res.bookingId;
        apiSplit = res.split;
      } else {
        let res = await fulfillViaPayments({
          purpose: 'BOOKING_PRIVATE',
          amount: price,
          turfId: activeTurf.id,
          slotId: selectedSlotId,
          date: bookingDate,
          slotTime: slot.time,
        });
        if (!res) {
          res = await bookingApi.checkout({
            turfId: activeTurf.id,
            slotId: selectedSlotId,
            date: bookingDate,
            slotTime: slot.time,
            amount: price,
          });
        }
        bId = res.bookingId;
      }

      setIsProcessingPayment(false);
      setShowCheckoutModal(false);
      setCheckoutSlotLockExpiresAt(null);

      let newBooking = enrichBookingPayment({
        id: bId,
        turfId: activeTurf.id,
        turfName: activeTurf.name,
        slotTime: slot.time,
        date: bookingDate,
        type: checkoutOption,
        paidAmount: checkoutOption === 'split' ? perHeadShare : price,
        totalAmount: price,
        status: checkoutOption === 'split' ? 'Confirmed (Split Active)' : 'Confirmed',
        qrCode: `TMT-${checkoutOption.toUpperCase()}-${bId}-${activeTurf.name.slice(0,3).toUpperCase()}`,
        roster: [userProfile.name],
        source: 'app',
      }, activeTurf, checkoutOption === 'split' ? perHeadShare : price, price);

      setBookings(prev => [newBooking, ...prev]);

      if (checkoutOption !== 'split') {
        setTurfs((prev) => prev.map((t) => (
          t.id !== activeTurf.id ? t : {
            ...t,
            slots: t.slots.map((s) => (
              s.id === selectedSlotId ? { ...s, status: 'booked' } : s
            )),
          }
        )));
      }

      const chatId = `chat-booking-${bId}`;
      newBooking.chatId = chatId;

      // If split option selected, auto-create game announcement in Locker Room
      if (checkoutOption === 'split') {
        const newAnn = apiSplit || {
          id: `ann-${bId}`,
          bookingId: bId,
          hostId: userProfile.userId || 'user-id',
          hostName: userProfile.name,
          hostAvatar: userProfile.avatar,
          hostLevel: userProfile.skillLevel,
          sport: selectedSportFilter !== 'all' ? selectedSportFilter : activeTurf.sports[0],
          sportIcon: SPORTS.find(s => s.id === activeTurf.sports[0])?.icon || '⚽',
          sportLabel: `${splitPlayersCount} Players Squad`,
          turfId: activeTurf.id,
          turfName: activeTurf.name,
          time: `${bookingDate}, ${slot.time.split(' - ')[0]}`,
          distance: activeTurf.distance,
          costPerHead: perHeadShare,
          playersNeeded: splitPlayersCount - 1,
          totalSpots: splitPlayersCount,
          roster: [userProfile.name],
          status: 'open',
          slotId: selectedSlotId,
          fundingExpiresAt: Date.now() + 4 * 3600 * 1000,
        };
        setAnnouncements(prev => [newAnn, ...prev.filter((a) => a.id !== newAnn.id)]);
        newBooking.annId = newAnn.id;
        if (checkoutInviteGroupId) {
          const group = squadGroups.find((g) => g.id === checkoutInviteGroupId);
          if (group) {
            if (splitPayload.inviteSquadId) {
              showToast(`Invite sent to "${group.name}" via push + inbox`, 'success');
            } else {
              const link = getSplitInviteLink(newAnn.id);
              group.members.forEach(() => {
                setNotifications((prev) => [
                  {
                    id: Date.now() + Math.random(),
                    text: `${userProfile.name} invited ${group.name} to split @ ${activeTurf.name}. Pay ₹${perHeadShare}: ${link}`,
                    time: 'Just now',
                    read: false,
                  },
                  ...prev,
                ]);
              });
              showToast(`Invite sent to ${group.members.length} players in "${group.name}"`, 'success');
            }
          }
          setCheckoutInviteGroupId('');
        }
      }

      if (getToken()) {
        await refreshChats();
      } else {
        setChats((prev) => [{
          id: chatId,
          name: checkoutOption === 'split' ? `⚽ Split Game @ ${activeTurf.name}` : `Game @ ${activeTurf.name}`,
          type: 'game',
          unread: 0,
          meta: { turfId: activeTurf.id, bookingId: bId, annId: newBooking.annId },
          messages: [
            {
              sender: 'System',
              text: checkoutOption === 'split'
                ? `Welcome to the chatroom for your game at ${activeTurf.name}! Splitting the cost.`
                : `Private booking confirmed for ${slot.time}. Coordinate with your squad here.`,
              time: 'Just now',
            },
          ],
        }, ...prev.filter((c) => c.id !== chatId)]);
      }

      setBookingSuccessData(newBooking);
      setSelectedSlotId(null);
      showToast('Payment done — your slot is booked!', 'success', 'Booking confirmed');
      refreshMyBookings();
      refreshLockerFeed();
    } catch (error) {
      console.error('Payment Error:', error);
      showToast(error.message, 'error', 'Booking failed');
      setIsProcessingPayment(false);
    }
  };

  const failSplitFunding = (annId) => {
    const ann = announcements.find((a) => a.id === annId);
    if (!ann || ann.status === 'failed' || ann.status === 'filled') return;

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === annId ? { ...a, status: 'failed', playersNeeded: 0 } : a))
    );
    setBookings((prev) =>
      prev.map((b) =>
        b.id === ann.bookingId
          ? { ...b, status: 'Refunded (Split Failed)', paidAmount: 0, commissionAmount: 0, ownerPayout: 0 }
          : b
      )
    );
    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Game canceled at ${ann.turfName}. ₹${ann.costPerHead} refunded to your source account.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
    showToast('Split expired — all players refunded', 'info', 'Funding failed');
  };

  const cancelSplitGame = async (annId) => {
    const ann = announcements.find((a) => a.id === annId);
    if (!ann || (ann.hostId !== userProfile.userId && ann.hostName !== userProfile.name)) return;

    if (ann.bookingId && !String(ann.bookingId).startsWith('B-')) {
      try {
        const { split } = await bookingApi.cancelSplit(ann.bookingId);
        setAnnouncements((prev) => prev.map((a) => (a.id === annId ? split : a)));
      } catch (err) {
        showToast(err.message, 'error', 'Cancel failed');
        return;
      }
    } else {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === annId ? { ...a, status: 'canceled', playersNeeded: 0 } : a))
      );
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === ann.bookingId
          ? { ...b, status: 'Refunded (Host Canceled)', paidAmount: 0, commissionAmount: 0, ownerPayout: 0 }
          : b
      )
    );
    (ann.roster || []).forEach(() => {
      setNotifications((prev) => [
        {
          id: Date.now() + Math.random(),
          text: `${userProfile.name} canceled the split at ${ann.turfName}. Refund processing.`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    });
    showToast('Split canceled — refunds issued to all players', 'success');
    refreshLockerFeed();
  };

  const executeJoinSplit = async (annId) => {
    const ann = announcements.find((a) => a.id === annId);
    if (!ann || ann.status !== 'open' || ann.playersNeeded <= 0) return { filled: false };
    if (ann.roster?.includes(userProfile.name)) return { filled: ann.playersNeeded === 0 };

    setIsProcessingPayment(true);
    try {
      let apiResult = null;
      if (ann.bookingId && !String(ann.bookingId).startsWith('B-')) {
        let res = await fulfillViaPayments({
          purpose: 'SPLIT_JOIN',
          amount: ann.costPerHead,
          bookingId: ann.bookingId,
        });
        if (!res) {
          res = await bookingApi.joinSplit(ann.bookingId, ann.costPerHead);
        }
        apiResult = res;
      }

      let filled = false;
      const updatedAnn = apiResult?.split;
      setAnnouncements((prev) =>
        prev.map((a) => {
          if (a.id !== annId) return a;
          if (updatedAnn) {
            filled = updatedAnn.status === 'filled';
            return updatedAnn;
          }
          const updatedNeeded = Math.max(0, a.playersNeeded - 1);
          filled = updatedNeeded === 0;
          return {
            ...a,
            playersNeeded: updatedNeeded,
            roster: [...(a.roster || []), userProfile.name],
            status: filled ? 'filled' : 'open',
          };
        })
      );

      const chatId = ann.bookingId && !String(ann.bookingId).startsWith('B-')
        ? `chat-booking-${ann.bookingId}`
        : `chat-ann-${annId}`;
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            meta: { ...c.meta, roster: [...(c.meta?.roster || ann.roster || []), userProfile.name] },
            messages: [
              ...c.messages,
              { sender: 'System', text: `${userProfile.name} has joined the squad! Split share paid.`, time: 'Just now' },
            ],
          };
        })
      );

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== ann.bookingId && !(b.turfId === ann.turfId && b.slotTime?.includes(ann.time?.split(', ')[1]))) {
            return b;
          }
          const newPaid = (b.paidAmount || 0) + ann.costPerHead;
          const commissionAmount = calcCommission(newPaid);
          return {
            ...b,
            paidAmount: newPaid,
            commissionAmount,
            ownerPayout: newPaid - commissionAmount,
            roster: [...(b.roster || []), userProfile.name],
            status: filled ? 'Confirmed' : b.status,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: Date.now(),
          text: `Joined ${ann.hostName}'s squad @ ${ann.turfName}. Check the Game Chat!`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);

      showToast(`UPI payment of ₹${ann.costPerHead} completed`, 'success', 'Joined the squad!');
      setIsProcessingPayment(false);
      refreshLockerFeed();
      if (getToken()) refreshChats();
      return { filled, chatId };
    } catch (error) {
      console.error('Join Split Error:', error);
      showToast(error.message, 'error', 'Join failed');
      setIsProcessingPayment(false);
      return { filled: false };
    }
  };

  const openJoinSplitReview = (annId) => {
    const ann = announcements.find((a) => a.id === annId);
    if (!ann || ann.status !== 'open' || ann.playersNeeded <= 0) {
      showToast('This split is no longer available', 'error');
      return;
    }
    if (ann.roster?.includes(userProfile.name)) {
      showToast('You are already on this roster', 'info');
      setView('split_hub');
      return;
    }
    setPendingJoinSplitId(annId);
  };

  const closeJoinSplitReview = () => setPendingJoinSplitId(null);

  const confirmJoinSplit = async () => {
    if (!pendingJoinSplitId) return;
    const annId = pendingJoinSplitId;
    setPendingJoinSplitId(null);
    const { filled, chatId } = await executeJoinSplit(annId);
    if (filled) {
      setSplitSuccessAnnId(annId);
      setShowSplitSuccessModal(true);
      triggerConfetti();
    } else {
      setView('split_hub');
      if (chatId) setActiveChatId(chatId);
    }
  };

  const joinSplitGame = (annId) => openJoinSplitReview(annId);

  const sendFriendRequest = async (player) => {
    const username = player.username || player.full_name;
    if (!username) return;
    const key = username.replace(/^@/, '');
    if (sentFriendRequests.includes(key) || sentFriendRequests.includes(`@${key}`)) {
      showToast('Request already sent', 'info');
      return;
    }

    if (getToken()) {
      try {
        await socialApi.sendFriendRequest({
          toUserId: player.userId || player.id,
          toUsername: username,
          message: `Wants to connect on TurfMate`,
        });
        setSentFriendRequests((prev) => [...prev, key]);
        showToast(`Friend request sent to @${key}`, 'success', 'Request sent');
        return;
      } catch (err) {
        if (err.status === 409) {
          showToast('Request already sent', 'info');
          return;
        }
        console.warn('[social] send request failed:', err.message);
      }
    }

    setSentFriendRequests((prev) => [...prev, key]);
    showToast(`Friend request sent to @${key}`, 'success', 'Request sent');
  };

  const openDmWithUser = ({ name, avatar }) => {
    const existing = chats.find((c) => c.type === 'dm' && c.name === name);
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const chatId = `chat-dm-${Date.now()}`;
      setChats((prev) => [
        {
          id: chatId,
          name,
          type: 'dm',
          avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          unread: 0,
          meta: { online: true },
          messages: [
            {
              sender: 'System',
              text: `Direct message with ${name}. Discuss game details here.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'SYSTEM_ALERT',
            },
          ],
        },
        ...prev,
      ]);
      setActiveChatId(chatId);
    }
    setView('chat');
  };

  const createSquadGroup = async (name, memberNames) => {
    if (getToken()) {
      try {
        const { squad } = await socialApi.createSquad({ name, members: memberNames });
        setSquadGroups((prev) => [squad, ...prev]);
        showToast(`Group "${name}" saved for 1-tap invites`, 'success');
        return;
      } catch (err) {
        console.warn('[social] create squad failed:', err.message);
      }
    }
    const group = { id: `grp-${Date.now()}`, name, members: memberNames, createdAt: Date.now() };
    setSquadGroups((prev) => [group, ...prev]);
    showToast(`Group "${name}" saved for 1-tap invites`, 'success');
  };

  const inviteSquadGroupToSplit = async (groupId, annId) => {
    const group = squadGroups.find((g) => g.id === groupId);
    const ann = announcements.find((a) => a.id === annId);
    if (!group || !ann) return;

    if (getToken() && ann.bookingId && !String(groupId).startsWith('grp-')) {
      try {
        const res = await bookingApi.inviteSquadToSplit(ann.bookingId, groupId);
        showToast(`Invite sent to ${res.sent || group.members.length} players in "${group.name}"`, 'success');
        return;
      } catch (err) {
        console.warn('[split] squad invite failed:', err.message);
      }
    }

    const link = getSplitInviteLink(annId);
    group.members.forEach(() => {
      setNotifications((prev) => [
        {
          id: Date.now() + Math.random(),
          text: `${userProfile.name} invited ${group.name} to split @ ${ann.turfName}. Pay ₹${ann.costPerHead}: ${link}`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    });
    showToast(`Invite sent to ${group.members.length} players in "${group.name}"`, 'success');
  };

  // Auto-fail unfunded splits when funding window expires
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      announcements.forEach((ann) => {
        if (ann.status !== 'open' || !ann.fundingExpiresAt || ann.fundingExpiresAt > now) return;
        if ((ann.playersNeeded || 0) <= 0) return;
        failSplitFunding(ann.id);
      });
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [announcements]); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptFriendRequest = async (requestId) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (getToken() && !String(requestId).startsWith('req-')) {
      try {
        await socialApi.acceptFriendRequest(requestId);
      } catch (err) {
        console.warn('[social] accept failed:', err.message);
      }
    }

    const chatId = `chat-dm-${Date.now()}`;
    setChats((prev) => {
      if (prev.some((c) => c.type === 'dm' && c.name === req.name)) return prev;
      return [
        {
          id: chatId,
          name: req.name,
          type: 'dm',
          avatar: req.avatar,
          unread: 0,
          meta: { online: true, lastSeen: 'Active now' },
          messages: [
            {
              sender: 'System',
              text: `You and ${req.name} are now connected. Say hi!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateLabel: 'Today',
              type: 'SYSTEM_ALERT',
            },
          ],
        },
        ...prev,
      ];
    });
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    setActiveChatId(chatId);
    showToast(`Connected with ${req.name.split(' ')[0]}`, 'success');
  };

  const declineFriendRequest = async (requestId) => {
    if (getToken() && !String(requestId).startsWith('req-')) {
      try {
        await socialApi.declineFriendRequest(requestId);
      } catch (err) {
        console.warn('[social] decline failed:', err.message);
      }
    }
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast('Request declined', 'info');
  };

  // Send Message in Chat (Supports Socket or Offline Fallback)
  const sendMessage = (roomId, text, type = 'TEXT') => {
    const isSocketConnected = socketService.socket && socketService.socket.connected;

    if (isSocketConnected) {
      socketService.sendMessage(roomId, userProfile.name || 'You', text, type);
    } else {
      // Fallback/Mock behavior
      const newMsg = {
        id: `msg-fallback-${Date.now()}`,
        sender: 'You',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: 'Today',
        type,
      };

      setChats(prev => prev.map(c => {
        if (c.id === roomId) {
          return {
            ...c,
            unread: 0,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      }));

      // Simulate Quick Reply for mock behavior
      setTimeout(() => {
        let replier = 'Player';
        let replyText = 'Awesome! Count me in.';

        if (roomId.startsWith('chat-ann-')) {
          replier = 'Joshua';
          replyText = 'Sweet! I will bring the pump just in case.';
        } else if (roomId === 'chat-lobby-football') {
          replier = 'Aniket Sawant';
          replyText = 'Is the slot booked? I can play keeper if needed.';
        } else if (roomId === 'chat-friend-1') {
          replier = 'Rahul Mehta';
          replyText = 'Perfect. Let me know when you reach.';
        } else if (roomId === 'chat-friend-2') {
          replier = 'Sneha Rao';
          replyText = 'Sounds good — ping me when you reach the turf.';
        } else if (roomId === 'chat-lobby-cricket') {
          replier = 'Vikram Singh';
          replyText = 'Thanks! I will check that store tomorrow.';
        } else if (roomId.startsWith('chat-dm-')) {
          setChats((prev) => {
            const chat = prev.find((c) => c.id === roomId);
            const replierName = chat?.name || 'Friend';
            const replyMsg = {
              id: `msg-fallback-reply-${Date.now()}`,
              sender: replierName,
              text: 'Got it! See you on the pitch.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateLabel: 'Today',
              type: 'TEXT',
            };
            return prev.map((c) =>
              c.id === roomId
                ? {
                    ...c,
                    unread: activeChatIdRef.current === roomId ? 0 : (c.unread || 0) + 1,
                    messages: [...c.messages, replyMsg],
                  }
                : c
            );
          });
          return;
        } else {
          return;
        }

        const replyMsg = {
          id: `msg-fallback-reply-${Date.now()}`,
          sender: replier,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateLabel: 'Today',
          type: 'TEXT',
        };

        setChats(prev => prev.map(c => {
          if (c.id === roomId) {
            return {
              ...c,
              unread: activeChatIdRef.current === roomId ? 0 : (c.unread || 0) + 1,
              messages: [...c.messages, replyMsg]
            };
          }
          return c;
        }));
      }, 2000);
    }
  };

  // Admin: Create Community Announcement
  const createAdminAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    const targetTurf = turfs.find(t => t.id === newAnnouncementTurf);

    const newAnn = {
      id: `ann-admin-${Date.now()}`,
      hostId: 'owner-1',
      hostName: `${targetTurf?.name || 'Turf'} Management`,
      hostAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Admin',
      hostLevel: 'Official',
      sport: newAnnouncementSport,
      sportIcon: SPORTS.find(s => s.id === newAnnouncementSport)?.icon || '🏆',
      sportLabel: `Special Event`,
      turfId: newAnnouncementTurf,
      turfName: targetTurf?.name || 'Turf Arena',
      time: 'This Sunday, 10:00 AM',
      distance: targetTurf?.distance || '1.0 km',
      costPerHead: 150,
      playersNeeded: 20,
      totalSpots: 50,
      roster: [],
      status: 'open',
      isAdminAnnouncement: true,
      text: newAnnouncementText
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    setNewAnnouncementText('');
    showToast('Community announcement posted', 'success');
  };

  // Admin Slot Actions
  const toggleAdminSlot = (turfId, slotId) => {
    setAdminBlockedSlots(prev => {
      const currentList = prev[turfId] || [];
      if (currentList.includes(slotId)) {
        return { ...prev, [turfId]: currentList.filter(id => id !== slotId) };
      } else {
        return { ...prev, [turfId]: [...currentList, slotId] };
      }
    });
  };

  const handlePriceChange = (slotId, newPrice) => {
    setAdminSlotPrices(prev => ({
      ...prev,
      [slotId]: parseInt(newPrice) || 0
    }));
  };

  const finalizeLiveGame = async (game) => {
    const delta = extractPlayerDeltas(game, userProfile.name);
    const summary = game.sport === 'cricket'
      ? `${game.teamA.runs}/${game.teamA.wickets} vs ${game.teamB.runs}/${game.teamB.wickets}`
      : `${game.teamA.goals}–${game.teamB.goals}`;

    if (getToken()) {
      try {
        await leaderboardApi.recordMatch({ sport: delta.sport || game.sport, summary, delta });
        await refreshLeaderboard();
      } catch (err) {
        console.warn('[leaderboard] record match failed:', err.message);
        setFriendStats((prev) =>
          prev.map((p) => (p.isMe ? { ...p, stats: applyStatDelta(p.stats, delta) } : p))
        );
      }
    } else {
      setFriendStats((prev) =>
        prev.map((p) => (p.isMe ? { ...p, stats: applyStatDelta(p.stats, delta) } : p))
      );
    }

    setGameHistory((prev) => [
      { id: Date.now(), sport: game.sport, summary, delta, finishedAt: new Date().toISOString() },
      ...prev,
    ].slice(0, 20));
    const statLabel = delta.runs ? `${delta.runs} runs` : delta.goals ? `${delta.goals} goals` : 'stats';
    setNotifications((prev) => [
      { id: Date.now(), text: `Match saved (${summary}). +${statLabel} added to leaderboard!`, time: 'Just now', read: false },
      ...prev,
    ]);
    setLiveGame(null);
  };

  // Calculations for Admin Analytics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.ownerPayout || b.paidAmount || 0), 0);
  const pendingSplitRevenue = bookings
    .filter(b => b.type === 'split')
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
  const platformCommission = bookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);

  const resetApp = () => {
    authApi.logout();
    localStorage.removeItem('tm_profile');
    localStorage.removeItem('tm_onboarding_progress');
    localStorage.removeItem('tm_turfs');
    localStorage.removeItem('tm_owners');
    localStorage.removeItem('tm_suspended_turfs');
    localStorage.removeItem('tm_banned_users');
    localStorage.removeItem('tm_friend_stats');
    localStorage.removeItem('tm_live_game');
    localStorage.removeItem('tm_game_history');
    localStorage.removeItem('tm_squad_groups');
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
      radius: 10,
      lat: 19.456,
      lng: 72.812,
      phone: '9876543210',
      username: '@rahul_cricket'
    });
    setPhoneNumber('');
    setOtpSent(false);
    setOtpCode('');
    setIsAdminMode(false);
    setTurfs(MOCK_TURFS);
    setOwners(INITIAL_OWNERS);
    setSuspendedTurfIds([]);
    setBannedUsers([]);
    setOwnerActiveTurfId('turf-1');
    setFriendStats(INITIAL_FRIEND_STATS);
    setLiveGame(null);
    setGameHistory([]);
    setSquadGroups([]);
    setSentFriendRequests([]);
    setImpersonatingOwner(null);
    setPendingJoinSplitId(null);
    setShowSplitSuccessModal(false);
    setView('splash');
    triggerConfetti();
  };

  const pendingJoinSplitAnn = announcements.find((a) => a.id === pendingJoinSplitId) || null;

  return {
    isAdminMode, setIsAdminMode, view, setView,
    onboardingData, setOnboardingData, userProfile, setUserProfile,
    bookings, setBookings, refreshMyBookings, announcements, setAnnouncements, refreshLockerFeed,
    chats, setChats, refreshChats, friendRequests, acceptFriendRequest, declineFriendRequest, notifications, setNotifications,
    toast, showToast, dismissToast,
    friendStats, setFriendStats, refreshLeaderboard, liveGame, setLiveGame, gameHistory, finalizeLiveGame,
    turfs, setTurfs, owners, setOwners, suspendedTurfIds, bannedUsers, banUser, unbanUser,
    ownerActiveTurfId, setOwnerActiveTurfId,
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
    filterPitchSize, setFilterPitchSize, filterRadius, setFilterRadius, setPlayRadius,
    getDistance, activeTurfId, setActiveTurfId, activeTurf,
    bookingDate, setBookingDate, selectedSlotId, setSelectedSlotId,
    checkoutOption, setCheckoutOption, splitPlayersCount, setSplitPlayersCount,
    openCheckoutModal,
    showCheckoutModal, setShowCheckoutModal, isProcessingPayment, setIsProcessingPayment,
    bookingSuccessData, setBookingSuccessData,
    pendingJoinSplitId, pendingJoinSplitAnn, openJoinSplitReview, closeJoinSplitReview, confirmJoinSplit,
    showSplitSuccessModal, setShowSplitSuccessModal, splitSuccessAnnId, setSplitSuccessAnnId,
    checkoutSlotLockExpiresAt, cancelSplitGame, getSplitInviteLink, inviteSquadGroupToSplit,
    squadGroups, createSquadGroup, sendFriendRequest, sentFriendRequests, openDmWithUser, refreshSocial,
    impersonatingOwner, exitImpersonation, setCheckoutInviteGroupId,
    activeChatId, setActiveChatId,
    chatInput, setChatInput, hoveredMapPin, setHoveredMapPin,
    showNotifications, setShowNotifications, showAvatarPicker, setShowAvatarPicker,
    updateUserAvatar, isLocating, refreshUserLocation, detectAndSetLocation,
    adminSelectedDate, setAdminSelectedDate,
    adminBlockedSlots, setAdminBlockedSlots, adminSlotPrices, setAdminSlotPrices,
    newAnnouncementText, setNewAnnouncementText, newAnnouncementSport, setNewAnnouncementSport,
    newAnnouncementTurf, setNewAnnouncementTurf,
    navigateTo, updateOnboardingData, handleSendOTP, handleVerifyOTP,
    handleUsernameChange, selectSuggestion, handleProfileSubmit, triggerConfetti,
    grantLocation, selectManualLocation, updatePlayerLocation, createLockerPost,
    processBookingPayment, joinSplitGame,
    sendMessage, createAdminAnnouncement, toggleAdminSlot, handlePriceChange,
    totalRevenue, pendingSplitRevenue, platformCommission, resetApp,
    getCurrentOwnerId, getOwnerTurfs, getOwnerBookings, getOwnerRevenueMetrics,
    getPlatformMetrics, getOwnerById, getTurfOwnerName,
    approveOwnerApplication, rejectOwnerApplication, suspendTurf, activateTurf,
    loginAsOwner, submitOwnerApplication, addOwnerTurf,
  };
}

// Mock Data for TurfMate Application
import { IMAGES, avatar, groupAvatar } from './images';

export const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽', image: IMAGES.football, positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker'] },
  { id: 'cricket', name: 'Cricket', icon: '🏏', image: IMAGES.cricket, positions: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'] },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓', image: IMAGES.pickleball, positions: ['Left Wing', 'Right Wing', 'Single Player'] },
  { id: 'badminton', name: 'Badminton', icon: '🏸', image: IMAGES.pickleball, positions: ['Singles', 'Doubles'] },
  { id: 'basketball', name: 'Basketball', icon: '🏀', image: IMAGES.player, positions: ['Guard', 'Forward', 'Center'] }
];

export const MOCK_TURFS = [
  {
    id: 'turf-1',
    ownerId: 'owner-1',
    name: 'Green Valley Arena',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    distance: '1.2 km',
    lat: 19.456,
    lng: 72.805,
    city: 'Virar',
    rating: 4.8,
    reviews: 124,
    pricePerHour: 1200,
    minSplitAdvance: 400,
    amenities: ['Parking', 'Shower Room', 'Floodlights', 'Drinking Water', 'Bibs Provided'],
    gallery: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531418847159-148fabe46680?auto=format&fit=crop&q=80&w=800',
    ],
    sports: ['football', 'cricket'],
    rules: [
      'Flat shoes or turf spikes only (No metal studs).',
      'Please arrive 10 minutes before your slot.',
      'Cancel up to 24h in advance for a full refund.',
      'Respect other players and turf staff.'
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'available' },
      { id: 's2', time: '07:00 AM - 08:00 AM', status: 'available' },
      { id: 's3', time: '08:00 AM - 09:00 AM', status: 'booked' },
      { id: 's4', time: '04:00 PM - 05:00 PM', status: 'available' },
      { id: 's5', time: '05:00 PM - 06:00 PM', status: 'available' },
      { id: 's6', time: '06:00 PM - 07:00 PM', status: 'booked' },
      { id: 's7', time: '07:00 PM - 08:00 PM', status: 'available', surgePrice: 1400 },
      { id: 's8', time: '08:00 PM - 09:00 PM', status: 'available', surgePrice: 1400 },
      { id: 's9', time: '09:00 PM - 10:00 PM', status: 'available', surgePrice: 1400 },
      { id: 's10', time: '10:00 PM - 11:00 PM', status: 'available' }
    ]
  },
  {
    id: 'turf-2',
    ownerId: 'owner-1',
    name: 'Kanakia Sports Hub',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600',
    distance: '3.1 km',
    lat: 19.462,
    lng: 72.812,
    city: 'Virar',
    rating: 4.6,
    reviews: 98,
    pricePerHour: 1500,
    minSplitAdvance: 500,
    amenities: ['Parking', 'Refreshment Cafe', 'Floodlights', 'Air Conditioned Lounge'],
    gallery: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
    ],
    sports: ['football', 'cricket', 'pickleball'],
    rules: [
      'Clean footwear required.',
      'No food/drinks permitted on the turf itself.',
      'Maximum 14 players allowed on the turf pitch at once.'
    ],
    slots: [
      { id: 'k1', time: '07:00 AM - 08:00 AM', status: 'booked' },
      { id: 'k2', time: '08:00 AM - 09:00 AM', status: 'available' },
      { id: 'k3', time: '05:00 PM - 06:00 PM', status: 'available' },
      { id: 'k4', time: '06:00 PM - 07:00 PM', status: 'booked' },
      { id: 'k5', time: '07:00 PM - 08:00 PM', status: 'booked' },
      { id: 'k6', time: '08:00 PM - 09:00 PM', status: 'available', surgePrice: 1700 },
      { id: 'k7', time: '09:00 PM - 10:00 PM', status: 'available', surgePrice: 1700 }
    ]
  },
  {
    id: 'turf-3',
    ownerId: 'owner-2',
    name: 'Dribble Arena',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=600',
    distance: '4.8 km',
    lat: 19.442,
    lng: 72.792,
    city: 'Virar',
    rating: 4.5,
    reviews: 64,
    pricePerHour: 1000,
    minSplitAdvance: 300,
    amenities: ['Floodlights', 'Drinking Water', 'First Aid'],
    gallery: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
    ],
    sports: ['football', 'badminton'],
    rules: [
      'Standard sports attire only.',
      'Damages to net/fencing will be charged to the booking account.'
    ],
    slots: [
      { id: 'd1', time: '04:00 PM - 05:00 PM', status: 'available' },
      { id: 'd2', time: '05:00 PM - 06:00 PM', status: 'available' },
      { id: 'd3', time: '06:00 PM - 07:00 PM', status: 'available' },
      { id: 'd4', time: '07:00 PM - 08:00 PM', status: 'booked' },
      { id: 'd5', time: '08:00 PM - 09:00 PM', status: 'available', surgePrice: 1100 }
    ]
  },
  {
    id: 'turf-4',
    ownerId: 'owner-2',
    name: 'Ace Pickleball Court',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    distance: '2.3 km',
    lat: 19.449,
    lng: 72.825,
    city: 'Virar',
    rating: 4.9,
    reviews: 42,
    pricePerHour: 800,
    minSplitAdvance: 200,
    amenities: ['Equipment Rental', 'Parking', 'Coaching Available'],
    gallery: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbc195a835?auto=format&fit=crop&q=80&w=800',
    ],
    sports: ['pickleball'],
    rules: [
      'Paddles and balls can be rented at the front counter.',
      'Non-marking indoor court shoes required.'
    ],
    slots: [
      { id: 'p1', time: '08:00 AM - 09:00 AM', status: 'available' },
      { id: 'p2', time: '09:00 AM - 10:00 AM', status: 'available' },
      { id: 'p3', time: '04:00 PM - 05:00 PM', status: 'booked' },
      { id: 'p4', time: '05:00 PM - 06:00 PM', status: 'available' },
      { id: 'p5', time: '06:00 PM - 07:00 PM', status: 'available' }
    ]
  }
];

export const MOCK_PLAYERS = [
  {
    id: 'p-1',
    name: 'Rahul Mehta',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    skillLevel: 'Intermediate',
    skillTier: 'Gold',
    sports: [
      { id: 'football', position: 'Midfielder', level: 'Intermediate' },
      { id: 'cricket', position: 'Batsman', level: 'Advanced' }
    ],
    matchesPlayed: 45,
    distance: '1.5 km',
    lat: 19.452,
    lng: 72.809,
    isFriend: true
  },
  {
    id: 'p-2',
    name: 'Aniket Sawant',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aniket',
    skillLevel: 'Advanced',
    skillTier: 'Pro',
    sports: [
      { id: 'football', position: 'Striker', level: 'Advanced' }
    ],
    matchesPlayed: 78,
    distance: '3.4 km',
    lat: 19.460,
    lng: 72.815,
    isFriend: false
  },
  {
    id: 'p-3',
    name: 'Sneha Rao',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
    skillLevel: 'Intermediate',
    skillTier: 'Silver',
    sports: [
      { id: 'pickleball', position: 'Single Player', level: 'Intermediate' },
      { id: 'badminton', position: 'Doubles', level: 'Intermediate' }
    ],
    matchesPlayed: 23,
    distance: '2.1 km',
    lat: 19.448,
    lng: 72.798,
    isFriend: true
  },
  {
    id: 'p-4',
    name: 'Vikram Singh',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
    skillLevel: 'Beginner',
    skillTier: 'Bronze',
    sports: [
      { id: 'cricket', position: 'Bowler', level: 'Beginner' }
    ],
    matchesPlayed: 8,
    distance: '0.8 km',
    lat: 19.458,
    lng: 72.802,
    isFriend: false
  },
  {
    id: 'p-5',
    name: 'Joshua Alvares',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joshua',
    skillLevel: 'Advanced',
    skillTier: 'Pro',
    sports: [
      { id: 'football', position: 'Goalkeeper', level: 'Advanced' }
    ],
    matchesPlayed: 112,
    distance: '4.2 km',
    lat: 19.438,
    lng: 72.819,
    isFriend: false
  },
  {
    id: 'p-6',
    name: 'Karan Malhotra',
    avatar: avatar('Karan'),
    skillLevel: 'Advanced',
    skillTier: 'Gold',
    sports: [
      { id: 'football', position: 'Midfielder', level: 'Advanced' },
      { id: 'cricket', position: 'All-Rounder', level: 'Intermediate' }
    ],
    matchesPlayed: 56,
    distance: '2.8 km',
    lat: 19.454,
    lng: 72.818,
    isFriend: true
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    hostId: 'p-1',
    hostName: 'Rahul Mehta',
    hostAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    hostLevel: 'Intermediate',
    sport: 'football',
    sportIcon: '⚽',
    sportLabel: '7v7 Football',
    turfId: 'turf-1',
    turfName: 'Green Valley Arena',
    time: 'Today, 08:00 PM',
    distance: '1.2 km',
    costPerHead: 200,
    playersNeeded: 3,
    totalSpots: 14,
    roster: ['Rahul Mehta', 'Sneha Rao', 'Vikram Singh'],
    status: 'open',
    slotId: 's8',
    text: 'Hosting 7v7 tonight — need 3 more. Intermediate level, bibs provided at venue.',
    turfImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    bookingId: 'B-7891',
  },
  {
    id: 'ann-2',
    hostId: 'p-3',
    hostName: 'Sneha Rao',
    hostAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
    hostLevel: 'Intermediate',
    sport: 'pickleball',
    sportIcon: '🏓',
    sportLabel: 'Doubles Pickleball',
    turfId: 'turf-4',
    turfName: 'Ace Pickleball Court',
    time: 'Tomorrow, 05:00 PM',
    distance: '2.3 km',
    costPerHead: 200,
    playersNeeded: 1,
    totalSpots: 4,
    roster: ['Sneha Rao', 'Rohan K.', 'Meera S.'],
    status: 'open',
    slotId: 'p4',
    text: 'Doubles pickleball tomorrow 5 PM — one spot left. Paddle rental available.',
    turfImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'ann-3',
    hostId: 'p-2',
    hostName: 'Aniket Sawant',
    hostAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aniket',
    hostLevel: 'Advanced',
    sport: 'football',
    sportIcon: '⚽',
    sportLabel: '5v5 Football',
    turfId: 'turf-2',
    turfName: 'Kanakia Sports Hub',
    time: 'Yesterday, 07:00 PM',
    distance: '3.1 km',
    costPerHead: 300,
    playersNeeded: 0,
    totalSpots: 10,
    roster: ['Aniket Sawant', 'Rahul Mehta', 'Joshua Alvares', 'Aryan T.', 'Kabir P.', 'Neil D.', 'Pranav G.', 'Rithvik S.', 'Sujit K.', 'Yash V.'],
    status: 'completed',
    slotId: 'k5',
    text: 'Great 5v5 last night — thanks everyone who showed up on time!',
    turfImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'ann-4',
    hostId: 'owner-1',
    hostName: 'Green Valley Arena',
    hostAvatar: avatar('GreenValley'),
    hostLevel: 'Partner',
    sport: 'football',
    sportIcon: '🏟️',
    sportLabel: 'Morning Special',
    turfId: 'turf-1',
    turfName: 'Green Valley Arena',
    time: 'Today, 07:00 AM',
    distance: '1.2 km',
    costPerHead: 0,
    playersNeeded: 0,
    totalSpots: 0,
    roster: [],
    status: 'open',
    isAdminAnnouncement: true,
    text: '20% off all morning slots this week — book before 10 AM and save!',
    turfImage: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=600',
  }
];

export const INITIAL_CHATS = [
  {
    id: 'chat-ann-1',
    name: '7v7 @ Green Valley',
    type: 'game',
    avatar: groupAvatar('GreenValleyGame'),
    unread: 1,
    isActive: true,
    turfImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=200',
    meta: {
      turfId: 'turf-1',
      turfName: 'Green Valley Arena',
      sport: '7v7 Football',
      gameTime: 'Tonight, 8:00 PM',
      spotsOpen: 3,
      roster: ['Rahul Mehta', 'Sneha Rao', 'Joshua Alvares', 'Vikram Singh'],
    },
    messages: [
      { sender: 'System', text: 'Split game room created. 3 spots still open.', time: '06:00 PM', dateLabel: 'Today', type: 'SYSTEM_ALERT' },
      { sender: 'Rahul Mehta', text: 'Need 3 more for 7v7 tonight — who is in?', time: '06:05 PM', dateLabel: 'Today' },
      { sender: 'Sneha Rao', text: 'I can bring a friend!', time: '06:08 PM', dateLabel: 'Today' },
    ],
  },
  {
    id: 'chat-archived-1',
    name: '5v5 @ Kanakia Hub',
    type: 'game',
    avatar: groupAvatar('KanakiaGame'),
    unread: 0,
    isActive: false,
    meta: {
      turfName: 'Kanakia Hub',
      sport: '5v5 Football',
      gameTime: 'Last Saturday, 7:00 PM',
      roster: ['Rahul Mehta', 'Aniket Sawant'],
    },
    messages: [
      { sender: 'System', text: 'This game chat has been archived.', time: '11:30 PM', dateLabel: 'Saturday', type: 'SYSTEM_ALERT' },
      { sender: 'Aniket Sawant', text: 'Great game everyone!', time: '10:45 PM', dateLabel: 'Saturday' },
    ],
  },
  {
    id: 'chat-lobby-football',
    name: 'Virar Footballers',
    type: 'lobby',
    avatar: groupAvatar('VirarFootballers'),
    unread: 2,
    members: 142,
    meta: { sport: 'Football', area: 'Virar · 10km' },
    messages: [
      { sender: 'Joshua Alvares', text: 'Anyone up for a 5v5 at Green Valley tonight around 9?', time: '05:30 PM', dateLabel: 'Today' },
      { sender: 'Aniket Sawant', text: 'I am in if we get a keeper.', time: '05:32 PM', dateLabel: 'Today' },
      { sender: 'Joshua Alvares', text: 'I can keep! We need 8 more.', time: '05:35 PM', dateLabel: 'Today' },
    ],
  },
  {
    id: 'chat-lobby-cricket',
    name: 'Box Cricket Hub',
    type: 'lobby',
    avatar: groupAvatar('BoxCricketHub'),
    unread: 0,
    members: 95,
    meta: { sport: 'Box Cricket', area: 'Virar West' },
    messages: [
      { sender: 'Vikram Singh', text: 'Where can we buy good tennis balls in Virar West?', time: 'Yesterday', dateLabel: 'Yesterday' },
      { sender: 'Rahul Mehta', text: 'Check the sports store near the station — premium ones.', time: 'Yesterday', dateLabel: 'Yesterday' },
    ],
  },
  {
    id: 'chat-friend-1',
    name: 'Rahul Mehta',
    type: 'dm',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    unread: 1,
    meta: { online: true, lastSeen: 'Active now' },
    messages: [
      { sender: 'Rahul Mehta', text: 'Bro, did you see the game booking announcement for tonight?', time: '06:10 PM', dateLabel: 'Today' },
    ],
  },
  {
    id: 'chat-friend-2',
    name: 'Sneha Rao',
    type: 'dm',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
    unread: 0,
    meta: { online: false, lastSeen: 'Last seen 1h ago' },
    messages: [
      { sender: 'You', text: 'Hey Sneha! Let me know when you book the pickleball slot tomorrow.', time: '03:15 PM', dateLabel: 'Today' },
      { sender: 'Sneha Rao', text: 'Will do! Planning for the 5 PM slot.', time: '03:18 PM', dateLabel: 'Today' },
    ],
  },
];

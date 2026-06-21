import { avatar } from './images';

export const INITIAL_FRIEND_REQUESTS = [
  {
    id: 'req-1',
    name: 'Arjun Patel',
    avatar: avatar('Arjun'),
    message: 'Saw you on Player Radar — want to squad up for weekend 7v7?',
    time: '2h ago',
    mutualFriends: 3,
    sport: 'football',
  },
  {
    id: 'req-2',
    name: 'Kabir Shah',
    avatar: avatar('Kabir'),
    message: 'We played at Green Valley last week. Down for a split tonight?',
    time: 'Yesterday',
    mutualFriends: 1,
    sport: 'cricket',
  },
];

export const QUICK_REPLIES = {
  game: [
    "Running 5 mins late!",
    "Who's bringing the ball?",
    'Reaching in 2',
    'Need one more player',
    'Split paid ✓',
  ],
  lobby: [
    'Anyone free tonight?',
    'Looking for a keeper',
    'Which turf is best?',
    'Count me in',
  ],
  dm: [
    'On my way!',
    'Booked the slot ✓',
    'See you there',
    'Can you split with me?',
  ],
};

export const CHAT_TYPE_META = {
  game: { label: 'game room', color: 'tm-icon-accent-green' },
  lobby: { label: 'community lobby', color: 'tm-icon-accent-sky' },
  dm: { label: 'direct message', color: 'tm-icon-accent-violet' },
  request: { label: 'message request', color: 'tm-icon-accent-amber' },
};

import { MOCK_PLAYERS } from './mockData';

/** Primary + secondary stats shown per sport on the friends leaderboard */
export const LEADERBOARD_METRICS = {
  football: {
    label: 'Football',
    icon: '⚽',
    primary: { key: 'goals', label: 'goals' },
    secondary: [
      { key: 'assists', label: 'assists' },
      { key: 'matches', label: 'matches' },
      { key: 'cleanSheets', label: 'clean sheets' },
    ],
  },
  cricket: {
    label: 'Cricket',
    icon: '🏏',
    primary: { key: 'runs', label: 'runs' },
    secondary: [
      { key: 'wickets', label: 'wickets' },
      { key: 'sixes', label: 'sixes' },
      { key: 'matches', label: 'matches' },
    ],
  },
  basketball: {
    label: 'Basketball',
    icon: '🏀',
    primary: { key: 'points', label: 'points' },
    secondary: [
      { key: 'assists', label: 'assists' },
      { key: 'matches', label: 'matches' },
    ],
  },
  badminton: {
    label: 'Badminton',
    icon: '🏸',
    primary: { key: 'wins', label: 'wins' },
    secondary: [{ key: 'matches', label: 'matches' }],
  },
  pickleball: {
    label: 'Pickleball',
    icon: '🏓',
    primary: { key: 'wins', label: 'wins' },
    secondary: [{ key: 'matches', label: 'matches' }],
  },
};

const emptyStats = () => ({
  football: { goals: 0, assists: 0, matches: 0, cleanSheets: 0 },
  cricket: { runs: 0, wickets: 0, sixes: 0, fours: 0, matches: 0, catches: 0 },
  basketball: { points: 0, assists: 0, matches: 0 },
  badminton: { wins: 0, matches: 0 },
  pickleball: { wins: 0, matches: 0 },
});

/** Seed stats for current user + friends */
export const INITIAL_FRIEND_STATS = [
  {
    id: 'me',
    name: 'Rahul Mehta',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    isMe: true,
    stats: {
      football: { goals: 18, assists: 9, matches: 14, cleanSheets: 0 },
      cricket: { runs: 412, wickets: 6, sixes: 22, fours: 38, matches: 11, catches: 4 },
      basketball: { points: 86, assists: 14, matches: 5 },
      badminton: { wins: 7, matches: 10 },
      pickleball: { wins: 3, matches: 4 },
    },
  },
  {
    id: 'p-3',
    name: 'Sneha Rao',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
    stats: {
      football: { goals: 6, assists: 14, matches: 9, cleanSheets: 0 },
      cricket: { runs: 128, wickets: 12, sixes: 4, fours: 11, matches: 8, catches: 6 },
      basketball: { points: 120, assists: 22, matches: 8 },
      badminton: { wins: 18, matches: 22 },
      pickleball: { wins: 14, matches: 16 },
    },
  },
  {
    id: 'p-2',
    name: 'Aniket Sawant',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aniket',
    stats: {
      football: { goals: 41, assists: 7, matches: 22, cleanSheets: 0 },
      cricket: { runs: 95, wickets: 2, sixes: 6, fours: 8, matches: 4, catches: 1 },
      basketball: { points: 64, assists: 5, matches: 4 },
      badminton: { wins: 5, matches: 9 },
      pickleball: { wins: 2, matches: 3 },
    },
  },
  {
    id: 'p-4',
    name: 'Vikram Singh',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
    stats: {
      football: { goals: 3, assists: 2, matches: 5, cleanSheets: 0 },
      cricket: { runs: 76, wickets: 28, sixes: 1, fours: 4, matches: 12, catches: 8 },
      basketball: { points: 18, assists: 3, matches: 2 },
      badminton: { wins: 2, matches: 5 },
      pickleball: { wins: 0, matches: 1 },
    },
  },
  {
    id: 'p-5',
    name: 'Joshua Alvares',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joshua',
    stats: {
      football: { goals: 2, assists: 1, matches: 28, cleanSheets: 9 },
      cricket: { runs: 44, wickets: 1, sixes: 2, fours: 3, matches: 3, catches: 0 },
      basketball: { points: 30, assists: 6, matches: 3 },
      badminton: { wins: 3, matches: 4 },
      pickleball: { wins: 5, matches: 7 },
    },
  },
  {
    id: 'p-6',
    name: 'Karan Malhotra',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Karan',
    stats: {
      football: { goals: 15, assists: 18, matches: 16, cleanSheets: 0 },
      cricket: { runs: 298, wickets: 9, sixes: 14, fours: 24, matches: 9, catches: 3 },
      basketball: { points: 95, assists: 18, matches: 6 },
      badminton: { wins: 11, matches: 14 },
      pickleball: { wins: 6, matches: 8 },
    },
  },
];

/** Friends = current user + MOCK_PLAYERS where isFriend (dedupe self) */
export function getFriendIds() {
  const friendIds = MOCK_PLAYERS.filter((p) => p.isFriend && p.id !== 'p-1').map((p) => p.id);
  return ['me', ...friendIds];
}

export function sortLeaderboard(entries, sportId) {
  const metric = LEADERBOARD_METRICS[sportId]?.primary?.key || 'goals';
  return [...entries].sort((a, b) => {
    const av = a.stats[sportId]?.[metric] ?? 0;
    const bv = b.stats[sportId]?.[metric] ?? 0;
    return bv - av;
  });
}

export { emptyStats };

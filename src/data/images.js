/** Shared image URLs for consistent draft UI */
export const IMAGES = {
  football: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
  cricket: 'https://images.unsplash.com/photo-1531418847159-148fabe46680?auto=format&fit=crop&q=80&w=800',
  arena: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800',
  pitch: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800',
  pickleball: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
  night: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=800',
  squad: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800',
  map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200',
  locker: 'https://images.unsplash.com/photo-1574629810360-7efbc195a835?auto=format&fit=crop&q=80&w=800',
  player: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=800',
  virar: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
};

export const avatar = (seed) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
export const groupAvatar = (seed) => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

export const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', emoji: '🧑‍🎤' },
  { id: 'avataaars', label: 'Cartoon', emoji: '😎' },
  { id: 'notionists', label: 'Notion', emoji: '✏️' },
  { id: 'fun-emoji', label: 'Emoji', emoji: '🎭' },
];

export const AVATAR_PRESETS = [
  'Rahul', 'Arjun', 'Vikram', 'Sneha', 'Meera', 'Rohan', 'Amit', 'Priya',
  'Karan', 'Dev', 'Neha', 'Isha', 'Varun', 'Anaya', 'Kabir', 'Zoya',
];

export function avatarUrl(seed, style = 'adventurer') {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

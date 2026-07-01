import { IMAGES } from '../data/images';

export const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽', image: IMAGES.football, positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker'] },
  { id: 'cricket', name: 'Cricket', icon: '🏏', image: IMAGES.cricket, positions: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'] },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓', image: IMAGES.pickleball, positions: ['Left Wing', 'Right Wing', 'Single Player'] },
  { id: 'badminton', name: 'Badminton', icon: '🏸', image: IMAGES.pickleball, positions: ['Singles', 'Doubles'] },
  { id: 'basketball', name: 'Basketball', icon: '🏀', image: IMAGES.player, positions: ['Guard', 'Forward', 'Center'] }
];

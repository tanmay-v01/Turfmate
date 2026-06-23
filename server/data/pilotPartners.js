/**
 * Phase 4c — Virar / Vasai pilot partner catalog.
 * Run: npm run seed:pilot --prefix server
 */

const demoTurfs = require('./demoTurfs');

const greenValley = demoTurfs.find((t) => t.id === 'turf-1');
const kanakia = demoTurfs.find((t) => t.id === 'turf-2');

const vasaiBoxCricket = {
  id: 'turf-pilot-vasai',
  name: 'Vasai Box Cricket Arena',
  image: 'https://images.unsplash.com/photo-1531418847159-148fabe46680?auto=format&fit=crop&q=80&w=600',
  lat: 19.391,
  lng: 72.839,
  city: 'Vasai',
  rating: 4.7,
  reviews: 86,
  pricePerHour: 1100,
  minSplitAdvance: 350,
  amenities: ['Parking', 'Floodlights', 'Box Nets', 'Changing Room'],
  gallery: [
    'https://images.unsplash.com/photo-1531418847159-148fabe46680?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
  ],
  sports: ['cricket', 'football'],
  rules: [
    'Rubber soles only on box turf.',
    'Max 12 players per box cricket slot.',
    'Report equipment damage before play starts.',
  ],
  slots: [
    { id: 'v1', time: '06:00 AM - 07:00 AM', status: 'available' },
    { id: 'v2', time: '07:00 AM - 08:00 AM', status: 'available' },
    { id: 'v3', time: '05:00 PM - 06:00 PM', status: 'available' },
    { id: 'v4', time: '06:00 PM - 07:00 PM', status: 'available' },
    { id: 'v5', time: '07:00 PM - 08:00 PM', status: 'available', surgePrice: 1300 },
    { id: 'v6', time: '08:00 PM - 09:00 PM', status: 'available', surgePrice: 1300 },
  ],
};

module.exports = [
  {
    phone: '9820012345',
    businessName: 'Green Valley Sports Group',
    ownerName: 'Amit Patel',
    turf: greenValley,
  },
  {
    phone: '9820012346',
    businessName: 'Kanakia Sports Management',
    ownerName: 'Priya Sharma',
    turf: kanakia,
  },
  {
    phone: '9820012347',
    businessName: 'Vasai Box Cricket Co.',
    ownerName: 'Rajesh Kulkarni',
    turf: vasaiBoxCricket,
  },
];

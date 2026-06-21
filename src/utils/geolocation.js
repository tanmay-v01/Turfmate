const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en',
  'User-Agent': 'TurfMate/0.1 (local demo)',
};

/** Request device GPS with high accuracy */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
      ...options,
    });
  });
}

function formatAddress(data) {
  const a = data?.address || {};
  const locality =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    a.village ||
    a.town ||
    a.city_district;
  const region = a.city || a.town || a.county || a.state_district;
  const parts = [locality, region].filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (data?.display_name) {
    return data.display_name.split(',').slice(0, 2).join(',').trim();
  }
  return null;
}

/** Resolve lat/lng to a readable neighborhood name (OpenStreetMap Nominatim) */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    return formatAddress(data);
  } catch {
    return null;
  }
}

/** Get accurate GPS coords + human-readable place name */
export async function detectUserLocation() {
  const pos = await getCurrentPosition();
  const lat = parseFloat(pos.coords.latitude.toFixed(6));
  const lng = parseFloat(pos.coords.longitude.toFixed(6));
  const accuracyMeters = Math.round(pos.coords.accuracy || 0);
  const name = (await reverseGeocode(lat, lng)) || 'Your location';
  return { lat, lng, name, accuracyMeters };
}

export const DEFAULT_FALLBACK = {
  lat: 19.456,
  lng: 72.812,
  name: 'Virar West, Mumbai',
  accuracyMeters: null,
};

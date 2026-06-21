/** Map DB user + profiles → frontend tm_profile shape */

function parseSportsDna(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function toClientProfile(user, playerProfile, ownerProfile) {
  const base = {
    isLoggedIn: true,
    userId: user.id,
    phone: user.phone,
    role: user.role,
    onboardingComplete: Boolean(user.onboarding_complete),
  };

  if (user.role === 'SUPER_ADMIN') {
    return {
      ...base,
      name: 'Platform Admin',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=SuperAdmin',
    };
  }

  if (user.role === 'OWNER' && ownerProfile) {
    return {
      ...base,
      name: ownerProfile.owner_name || ownerProfile.business_name || 'Owner',
      businessName: ownerProfile.business_name,
      ownerName: ownerProfile.owner_name,
      approvalStatus: ownerProfile.kyc_status === 'APPROVED' ? 'Approved' : 'Pending_Approval',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Admin',
      turfIds: ['turf-1', 'turf-2'],
      ownerId: 'owner-1',
    };
  }

  if (playerProfile) {
    const sportsDna = parseSportsDna(playerProfile.sports_dna);
    const favoriteSports = sportsDna.map((s) => (s.sport || s.sport_name || '').toLowerCase()).filter(Boolean);
    const firstSport = sportsDna[0] || {};
    return {
      ...base,
      name: playerProfile.full_name || 'Player',
      username: playerProfile.username || '',
      avatar: playerProfile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.phone}`,
      location: playerProfile.location_label || 'Virar',
      lat: Number(playerProfile.location_lat) || 19.456,
      lng: Number(playerProfile.location_lng) || 72.812,
      radius: playerProfile.filter_radius_km || 10,
      favoriteSports: favoriteSports.length ? favoriteSports : ['football', 'cricket'],
      position: firstSport.preferred_position || firstSport.position || 'Midfielder',
      skillLevel: firstSport.skill_level || firstSport.skillLevel || 'Intermediate',
    };
  }

  return base;
}

module.exports = { toClientProfile, parseSportsDna };

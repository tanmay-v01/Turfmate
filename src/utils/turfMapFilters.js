/** Shared turf filtering for list + map views */
export function filterTurfs(turfs, {
  lat,
  lng,
  getDistance,
  filterRadius,
  filterSport = 'all',
  searchQuery = '',
  filterPitchSize = 'all',
  suspendedIds = [],
}) {
  return turfs.filter((turf) => {
    if (suspendedIds.includes(turf.id) || turf.status === 'pending_review') return false;
    const dist = getDistance(lat, lng, turf.lat, turf.lng);
    if (dist > filterRadius) return false;
    if (filterSport !== 'all' && !turf.sports.includes(filterSport)) return false;
    if (searchQuery && !turf.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPitchSize === '5v5' && turf.id === 'turf-4') return false;
    return true;
  });
}

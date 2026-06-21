import L from 'leaflet';

const FOREST = '#166534';
const FRESH = '#4ADE80';
const WHITE = '#ffffff';

export function createUserIcon() {
  return L.divIcon({
    className: 'tm-map-icon',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none">
        <div style="width:22px;height:22px;background:#3b82f6;border-radius:50%;border:3px solid ${WHITE};box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>
        <span style="margin-top:3px;font-size:9px;font-weight:800;background:${FOREST};color:${WHITE};padding:2px 6px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.2)">You</span>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 22],
  });
}

export function createTurfIcon(turf, isSelected = false) {
  const emoji = turf.sports?.[0] === 'pickleball' ? '🏓' : turf.sports?.[0] === 'cricket' ? '🏏' : '⚽';
  const bg = isSelected ? FRESH : FOREST;
  const scale = isSelected ? 'transform:scale(1.15)' : '';
  return L.divIcon({
    className: 'tm-map-icon',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;${scale}">
        <div style="width:34px;height:34px;border-radius:50%;background:${bg};border:2px solid ${FRESH};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.25)">${emoji}</div>
        <span style="width:8px;height:3px;background:rgba(0,0,0,0.25);border-radius:50%;margin-top:2px;display:block"></span>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });
}

export function createPlayerIcon(avatarUrl) {
  return L.divIcon({
    className: 'tm-map-icon',
    html: `
      <img src="${avatarUrl}" alt="" style="width:32px;height:32px;border-radius:50%;border:2px solid ${FRESH};object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer" />
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function createPinIcon() {
  return L.divIcon({
    className: 'tm-map-icon',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${FOREST};transform:rotate(-45deg);border:3px solid ${FRESH};box-shadow:0 4px 12px rgba(0,0,0,0.3)"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

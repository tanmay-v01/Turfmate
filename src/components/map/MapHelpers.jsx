import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

/** Recenter map when user location changes */
export function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (!center?.[0] || !center?.[1]) return;
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

/** Fix tile gaps after container resize / tab toggle */
export function MapResizeHandler({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

/** Handle map clicks for pin placement */
export function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

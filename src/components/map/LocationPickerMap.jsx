import { useRef, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import TurfMapBase from './TurfMapBase';
import { MapClickHandler } from './MapHelpers';
import { createPinIcon } from './mapIcons';
import { DEFAULT_CENTER } from './mapConfig';

function DraggablePin({ position, onMove }) {
  const markerRef = useRef(null);
  const icon = useMemo(() => createPinIcon(), []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onMove({ lat, lng });
        }
      },
    }),
    [onMove]
  );

  if (!position) return null;

  return (
    <Marker
      draggable
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  );
}

/** Interactive map for pinning a location (owner onboarding) */
export default function LocationPickerMap({ position, onChange, height = 'h-56' }) {
  const center = position ? [position.lat, position.lng] : DEFAULT_CENTER;

  return (
    <div className={`relative rounded-[24px] overflow-hidden border-2 border-white/10 ${height}`}>
      <TurfMapBase center={center} zoom={14} scrollWheelZoom={false}>
        <MapClickHandler
          onClick={({ lat, lng }) =>
            onChange({
              lat: parseFloat(lat.toFixed(4)),
              lng: parseFloat(lng.toFixed(4)),
              address: position?.address || `Pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            })
          }
        />
        <DraggablePin
          position={position}
          onMove={({ lat, lng }) =>
            onChange({
              lat: parseFloat(lat.toFixed(4)),
              lng: parseFloat(lng.toFixed(4)),
              address: position?.address || `Pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            })
          }
        />
      </TurfMapBase>
      <span className="absolute bottom-3 left-3 z-[500] text-[10px] font-bold text-white bg-white/90 px-2 py-1 rounded-lg shadow-sm pointer-events-none">
        tap or drag pin to entrance
      </span>
    </div>
  );
}

import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_TILES, DEFAULT_ZOOM } from './mapConfig';
import { MapRecenter, MapResizeHandler } from './MapHelpers';

export default function TurfMapBase({
  center,
  zoom = DEFAULT_ZOOM,
  className = 'tm-map-wrap h-full w-full',
  resizeTrigger,
  children,
  scrollWheelZoom = true,
}) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={scrollWheelZoom}
      >
        <TileLayer attribution={MAP_TILES.attribution} url={MAP_TILES.url} />
        <MapRecenter center={center} zoom={zoom} />
        {resizeTrigger !== undefined && <MapResizeHandler trigger={resizeTrigger} />}
        {children}
      </MapContainer>
    </div>
  );
}

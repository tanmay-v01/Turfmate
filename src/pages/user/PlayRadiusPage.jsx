import { MapPin, Radar, Crosshair, Map, Users, Building2, Navigation2 } from 'lucide-react';

import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import TurfImage from '../../components/ui/TurfImage';
import { Marker, Circle } from 'react-leaflet';
import TurfMapBase from '../../components/map/TurfMapBase';
import { createUserIcon, createTurfIcon, createPlayerIcon } from '../../components/map/mapIcons';
import { filterTurfs } from '../../utils/turfMapFilters';
import { INFO_ACCENTS } from '../../utils/colorAccents';

const RADIUS_PRESETS = [5, 10, 15, 20];

export default function PlayRadiusPage() {
  const app = useApp();
  const lat = app.userProfile.lat || 19.456;
  const lng = app.userProfile.lng || 72.812;
  const radius = app.filterRadius;
  const center = [lat, lng];

  const filteredTurfs = filterTurfs(app.turfs, {
    lat,
    lng,
    getDistance: app.getDistance,
    filterRadius: radius,
    suspendedIds: app.suspendedTurfIds,
  });

  const playersInRange = [];

  const sendFriendRequest = (name) => {
    app.showToast(`Friend request sent to ${name}`, 'success');
  };

  const handlePinSelect = (pin) => {
    app.setHoveredMapPin((prev) => (prev?.id === pin.id ? null : pin));
  };

  const userIcon = createUserIcon();

  return (
    <div className="animate-fade-up pb-8">
      <PageHeader
        title="play radius"
        subtitle="discover turfs & players around you"
        badge="map"
        icon={Map}
        onBack={() => app.setView('home')}
        action={
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => app.refreshUserLocation()}
              disabled={app.isLocating}
              className={`tm-chip ${app.isLocating ? 'opacity-50' : ''}`}
            >
              <Crosshair className={`w-3 h-3 ${app.isLocating ? 'animate-spin' : ''}`} />
              {app.isLocating ? 'locating' : 'gps'}
            </button>
            <button onClick={() => app.setView('location_manual')} className="tm-chip">
              change area
            </button>
            <button onClick={() => app.setView('radar')} className="tm-chip tm-chip-active">
              <Radar className="w-3 h-3" />
              radar
            </button>
          </div>
        }
      />

      {/* Radius + location controls */}
      <div className="glass-card p-4 sm:p-5 mb-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">search radius</p>
            <p className="text-2xl font-display font-extrabold text-slate-800 tabular-nums">
              {radius}<span className="text-base font-bold text-slate-400 ml-0.5">km</span>
            </p>
          </div>
          <div className="flex gap-1.5">
            {RADIUS_PRESETS.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => app.setPlayRadius(km)}
                className={`min-w-[2.25rem] px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                  radius === km ? 'tm-chip-sky' : 'tm-chip-neutral'
                }`}
              >
                {km}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="20"
            value={radius}
            onChange={(e) => app.setPlayRadius(parseInt(e.target.value, 10))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-grassFresh bg-slate-200/80"
            aria-label="Search radius in kilometers"
          />
          <div className="flex justify-between text-[10px] font-medium text-slate-400">
            <span>2 km</span>
            <span>20 km</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Building2, value: filteredTurfs.length, label: 'turfs', accent: INFO_ACCENTS.green },
            { icon: Users, value: playersInRange.length, label: 'players', accent: INFO_ACCENTS.sky },
            { icon: MapPin, value: radius, label: 'km zone', accent: INFO_ACCENTS.violet },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl px-3 py-2.5 text-center border border-slate-200/90 bg-white/90">
              <div className={`w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center ${stat.accent}`}>
                <stat.icon className="w-3.5 h-3.5" strokeWidth={2.25} />
              </div>
              <p className="text-lg font-display font-extrabold text-slate-800 tabular-nums leading-none">
                {stat.value}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl tm-icon-accent-sky shrink-0">
            <Navigation2 className="w-4 h-4 text-emerald-600" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {app.userProfile.location || 'Your location'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Pin updated · tap GPS to refresh
            </p>
          </div>
          <button
            type="button"
            onClick={() => app.setView('location_manual')}
            className="shrink-0 text-[10px] font-bold text-emerald-600 uppercase tracking-wide hover:underline"
          >
            edit
          </button>
        </div>
      </div>

      <div className="relative rounded-[22px] overflow-hidden glass-card !p-0 h-[360px] sm:h-[380px] mb-5">
        <TurfMapBase center={center} resizeTrigger={radius}>
          <Circle
            center={center}
            radius={radius * 1000}
            pathOptions={{ color: '#86EFAC', fillColor: '#BBF7D0', fillOpacity: 0.2, dashArray: '5, 10' }}
          />
          <Marker position={center} icon={userIcon} zIndexOffset={100} />
          {filteredTurfs.map((t) => (
            <Marker
              key={t.id}
              position={[t.lat, t.lng]}
              icon={createTurfIcon(t, app.hoveredMapPin?.id === t.id)}
              eventHandlers={{ click: () => handlePinSelect(t) }}
            />
          ))}
          {playersInRange.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createPlayerIcon(p.avatar)}
              eventHandlers={{ click: () => handlePinSelect(p) }}
            />
          ))}
        </TurfMapBase>

        <div className="absolute top-3 left-3 z-[500] glass-search-bar rounded-full px-3 py-1.5 text-[10px] font-semibold text-slate-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-grassFresh animate-pulse" />
          {filteredTurfs.length} turfs · {playersInRange.length} players in range
        </div>

        {app.hoveredMapPin && (
          <div className="absolute bottom-3 left-3 right-3 z-[500] glass-panel rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-800 truncate">{app.hoveredMapPin.name}</p>
              <p className="text-xs text-slate-500">
                {app.hoveredMapPin.pricePerHour
                  ? `₹${app.hoveredMapPin.pricePerHour}/hr · ${app.hoveredMapPin.rating}★`
                  : `${app.hoveredMapPin.skillLevel} · ${app.hoveredMapPin.distance || ''}`}
              </p>
            </div>
            {app.hoveredMapPin.pricePerHour ? (
              <button
                onClick={() => { app.setActiveTurfId(app.hoveredMapPin.id); app.setView('turf_details'); }}
                className="shrink-0 px-4 py-2 tm-btn-primary rounded-full text-xs font-bold shadow-sm"
              >
                book
              </button>
            ) : (
              <button
                onClick={() => sendFriendRequest(app.hoveredMapPin.name)}
                className="shrink-0 px-4 py-2 tm-btn-secondary rounded-full text-xs font-bold"
              >
                add
              </button>
            )}
          </div>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="tm-section-heading">turfs in range</h3>
          <span className="tm-chip">{filteredTurfs.length} results</span>
        </div>
        {filteredTurfs.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No turfs in this radius</p>
            <p className="text-xs text-slate-400 mt-1">Try 10km or 15km using the presets above.</p>
          </div>
        ) : (
          filteredTurfs.map((t) => {
            const dist = app.getDistance(lat, lng, t.lat, t.lng).toFixed(1);
            return (
              <button
                key={t.id}
                onClick={() => { app.setActiveTurfId(t.id); app.setView('turf_details'); }}
                className="w-full glass-card p-3 flex items-center gap-3 text-left hover:shadow-md transition !rounded-2xl"
              >
                <TurfImage turf={t} className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-white/80" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{t.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" /> {dist} km · {t.city}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800 tabular-nums">₹{t.pricePerHour}</span>
              </button>
            );
          })
        )}
      </section>
    </div>
  );
}

import { Search, X, ArrowLeft, SlidersHorizontal, Map, List } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfImage from '../../components/ui/TurfImage';
import { Marker } from 'react-leaflet';
import TurfMapBase from '../../components/map/TurfMapBase';
import { createUserIcon, createTurfIcon } from '../../components/map/mapIcons';
import { filterTurfs } from '../../utils/turfMapFilters';
import EmptyState from '../../components/ui/EmptyState';

export default function SearchEnginePage() {
  const app = useApp();
  const lat1 = app.userProfile?.lat || 19.456;
  const lng1 = app.userProfile?.lng || 72.812;
  const center = [lat1, lng1];

  const filteredList = filterTurfs(app.turfs, {
    lat: lat1,
    lng: lng1,
    getDistance: app.getDistance,
    filterRadius: app.filterRadius,
    filterSport: app.filterSport,
    searchQuery: app.searchQuery,
    filterPitchSize: app.filterPitchSize,
    suspendedIds: app.suspendedTurfIds,
  });

  const userIcon = createUserIcon();

  return (
    <div className="flex flex-col min-h-[70vh] text-left w-full relative">
      <div className="p-4 sm:p-6 glass-card !rounded-none border-x-0 border-t-0 space-y-3 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => app.setView('home')} className="tm-icon-btn !w-9 !h-9 shrink-0 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={app.searchQuery}
              onChange={(e) => app.setSearchQuery(e.target.value)}
              placeholder="Search turfs, areas..."
              className="tm-input py-2.5 pl-10 pr-10 text-sm !rounded-2xl"
            />
            <button
              onClick={() => app.setShowFilterSheet(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 tm-icon-btn !w-8 !h-8 !rounded-xl text-brand-grassDeep"
              aria-label="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {app.filterSport !== 'all' && (
            <span className="tm-chip tm-chip-active">{app.filterSport}</span>
          )}
          {app.filterPitchSize !== 'all' && (
            <span className="tm-chip">{app.filterPitchSize}</span>
          )}
          <span className="tm-chip">{app.filterRadius} km</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row relative overflow-hidden min-h-[420px]">
        {/* List */}
        <div className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col h-full overflow-y-auto p-4 space-y-3 pb-24 lg:pb-4 no-scrollbar ${app.searchViewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          {filteredList.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Results Found"
              description="Try expanding your search radius or selecting a different sport filter."
              actionText="Reset Search Parameters"
              onAction={() => {
                app.setFilterRadius(15);
                app.setFilterSport('all');
                app.setFilterPitchSize('all');
                app.setSearchQuery('');
              }}
              className="my-10 border border-slate-100"
            />
          ) : (
            filteredList.map((turf) => {
              const dist = app.getDistance(lat1, lng1, turf.lat, turf.lng).toFixed(1);
              return (
                <div
                  key={turf.id}
                  onClick={() => {
                    app.setActiveTurfId(turf.id);
                    app.setView('turf_details');
                  }}
                  className="glass-card tm-card-hover overflow-hidden flex cursor-pointer shrink-0 group !p-0"
                >
                  <TurfImage turf={turf} className="w-28 h-24 self-stretch object-cover group-hover:scale-105 transition-transform duration-500 rounded-l-2xl" />
                  <div className="p-3 text-left flex-grow">
                    <span className="tm-pill text-[8px] py-0.5 px-2">{turf.city}</span>
                    <h4 className="font-extrabold text-sm text-brand-forest mt-1.5 truncate">{turf.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-slate-400 font-bold">
                      <span>⭐ {turf.rating}</span>
                      <span>•</span>
                      <span>📍 {dist} km away</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      <span className="text-[8px] text-slate-400 font-semibold">Hourly Booking</span>
                      <span className="text-xs font-extrabold text-brand-forest">₹{turf.pricePerHour}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Map */}
        <div className={`w-full lg:w-[55%] xl:w-[60%] flex-grow relative bg-slate-100 overflow-hidden flex-col min-h-[50vh] lg:min-h-0 ${app.searchViewMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          <TurfMapBase center={center} resizeTrigger={app.searchViewMode}>
            <Marker position={center} icon={userIcon} zIndexOffset={100} />
            {filteredList.map((turf) => (
              <Marker
                key={turf.id}
                position={[turf.lat, turf.lng]}
                icon={createTurfIcon(turf, app.selectedTurfForPreview?.id === turf.id)}
                eventHandlers={{
                  click: () => app.setSelectedTurfForPreview(turf),
                }}
              />
            ))}
          </TurfMapBase>

          {app.selectedTurfForPreview && (
            <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:w-80 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-3 z-[500] animate-fade-in text-brand-text">
              <TurfImage turf={app.selectedTurfForPreview} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-grow text-left min-w-0">
                <h4 className="font-extrabold text-xs text-brand-forest truncate">{app.selectedTurfForPreview.name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  ⭐ {app.selectedTurfForPreview.rating} • {app.getDistance(lat1, lng1, app.selectedTurfForPreview.lat, app.selectedTurfForPreview.lng).toFixed(1)} km away
                </p>
                <span className="text-[10px] font-bold text-brand-grassDeep leading-none mt-1 block">
                  Starting ₹{app.selectedTurfForPreview.pricePerHour}/hr
                </span>
              </div>
              <button
                onClick={() => {
                  app.setActiveTurfId(app.selectedTurfForPreview.id);
                  app.setView('turf_details');
                }}
                className="px-3 py-2 tm-btn-primary font-extrabold rounded-xl text-[10px] cursor-pointer shrink-0"
              >
                Book
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          onClick={() => app.setSearchViewMode(app.searchViewMode === 'list' ? 'map' : 'list')}
          className="inline-flex items-center gap-2 px-4 py-2.5 tm-btn-primary font-semibold rounded-full text-xs shadow-lg transition active:scale-95"
        >
          {app.searchViewMode === 'list' ? (
            <><Map className="w-4 h-4" /> Map</>
          ) : (
            <><List className="w-4 h-4" /> List</>
          )}
        </button>
      </div>

      {app.showFilterSheet && (
        <div className="absolute inset-0 bg-black/60 z-40 animate-fade-in flex items-end justify-center">
          <div className="w-full bg-white rounded-t-[32px] p-5 space-y-4 animate-slide-in shadow-2xl border-t border-slate-100 max-h-[80%] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-brand-forest font-display uppercase tracking-wider">Search Filters</h3>
              <button onClick={() => app.setShowFilterSheet(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sports Category</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'football', 'cricket', 'pickleball', 'badminton'].map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => app.setFilterSport(sp)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${app.filterSport === sp ? 'tm-chip-green' : 'tm-chip-neutral'}`}
                  >
                    {sp.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Date</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => app.setFilterDate(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${app.filterDate === d ? 'tm-chip-green' : 'tm-chip-neutral'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Preferred Time Lobbies</span>
                <span className="text-brand-forest font-bold">{app.filterTimeRange[0]}:00 - {app.filterTimeRange[1]}:00</span>
              </div>
              <input
                type="range"
                min="6"
                max="23"
                value={app.filterTimeRange[1]}
                onChange={(e) => app.setFilterTimeRange([app.filterTimeRange[0], parseInt(e.target.value, 10)])}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-forest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pitch Dimensions</label>
              <div className="flex gap-2 flex-wrap">
                {['all', '5v5', '7v7', 'Box Cricket'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => app.setFilterPitchSize(sz)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${app.filterPitchSize === sz ? 'tm-chip-green' : 'tm-chip-neutral'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Geofence radius</span>
                <span className="text-brand-forest font-bold">{app.filterRadius} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={app.filterRadius}
                onChange={(e) => app.setFilterRadius(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-forest"
              />
            </div>

            <button
              onClick={() => app.setShowFilterSheet(false)}
              className="w-full py-3.5 tm-btn-primary font-extrabold rounded-2xl text-xs cursor-pointer text-center uppercase tracking-wider"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

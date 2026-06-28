import React, { useState } from 'react';
import { MapPin, Calendar, Users, Shield, Check, Star, Share2, Lock, Clock, User, AlertTriangle, ArrowLeft, MessageSquare, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TurfImage from '../../components/ui/TurfImage';
import { IMAGES } from '../../data/images';

function resolveSlotStatus(app, slot) {
  // Return the real status synced from the backend in useAppState.js
  return slot.status;
}

export default function TurfDetailsPage() {
  const app = useApp();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const submitReview = () => {
    app.showToast('Review submitted successfully!', 'success');
    setShowReviewModal(false);
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <div className="animate-fade-in flex flex-col pb-32 text-left min-h-screen">
                      {/* Photo gallery hero section with swiping actions */}
                      {(() => {
                        const turfGallery = app.activeTurf.gallery?.length
                          ? app.activeTurf.gallery
                          : [
                              app.activeTurf.image,
                              "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=600",
                              "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=600",
                            ];
    
                        const nextImage = (e) => {
                          e.stopPropagation();
                          app.setGalleryImageIndex(prev => (prev + 1) % turfGallery.length);
                        };
    
                        const prevImage = (e) => {
                          e.stopPropagation();
                          app.setGalleryImageIndex(prev => (prev - 1 + turfGallery.length) % turfGallery.length);
                        };
    
                        return (
                          <div className="h-52 w-full relative group bg-slate-900 overflow-hidden">
                            <TurfImage
                              src={turfGallery[app.galleryImageIndex]}
                              turf={app.activeTurf}
                              fallback={IMAGES.arena}
                              className="w-full h-full object-cover transition-all duration-500 ease-out"
                            />
                            
                            {/* Swipe overlay chevrons */}
                            <button 
                              onClick={prevImage}
                              className="absolute top-1/2 left-3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                              </svg>
                            </button>
                            <button 
                              onClick={nextImage}
                              className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </button>
    
                            {/* Pagination Indicator Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                              {turfGallery.map((_, idx) => (
                                <span 
                                  key={idx} 
                                  className={`w-1.5 h-1.5 rounded-full transition-all duration-350 ${
                                    app.galleryImageIndex === idx ? 'bg-brand-primary w-3.5' : 'bg-white/60'
                                  }`}
                                />
                              ))}
                            </div>
    
                            {/* Back Arrow button */}
                            <button 
                              onClick={() => {
                                app.setView('home');
                                app.setSelectedSlotId(null);
                              }} 
                              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/70 transition"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            {/* Title & Info overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 p-4">
                              <span className="text-[9px] bg-brand-primary text-brand-forest font-extrabold uppercase px-2 py-0.5 rounded">
                                {app.activeTurf.city}
                              </span>
                              <h2 className="text-xl font-bold font-display text-white mt-1 leading-tight">{app.activeTurf.name}</h2>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                                <span className="flex items-center gap-1 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {app.activeTurf.rating}</span>
                                <span>•</span>
                                <span>{app.activeTurf.reviews} Reviews</span>
                                <span>•</span>
                                <span>📍 {app.activeTurf.distance} away</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
    
                      {/* Directions and Actions row */}
                      <div className="flex gap-2 p-3 glass-grass border-b border-brand-border/50 justify-around">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${app.activeTurf.lat},${app.activeTurf.lng}`, '_blank')}
                          className="flex items-center gap-1.5 px-4 py-2.5 tm-tint-green border text-[10px] font-bold rounded-full transition"
                        >
                          <MapPin className="w-3.5 h-3.5 text-brand-grassFresh" /> directions
                        </button>
                        <button 
                          onClick={() => navigator.clipboard?.writeText?.(window.location.href)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 border border-brand-border text-[10px] font-bold text-brand-muted rounded-full hover:bg-brand-grassPale transition"
                        >
                          <Share2 className="w-3.5 h-3.5" /> share
                        </button>
                        <button 
                          onClick={() => app.showToast('Venue manager will call you within 15 mins.', 'success', 'Contact requested')}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 border border-brand-border text-[10px] font-bold text-brand-muted rounded-full hover:bg-brand-grassPale transition"
                        >
                          <Clock className="w-3.5 h-3.5" /> contact
                        </button>
                      </div>
    
                      {/* Details Page Body Scroll */}
                      <div className="p-4 space-y-4">
                        
                        {/* Amenities circular cards icon grid */}
                        <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue Amenities</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {app.activeTurf.amenities.map((a, i) => {
                              let icon = '🟢';
                              if (a.toLowerCase().includes('parking')) icon = '🚗';
                              else if (a.toLowerCase().includes('shower')) icon = '🚿';
                              else if (a.toLowerCase().includes('floodlight')) icon = '💡';
                              else if (a.toLowerCase().includes('water')) icon = '💧';
                              else if (a.toLowerCase().includes('bibs')) icon = '🎽';
                              else if (a.toLowerCase().includes('cafe') || a.toLowerCase().includes('refreshment')) icon = '☕';
                              else if (a.toLowerCase().includes('lounge') || a.toLowerCase().includes('air condition')) icon = '❄️';
                              else if (a.toLowerCase().includes('rental') || a.toLowerCase().includes('equipment')) icon = '🎾';
                              else if (a.toLowerCase().includes('coaching')) icon = '🎓';
                              else if (a.toLowerCase().includes('first aid')) icon = '🏥';
    
                              return (
                                <div key={i} className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-100/60 rounded-2xl hover:bg-brand-primary/10 transition">
                                  <span className="text-xl mb-0.5">{icon}</span>
                                  <span className="text-[9px] font-extrabold text-slate-600 text-center truncate w-full">{a}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
    
                        {/* Booking Date Picker - Horizontal Calendar Strip */}
                        <div className="space-y-2 text-left">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Booking Date</h4>
                          {(() => {
                            const getNext7Days = () => {
                              const days = [];
                              const today = new Date();
                              const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              
                              for (let i = 0; i < 7; i++) {
                                const d = new Date(today);
                                d.setDate(today.getDate() + i);
                                
                                let label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekDays[d.getDay()];
                                let dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                days.push({ label, dateStr, key: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateStr });
                              }
                              return days;
                            };
    
                            return (
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {getNext7Days().map(d => {
                                  const isSelected = app.bookingDate === d.key;
                                  return (
                                    <button
                                      key={d.key}
                                      onClick={() => {
                                        app.setBookingDate(d.key);
                                        app.setSelectedSlotId(null);
                                      }}
                                      className={`px-4 py-2 rounded-xl border flex flex-col items-center min-w-[72px] transition-all duration-200 ${
                                        isSelected 
                                          ? 'tm-chip-green scale-105' 
                                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-85">{d.label}</span>
                                      <span className="text-[11px] font-extrabold mt-0.5">{d.dateStr}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
    
                        {/* Pitch Selector Tab Bar */}
                        <div className="space-y-2 text-left">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Arena / Pitch</h4>
                          {(() => {
                            const getPitchesForTurf = (turf) => {
                              if (turf.id === 'turf-1') {
                                return [
                                  { id: 'pitch-a', name: 'Pitch A (5v5 Football)', type: '5v5' },
                                  { id: 'pitch-b', name: 'Pitch B (7v7 Football)', type: '7v7' }
                                ];
                              } else if (turf.id === 'turf-2') {
                                return [
                                  { id: 'pitch-a', name: 'Main Arena (7v7)', type: '7v7' },
                                  { id: 'pitch-b', name: 'Cricket Cage (Box)', type: '5v5' }
                                ];
                              } else if (turf.id === 'turf-3') {
                                return [
                                  { id: 'pitch-a', name: 'Court 1 (Badminton)', type: 'Singles' },
                                  { id: 'pitch-b', name: 'Court 2 (5v5)', type: '5v5' }
                                ];
                              } else {
                                return [
                                  { id: 'pitch-a', name: 'Pickle Court 1', type: 'Singles' },
                                  { id: 'pitch-b', name: 'Pickle Court 2', type: 'Doubles' }
                                ];
                              }
                            };
    
                            const pitches = getPitchesForTurf(app.activeTurf);
    
                            return (
                              <div className="flex bg-slate-100 p-1 rounded-xl">
                                {pitches.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      app.setSelectedPitchId(p.id);
                                      app.setSelectedSlotId(null);
                                    }}
                                    className={`flex-grow py-2 text-center rounded-lg text-xs font-bold transition-all ${
                                      app.selectedPitchId === p.id 
                                        ? 'bg-white text-brand-forest shadow-xs font-extrabold' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
    
                        {/* Booking Slots Grid & Fully Booked Check */}
                        {(() => {
                          const currentSlots = app.activeTurf.slots.map((s) => ({
                            ...s,
                            status: resolveSlotStatus(app, s),
                          }));
    
                          const isSoldOut = currentSlots.every(s => s.status === 'booked');
    
                          if (isSoldOut) {
                            return (
                              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 animate-pulse">
                                <span className="text-lg">⚠️</span>
                                <div className="text-left space-y-1">
                                  <span className="font-extrabold text-xs text-amber-800 block">Completely Sold Out!</span>
                                  <span className="text-[10px] text-amber-700 block leading-normal">This arena has no open slots left for {app.bookingDate}. Check tomorrow&apos;s slots or choose a different pitch!</span>
                                </div>
                              </div>
                            );
                          }
    
                          return (
                            <div className="space-y-2 text-left">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Time Slots</h4>
                              
                              {/* Slot legend */}
                              <div className="flex gap-3 text-[8px] font-extrabold text-slate-400 mb-1">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-white border border-slate-200"></span> Available</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-50 border border-amber-500"></span> Active Split</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-100"></span> Booked</span>
                              </div>
    
                              <div className="grid grid-cols-2 gap-2">
                                {currentSlots.map(s => {
                                  const isBlocked = s.status === 'booked';
                                  const isSplit = s.status === 'split';
                                  const isSelected = app.selectedSlotId === s.id;
                                  
                                  const priceOverride = app.adminSlotPrices[s.id] || s.surgePrice || app.activeTurf.pricePerHour;
                                  const hasSurge = !!s.surgePrice || !!app.adminSlotPrices[s.id];
    
                                  // Find details of active split announcement
                                  const matchedSplit = isSplit && app.announcements.find(a => a.turfId === app.activeTurf.id && a.slotId === s.id && a.status === 'open');
    
                                  return (
                                    <button
                                      key={s.id}
                                      disabled={isBlocked}
                                      onClick={() => app.setSelectedSlotId(s.id)}
                                      className={`p-2.5 rounded-xl border text-left transition duration-200 relative flex flex-col justify-between ${
                                        isBlocked 
                                          ? 'bg-slate-100 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed line-through'
                                          : isSelected
                                            ? isSplit
                                              ? 'bg-amber-500/20 border-amber-500 text-amber-900 shadow-glow'
                                              : 'bg-brand-primary/20 border-brand-primary text-brand-forest shadow-glow'
                                            : isSplit
                                              ? 'bg-amber-50/50 border-amber-500/60 text-amber-800'
                                              : 'bg-white border-slate-200 hover:border-brand-primary'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center w-full">
                                        <span className="text-[10px] font-bold">{s.time.split(' - ')[0]}</span>
                                        {isBlocked ? (
                                          <span className="text-[8px] font-extrabold uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Sold Out</span>
                                        ) : isSplit ? (
                                          <span className="text-[8px] font-extrabold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">Split Lobby</span>
                                        ) : (
                                          <span className="text-[9px] font-extrabold text-brand-forest">₹{priceOverride}</span>
                                        )}
                                      </div>
                                      
                                      {isSplit && !isBlocked && matchedSplit && (
                                        <div className="mt-1 flex justify-between items-center w-full">
                                          <span className="text-[7.5px] text-amber-600 font-extrabold uppercase">👥 {matchedSplit.playersNeeded} spots left</span>
                                          <span className="text-[8.5px] font-black text-amber-700">₹{matchedSplit.costPerHead}</span>
                                        </div>
                                      )}
    
                                      {!isSplit && hasSurge && !isBlocked && (
                                        <span className="text-[7px] text-amber-600 font-extrabold uppercase mt-1">🔥 Surge Hour Pricing</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {(() => {
                                if (!app.selectedSlotId) return null;
                                const slot = currentSlots.find((s) => s.id === app.selectedSlotId);
                                if (!slot || slot.status === 'booked') return null;

                                const matchedSplit = slot.status === 'split'
                                  && app.announcements.find(
                                    (a) => a.turfId === app.activeTurf.id && a.slotId === slot.id && a.status === 'open',
                                  );

                                const barClass = 'mt-3 glass-grass border border-brand-border rounded-[24px] p-4 flex items-center justify-between shadow-premium animate-fade-in';

                                if (matchedSplit) {
                                  return (
                                    <div className={barClass}>
                                      <div className="text-left min-w-0 flex-1">
                                        <span className="text-[9px] text-amber-600 block font-black uppercase tracking-wider">👥 Join Split Lobby</span>
                                        <span className="font-extrabold text-[12px] text-slate-800 block truncate">
                                          {app.bookingDate}, {slot.time.split(' - ')[0]}
                                        </span>
                                        <span className="text-[9.5px] text-slate-400 block font-semibold">
                                          Host: {matchedSplit.hostName} ({matchedSplit.roster.length} joined)
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => app.joinSplitGame(matchedSplit.id)}
                                        className="ml-3 shrink-0 px-5 py-3 tm-btn-grass font-extrabold rounded-2xl text-xs transition shadow-pill flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Users className="w-4 h-4" /> Join Split (₹{matchedSplit.costPerHead})
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <div className={barClass}>
                                    <div className="text-left min-w-0 flex-1">
                                      <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Selected timeline</span>
                                      <span className="font-extrabold text-[12px] text-brand-forest block">
                                        {app.bookingDate}, {slot.time.split(' - ')[0]}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block font-medium">
                                        Pitch: {app.selectedPitchId === 'pitch-a' ? 'Pitch A' : 'Pitch B'}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => app.openCheckoutModal()}
                                      className="ml-3 shrink-0 px-6 py-3 tm-btn-grass font-extrabold rounded-2xl text-sm shadow-pill cursor-pointer transition"
                                    >
                                      Book Now
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
    
                        {/* Venue Guidelines */}
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/60 text-left">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-brand-forest" /> Arena Booking Guidelines
                          </h4>
                          <ul className="list-disc pl-4 text-[9.5px] text-slate-500 space-y-1">
                            {app.activeTurf.rules.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left mt-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-brand-forest" /> Turf Reviews
                            </h4>
                            <button 
                              onClick={() => setShowReviewModal(true)}
                              className="text-[9px] font-bold text-brand-grassDeep border border-brand-grassFresh px-2 py-1 rounded hover:bg-brand-grassPale transition"
                            >
                              Write Review
                            </button>
                          </div>

                          {/* Dummy Reviews */}
                          <div className="space-y-3 mt-2">
                            <div className="border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs text-brand-forest">Rahul C.</span>
                                <span className="flex text-amber-400"><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /></span>
                                <span className="text-[8px] text-slate-400 ml-auto">2 days ago</span>
                              </div>
                              <p className="text-[10px] text-slate-600">Great turf quality. The 7v7 pitch is very spacious and lighting is perfect for night matches.</p>
                            </div>
                            <div className="pb-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs text-brand-forest">Amit S.</span>
                                <span className="flex text-amber-400"><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3" /></span>
                                <span className="text-[8px] text-slate-400 ml-auto">1 week ago</span>
                              </div>
                              <p className="text-[10px] text-slate-600">Good place but parking was a bit crowded. Pitch itself is fantastic.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Modal */}
                      {showReviewModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <div className="bg-white w-full max-w-sm rounded-3xl p-5 relative shadow-2xl animate-fade-in">
                            <button 
                              onClick={() => setShowReviewModal(false)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            <h3 className="font-extrabold text-lg text-brand-forest mb-4">Rate {app.activeTurf.name}</h3>
                            
                            <div className="flex gap-2 justify-center mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                </button>
                              ))}
                            </div>

                            <textarea 
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Share your experience (pitch quality, facilities, etc.)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-grassFresh min-h-[100px] resize-none mb-4"
                            />

                            <button 
                              onClick={submitReview}
                              disabled={!reviewText.trim()}
                              className="w-full py-3 tm-btn-primary font-extrabold rounded-xl disabled:opacity-50"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
  );
}

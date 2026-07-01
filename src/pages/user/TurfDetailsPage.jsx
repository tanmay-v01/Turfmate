import React, { useState } from 'react';
import { MapPin, Calendar, Users, Shield, Check, Star, Share2, Lock, Clock, User, AlertTriangle, ArrowLeft, MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  React.useEffect(() => {
    if (app.activeTurf?.id) {
      setLoadingReviews(true);
      fetch(`/api/turfs/${app.activeTurf.id}/reviews`)
        .then(res => res.json())
        .then(data => {
          setReviews(data.reviews || []);
          setLoadingReviews(false);
        })
        .catch(() => setLoadingReviews(false));
    }
  }, [app.activeTurf?.id]);

  const submitReview = async () => {
    try {
      const res = await fetch(`/api/turfs/${app.activeTurf.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${app.token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewText })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      const newReview = await res.json();
      
      app.showToast('Review submitted successfully!', 'success');
      setShowReviewModal(false);
      setReviewText('');
      setReviewRating(5);
      
      // Update local state
      setReviews(prev => [{
        id: newReview.id,
        userId: newReview.userId,
        userName: app.userProfile?.name || 'You',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: Date.now()
      }, ...prev]);
    } catch (err) {
      app.showToast('Failed to submit review', 'error');
    }
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
                              className="absolute top-1/2 left-3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-slate-800 flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                              </svg>
                            </button>
                            <button 
                              onClick={nextImage}
                              className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-slate-800 flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition"
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
                                    app.galleryImageIndex === idx ? 'bg-emerald-500 w-3.5' : 'bg-white/60'
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
                              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 text-slate-800 flex items-center justify-center backdrop-blur-xs hover:bg-black/70 transition"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            {/* Title & Info overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 p-4">
                              <span className="text-[9px] bg-emerald-500 text-slate-800 font-extrabold uppercase px-2 py-0.5 rounded">
                                {app.activeTurf.city}
                              </span>
                              <h2 className="text-xl font-bold font-display text-slate-800 mt-1 leading-tight">{app.activeTurf.name}</h2>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                                <span className="flex items-center gap-1 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {app.activeTurf.rating}</span>
                                <span>•</span>
                                <span>{reviews.length || app.activeTurf.reviews} Reviews</span>
                                <span>•</span>
                                <span>📍 {app.activeTurf.distance} away</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
    
                      {/* Directions and Actions row */}
                      <div className="flex gap-2 p-3 glass-grass border-b border-slate-200/50 justify-around">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${app.activeTurf.lat},${app.activeTurf.lng}`, '_blank')}
                          className="flex items-center gap-1.5 px-4 py-2.5 tm-tint-green border text-[10px] font-bold rounded-full transition"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> directions
                        </button>
                        <button 
                          onClick={() => navigator.clipboard?.writeText?.(window.location.href)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 border border-slate-200 text-[10px] font-bold text-slate-500 rounded-full hover:bg-emerald-50 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" /> share
                        </button>
                        <button 
                          onClick={() => app.showToast('Venue manager will call you within 15 mins.', 'success', 'Contact requested')}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 border border-slate-200 text-[10px] font-bold text-slate-500 rounded-full hover:bg-emerald-50 transition"
                        >
                          <Clock className="w-3.5 h-3.5" /> contact
                        </button>
                      </div>
    
                      {/* Details Page Body Scroll */}
                      <div className="p-4 space-y-4">
                        
                        {/* Amenities circular cards icon grid */}
                        <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-left">
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
                                <div key={i} className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl hover:bg-emerald-50 transition">
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
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      key={d.key}
                                      onClick={() => {
                                        app.setBookingDate(d.key);
                                        app.setSelectedSlotId(null);
                                      }}
                                      className={`px-4 py-2 rounded-xl border flex flex-col items-center min-w-[72px] transition-all duration-200 ${
                                        isSelected 
                                          ? 'border-brand-grassFresh bg-brand-grassDeep/10 text-slate-800 shadow-sm' 
                                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className="text-[10px] font-extrabold uppercase">{d.label}</span>
                                      <span className={`text-[9px] font-bold ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>{d.dateStr}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
    
                        {/* Live Slot Engine */}
                        {(() => {
                          const currentSlots = app.activeTurf.slots || [];
                          if (currentSlots.length === 0) {
                            return (
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="w-6 h-6 text-slate-400 mb-2" />
                                <p className="text-sm font-bold text-slate-600">No Slots Available</p>
                                <p className="text-[10px] text-slate-400">Try selecting a different date.</p>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-2 mt-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                                <span>Select Time Slot</span>
                                <span className="text-emerald-600">₹{app.activeTurf.pricePerHour}/hr</span>
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {currentSlots.map(slot => {
                                  const isSelected = app.selectedSlotId === slot.id;
                                  const rStatus = resolveSlotStatus(app, slot);
                                  
                                  const isLocked = rStatus === 'booked' || rStatus === 'locked';
                                  const isSplit = rStatus === 'split';
                                  
                                  return (
                                    <button
                                      key={slot.id}
                                      onClick={() => {
                                        if (isLocked) return;
                                        app.setSelectedSlotId(slot.id);
                                        app.setCheckoutOption(isSplit ? 'split' : 'private');
                                        if (!isSplit) {
                                          app.setSplitPlayersCount(10);
                                          app.setCheckoutInviteGroupId('');
                                        }
                                      }}
                                      className={`p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-center min-h-[64px] ${
                                        isLocked
                                          ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                          : isSelected
                                            ? 'border-brand-grassFresh tm-tint-green shadow-sm scale-[1.02]'
                                            : isSplit
                                              ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                                              : 'border-slate-200 bg-white hover:border-slate-300'
                                      }`}
                                    >
                                      {isLocked && <Lock className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-300" />}
                                      {isSelected && <Check className="absolute right-2 top-2 w-3.5 h-3.5 text-emerald-600" />}
                                      
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[11px] font-black ${isSelected ? 'text-slate-800' : isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                          {slot.time.split(' - ')[0]}
                                        </span>
                                        <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          isSelected ? 'bg-brand-grassDeep text-slate-800' 
                                          : isSplit ? 'bg-amber-100 text-amber-700' 
                                          : isLocked ? 'bg-slate-200 text-slate-500' 
                                          : 'bg-slate-100 text-slate-500'
                                        }`}>
                                          {rStatus === 'booked' ? 'sold out' : rStatus === 'locked' ? 'in cart' : rStatus}
                                        </span>
                                      </div>
                                      
                                      {slot.surgePrice && !isLocked && (
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

                                const barClass = 'mt-3 glass-grass border border-slate-200 rounded-[24px] p-4 flex items-center justify-between shadow-premium animate-fade-in';

                                if (matchedSplit) {
                                  return (
                                    <div className={barClass}>
                                      <div className="text-left min-w-0 flex-1">
                                        <span className="text-[9px] text-amber-600 block font-black uppercase tracking-wider">👥 Join Split Lobby</span>
                                        <span className="font-extrabold text-[12px] text-slate-700 block truncate">
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
                                      <span className="font-extrabold text-[12px] text-slate-800 block">
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
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-left">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-slate-800" /> Arena Booking Guidelines
                          </h4>
                          <ul className="list-disc pl-4 text-[9.5px] text-slate-500 space-y-1">
                            {app.activeTurf.rules.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left mt-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-800" /> Turf Reviews
                            </h4>
                            <button 
                              onClick={() => setShowReviewModal(true)}
                              className="text-[9px] font-bold text-emerald-600 border border-brand-grassFresh px-2 py-1 rounded hover:bg-emerald-50 transition"
                            >
                              Write Review
                            </button>
                          </div>

                          <div className="space-y-3 mt-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                            {loadingReviews ? (
                              <p className="text-xs text-slate-400 text-center py-4">Loading reviews...</p>
                            ) : reviews.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4 italic">No reviews yet. Be the first!</p>
                            ) : (
                              reviews.map(r => (
                                <div key={r.id} className="border-b border-slate-200 pb-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-xs text-slate-800">{r.userName}</span>
                                    <span className="flex text-amber-400">
                                      {Array(5).fill(0).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                                      ))}
                                    </span>
                                    <span className="text-[8px] text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600">{r.comment}</p>
                                </div>
                              ))
                            )}
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

                            <h3 className="font-extrabold text-lg text-slate-800 mb-4">Rate {app.activeTurf.name}</h3>
                            
                            <div className="flex gap-2 justify-center mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
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

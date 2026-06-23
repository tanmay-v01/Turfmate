import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Send, Sparkles, Check, Smartphone, Flame, Trophy } from 'lucide-react';
import { SPORTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { broadcastsApi } from '../../services/broadcastsApi';

export default function OwnerBroadcast({ ownedTurfs }) {
  const app = useApp();

  const [category, setCategory] = useState('PROMO'); // 'PROMO', 'EVENT', 'UPDATE'
  const [headline, setHeadline] = useState('');
  const [message, setMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [cta, setCta] = useState('Book Now');
  const [expirationHours, setExpirationHours] = useState('6'); // hours
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedTurfId, setSelectedTurfId] = useState(ownedTurfs[0]?.id || 'turf-1');
  const [ownerCampaigns, setOwnerCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadOwnerCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const res = await broadcastsApi.listMine();
      const active = (res.broadcasts || []).filter(
        (b) => !b.isExpired && b.broadcastStatus === 'ACTIVE'
      );
      setOwnerCampaigns(active);
    } catch (err) {
      console.warn('[broadcasts] load failed:', err.message);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerCampaigns();
  }, [loadOwnerCampaigns]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!headline.trim() || !message.trim()) {
      app.showToast('Please fill out the Headline and Message.', 'error');
      return;
    }

    const targetTurf = ownedTurfs.find(t => t.id === selectedTurfId) || ownedTurfs[0];
    setPublishing(true);
    try {
      const res = await broadcastsApi.create({
        turfLegacyId: targetTurf?.id,
        category,
        headline: headline.trim(),
        bodyText: message.trim(),
        promoCode: promoCode.trim() || undefined,
        ctaText: cta,
        sport: selectedSport,
        expirationHours: Number(expirationHours) || 6,
      });
      const newAnn = res.broadcast;
      if (newAnn) {
        app.setAnnouncements((prev) => [newAnn, ...prev.filter((a) => a.broadcastId !== newAnn.broadcastId)]);
      }
      await app.refreshLockerFeed?.();
      await loadOwnerCampaigns();
      app.showToast('Broadcast published to Locker Room!', 'success', 'Campaign Active');
      setHeadline('');
      setMessage('');
      setPromoCode('');
    } catch (err) {
      app.showToast(err.message || 'Failed to publish broadcast', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const selectedSportMeta = SPORTS.find(s => s.id === selectedSport) || SPORTS[0];
  const targetTurfObj = ownedTurfs.find(t => t.id === selectedTurfId) || ownedTurfs[0];

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-brand-forest">Community Broadcasts</h2>
          <p className="text-sm font-bold text-slate-500">List tournament announcements, flash sales, and venue news</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Views this Month</span>
            <span className="text-sm font-black text-brand-forest">4,200</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Conversions</span>
            <span className="text-sm font-black text-brand-forest">18 bookings</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel */}
        <form onSubmit={handlePublish} className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-brand-grassPale flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-brand-grassDeep" />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-forest text-sm">Campaign Builder</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Reaches local player feed within 10km</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="dash-input text-xs"
              >
                <option value="PROMO">Flash Sale (Discount)</option>
                <option value="EVENT">Tournament Announcement</option>
                <option value="UPDATE">General Update</option>
              </select>
            </div>
            
            <div>
              <label className="dash-label">Target Sport</label>
              <select
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                className="dash-input text-xs"
              >
                {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Target Venue</label>
              <select
                value={selectedTurfId}
                onChange={e => setSelectedTurfId(e.target.value)}
                className="dash-input text-xs"
              >
                {ownedTurfs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="dash-label">Campaign Expiry</label>
              <select
                value={expirationHours}
                onChange={e => setExpirationHours(e.target.value)}
                className="dash-input text-xs"
              >
                <option value="1">1 Hour</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="dash-label flex justify-between">
              <span>Headline</span>
              <span className="text-[10px] text-slate-400 lowercase">{40 - headline.length} chars left</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value.slice(0, 40))}
              placeholder="e.g. 50% Off Afternoon Slots Today!"
              className="dash-input text-xs"
              required
            />
          </div>

          <div>
            <label className="dash-label flex justify-between">
              <span>Message / Details</span>
              <span className="text-[10px] text-slate-400 lowercase">{200 - message.length} chars left</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 200))}
              placeholder="e.g. Rainout slots available at Pitch B. Use code below to claim."
              rows={3}
              className="dash-input resize-none text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dash-label">Promo Code (Optional)</label>
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. RAIN50"
                className="dash-input text-xs uppercase font-mono"
              />
            </div>
            
            <div>
              <label className="dash-label">Call to Action (CTA)</label>
              <select
                value={cta}
                onChange={e => setCta(e.target.value)}
                className="dash-input text-xs"
              >
                <option value="Book Now">Book Now</option>
                <option value="Claim Offer">Claim Offer</option>
                <option value="Join Chat">Join Chat</option>
                <option value="View Details">View Details</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={publishing} className="w-full tm-btn-grass py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60">
            <Send className="w-4 h-4" /> {publishing ? 'Publishing…' : 'Broadcast to Players'}
          </button>
        </form>

        {/* Live Mobile Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Locker Room Preview (Live)</span>
          </div>

          {/* iPhone Mockup Frame */}
          <div className="relative border-[10px] border-slate-900 rounded-[38px] shadow-2xl overflow-hidden w-[290px] h-[520px] bg-slate-100 flex flex-col">
            {/* Speaker & camera slot */}
            <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center items-center z-50">
              <div className="w-16 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Mobile View Screen container */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-4 px-2 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Locker Room Feed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              </div>

              {/* Mock post card matching LockerRoomPage.jsx */}
              <div className={`rounded-2xl bg-white overflow-hidden shadow-sm border text-left ${
                category === 'PROMO'
                  ? 'border-amber-400 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 shadow-[0_4px_12px_rgba(245,158,11,0.1)]'
                  : 'border-slate-200'
              }`}>
                {/* Image */}
                <div className="relative h-20 bg-slate-200">
                  <img src={targetTurfObj?.image} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-2 px-1.5 py-0.5 rounded-full bg-white/90 text-[8px] font-bold text-brand-forest">
                    {selectedSportMeta.icon} {category === 'PROMO' ? 'Discount Offer' : category === 'EVENT' ? 'Tournament' : 'Announcement'}
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <img src={targetTurfObj?.image} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[10px] text-brand-forest truncate max-w-[120px]">{targetTurfObj?.name || 'Venue'}</span>
                        <span className="px-1 py-0.5 rounded bg-amber-100 text-[6px] font-black text-amber-800 uppercase">partner</span>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-0.5">0.8 km · Just now</p>
                    </div>
                  </div>

                  {/* Headline & message */}
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-black text-brand-forest leading-snug">
                      {headline || 'Offer Headline Here...'}
                    </p>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      {message || 'Type message in the form builder to update live...'}
                    </p>
                    {category === 'PROMO' && promoCode && (
                      <p className="text-[9px] font-mono font-bold text-amber-700 mt-1 uppercase">
                        Use Code: <span className="bg-amber-100 px-1 py-0.5 rounded">{promoCode}</span>
                      </p>
                    )}
                  </div>

                  {/* Action CTA */}
                  <button type="button" className="w-full py-2 bg-brand-forest text-white rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1">
                    <span>{cta}</span>
                  </button>
                </div>
              </div>

              {/* Dummy surrounding post */}
              <div className="rounded-2xl bg-white border border-slate-200 p-3 space-y-2 opacity-50 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[9px] text-slate-600">Suraj K.</p>
                    <p className="text-[7px] text-slate-400">1.2 km · 2h ago</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500">Anyone up for Box Cricket tonight at 9 PM?</p>
              </div>

            </div>

            {/* Bottom Bar indicator */}
            <div className="h-4 bg-slate-900 flex justify-center items-center shrink-0">
              <div className="w-20 h-1 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-extrabold text-brand-forest text-sm mb-4">Active Campaigns</h3>
        {loadingCampaigns ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-bold">
            Loading campaigns…
          </div>
        ) : ownerCampaigns.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-bold">
            No active broadcasts. Post one using the builder above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerCampaigns.map(ann => {
              const isPromoAnn = ann.contentType === 'PROMO' || ann.isPromo || ann.category === 'PROMO';
              return (
                <div key={ann.id} className={`bg-white border p-4 rounded-2xl flex items-start gap-3 relative ${
                  isPromoAnn ? 'border-amber-200 bg-amber-50/5' : 'border-slate-200'
                }`}>
                  <span className="text-2xl mt-1">{ann.sportIcon || '📢'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-brand-forest text-sm truncate">{ann.turfName || 'Venue Announcement'}</p>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        isPromoAnn ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ann.category || 'Promo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-2">{ann.text}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">
                      {ann.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

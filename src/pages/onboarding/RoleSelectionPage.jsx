import React, { useState } from 'react';
import { ChevronRight, Trophy, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPER_ADMIN_PHONE } from '../../data/ownersData';
import { avatar } from '../../data/images';
import GrassBackground from '../../components/ui/GrassBackground';
import TurfMateLogo from '../../components/ui/TurfMateLogo';
import Button from '../../components/ui/Button';

export default function RoleSelectionPage() {
  const app = useApp();

  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'PLAYER',
      icon: Trophy,
      emoji: '⚽',
      // High-quality action shot of players running on premium turf under stadium floodlights
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
      pill: 'squad player',
      title: 'i wanna play',
      description: 'book turfs, split fees, join public matches. main character energy.',
      next: 'profile_setup',
    },
    {
      id: 'OWNER',
      icon: Building2,
      emoji: '🏟️',
      // High-quality premium illuminated turf field stadium view at night
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800',
      pill: 'venue partner',
      title: 'i run a turf',
      description: 'list your arena, manage multiple turfs, get 90% of every app booking.',
      next: 'owner_business',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 relative py-12 px-4 flex flex-col justify-center overflow-hidden">
      <GrassBackground />

      <div className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-12">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-primary/25 rounded-[18px] blur-md group-hover:blur-xl transition-all duration-300" />
              <TurfMateLogo size="md" className="animate-float relative z-10" />
            </div>
          </div>
          <span className="tm-info-chip text-[10px] font-black uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-brand-primary animate-ping" />
            onboarding · step 1 of 4
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-brand-forest lowercase tracking-tight leading-none mt-2">
            pick your vibe
          </h1>
          <p className="text-sm text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
            how you rolling on TurfMate? select your lane to get started
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl px-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
              }}
              className={`w-full relative rounded-[32px] overflow-hidden text-left group border transition-all duration-500 ease-out h-[360px] flex flex-col justify-end ${
                selectedRole === role.id
                  ? 'border-brand-primary border-4 shadow-[0_20px_50px_rgba(74,222,128,0.35)] scale-[1.02]'
                  : 'border-slate-200/50 hover:border-brand-primary/50 shadow-md hover:shadow-[0_20px_50px_rgba(74,222,128,0.25)] active:scale-[0.99]'
              }`}
            >
              {/* Background Image with Zoom */}
              <img
                src={role.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent group-hover:from-slate-950/90 transition-colors duration-500" />
              
              {/* Content Card Info */}
              <div className="relative m-4 p-5 rounded-[24px] backdrop-blur-md bg-slate-950/60 border border-white/10 text-white z-10 transition-all duration-300 group-hover:bg-slate-950/75 group-hover:border-brand-primary/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/25 border border-brand-primary/30 text-[10px] font-black text-brand-primary uppercase tracking-wider shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    {role.emoji} {role.pill}
                  </span>
                  
                  {/* Icon Frame */}
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-300">
                    <role.icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-display font-black text-white lowercase leading-tight group-hover:text-brand-primary transition-colors duration-300">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                {/* Micro Action Button */}
                <div className="flex justify-end pt-1">
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-brand-forest group-hover:translate-x-1.5 shadow-md">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 w-full max-w-xs px-2 flex justify-center">
          <Button
            variant="grass"
            size="lg"
            className="w-full text-center"
            disabled={!selectedRole}
            onClick={() => {
              const selectedRoleData = roles.find((r) => r.id === selectedRole);
              app.updateOnboardingData({ role: selectedRole });
              app.navigateTo(selectedRoleData.next);
            }}
          >
            Continue
          </Button>
        </div>

        {/* Hidden Admin Skip */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => {
              const profile = {
                isLoggedIn: true,
                role: 'SUPER_ADMIN',
                name: 'Platform Admin',
                phone: SUPER_ADMIN_PHONE,
                avatar: avatar('SuperAdmin'),
              };
              app.setUserProfile(profile);
              localStorage.setItem('tm_profile', JSON.stringify(profile));
              app.setView('super_admin');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-brand-forest transition uppercase tracking-widest border-b border-dashed border-slate-300 hover:border-brand-forest pb-0.5"
          >
            [ hidden: access super admin god mode ]
          </button>
        </div>

      </div>
    </div>
  );
}

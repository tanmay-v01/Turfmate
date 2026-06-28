import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users, DollarSign, ArrowRight, ShieldCheck, Play, Award, UserCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import { PageTransition } from '../../components/ui/PageTransition';
import EmptyState from '../../components/ui/EmptyState';

const MOCK_SQUAD_MEMBERS = [
  { id: 'm1', name: 'Sneha Rao', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha' },
  { id: 'm2', name: 'Vikram Singh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram' },
  { id: 'm3', name: 'Aniket Sawant', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aniket' },
  { id: 'm4', name: 'Joshua D', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joshua' },
  { id: 'm5', name: 'Amit Sharma', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amit' }
];

export default function TournamentsPage() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState('explore'); // explore, my-registrations
  const [selectedTournament, setSelectedTournament] = useState(null);
  
  // Registration Flow
  const [isRegistering, setIsRegistering] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSquad, setSelectedSquad] = useState([]);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: team details, 2: select squad, 3: payment, 4: success
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState(() => {
    const saved = localStorage.getItem('tm_registered_tournaments');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredTournaments = (app.tournaments || []).filter(t => selectedSport === 'all' || t.sport === selectedSport);

  const handleOpenRegister = (tournament) => {
    setSelectedTournament(tournament);
    setIsRegistering(true);
    setRegistrationStep(1);
    setTeamName('');
    setSelectedSquad([]);
  };

  const handleToggleSquadMember = (member) => {
    if (selectedSquad.find(m => m.id === member.id)) {
      setSelectedSquad(selectedSquad.filter(m => m.id !== member.id));
    } else {
      setSelectedSquad([...selectedSquad, member]);
    }
  };

  const handleProceedPayment = () => {
    if (!teamName.trim()) {
      app.showToast('Please enter a team name', 'error');
      return;
    }
    if (selectedSquad.length < 3) {
      app.showToast('Please select at least 3 squad players', 'error');
      return;
    }
    setRegistrationStep(3);
  };

  const handleConfirmPayment = async () => {
    setIsProcessingPay(true);
    const success = await app.processTournamentPayment(selectedTournament);
    if (success) {
      setRegistrationStep(4);
      const newReg = {
        tournamentId: selectedTournament.id,
        tournamentName: selectedTournament.name,
        sport: selectedTournament.sport,
        teamName: teamName,
        players: [app.userProfile.name, ...selectedSquad.map(s => s.name)],
        date: selectedTournament.date,
        location: selectedTournament.location,
        banner: selectedTournament.banner,
        registeredAt: new Date().toLocaleDateString()
      };
      
      const updatedRegs = [...myRegistrations, newReg];
      setMyRegistrations(updatedRegs);
      localStorage.setItem('tm_registered_tournaments', JSON.stringify(updatedRegs));
      app.showToast('Team registered successfully!', 'success');
      app.triggerConfetti();
    } else {
      setIsProcessingPay(false);
    }
  };

  const isAlreadyRegistered = (tourneyId) => {
    return myRegistrations.some(r => r.tournamentId === tourneyId);
  };

  return (
    <div className="animate-fade-up pb-12">
      <PageHeader
        title="Tournaments"
        subtitle="Compete with regional squads"
        onBack={() => app.setView('home')}
        badge="leagues"
      />

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 gap-1 mb-6 shadow-sm">
        <button
          onClick={() => { setActiveTab('explore'); setSelectedTournament(null); }}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition ${
            activeTab === 'explore' ? 'tm-chip-green' : 'text-slate-500 hover:text-brand-forest'
          }`}
        >
          Explore Championships
        </button>
        <button
          onClick={() => { setActiveTab('my-registrations'); setSelectedTournament(null); }}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition relative ${
            activeTab === 'my-registrations' ? 'tm-chip-green' : 'text-slate-500 hover:text-brand-forest'
          }`}
        >
          My Registrations
          {myRegistrations.length > 0 && (
            <span className="absolute top-2 right-4 w-4 h-4 bg-brand-primary text-brand-forest text-[9px] font-black rounded-full flex items-center justify-center">
              {myRegistrations.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'explore' && !selectedTournament && (
        <div className="space-y-6">
          {filteredTournaments.map(t => {
            const registered = isAlreadyRegistered(t.id);
            return (
              <div key={t.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                <div className="h-40 relative">
                  <img src={t.banner} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full text-white ${
                        t.status === 'open' ? 'bg-emerald-500' : t.status === 'active' ? 'bg-amber-500' : 'bg-slate-500'
                      }`}>
                        {t.status === 'open' ? 'Registration Open' : t.status === 'active' ? 'Tournament Live' : 'Ended'}
                      </span>
                      <span className="text-xl">{t.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">{t.name}</h3>
                      <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> {t.date}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prize Pool</p>
                      <p className="text-sm font-black text-brand-forest">₹{t.prizePool.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Entry Fee</p>
                      <p className="text-sm font-black text-slate-700">₹{t.entryFee}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Slots</p>
                      <p className="text-sm font-black text-slate-700">{t.registeredTeams} / {t.maxTeams}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.description}</p>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="flex-1 py-3 border border-slate-200 hover:border-brand-forest text-slate-700 hover:text-brand-forest text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4" /> View Details
                    </button>

                    {registered ? (
                      <span className="flex-1 bg-brand-primary/20 text-brand-forest text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-brand-forest" /> Registered
                      </span>
                    ) : t.status === 'open' ? (
                      <button
                        onClick={() => handleOpenRegister(t)}
                        className="flex-1 py-3 tm-btn-primary text-xs font-black rounded-xl transition flex items-center justify-center gap-1"
                      >
                        Register Team <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTournament(t)}
                        className="flex-1 py-3 bg-slate-100 text-slate-400 text-xs font-black rounded-xl cursor-default"
                      >
                        {t.status === 'active' ? 'Watch Live Brackets' : 'Championship Ended'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Tournament Details & Brackets */}
      {selectedTournament && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="text-xs font-bold text-slate-400 hover:text-brand-forest flex items-center gap-1 mb-2"
                >
                  &larr; Back to championships
                </button>
                <h2 className="text-xl font-black text-brand-forest">{selectedTournament.name}</h2>
                <p className="text-xs text-slate-400 font-bold capitalize mt-0.5">{selectedTournament.sport} Tournament</p>
              </div>
              <span className="text-2xl p-2.5 bg-slate-50 rounded-2xl">{selectedTournament.icon}</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{selectedTournament.description}</p>

            <div className="space-y-2 border-t border-b border-slate-100 py-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span><strong>Date:</strong> {selectedTournament.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span><strong>Location:</strong> {selectedTournament.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span><strong>Organizer:</strong> {selectedTournament.organizer}</span>
              </div>
            </div>

            {/* Bracket Visualizer Section */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-brand-forest flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Live Match Brackets
                </h3>
                <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedTournament.status === 'completed' ? 'Final Brackets' : 'In Progress'}
                </span>
              </div>

              {/* Bracket Render */}
              <div className="bg-slate-50 p-4 rounded-2xl overflow-x-auto no-scrollbar">
                <div className="flex min-w-[500px] justify-between items-center gap-4 py-2">
                  
                  {/* QUARTERFINALS */}
                  <div className="flex-1 space-y-3">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-center border-b border-slate-200/80 pb-1">Quarter Finals</p>
                    {selectedTournament.brackets.quarter.map((q) => (
                      <div key={q.id} className="bg-white border border-slate-100 rounded-xl p-2 text-[10px] shadow-sm space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${q.winner === q.teamA ? 'text-emerald-600 font-extrabold' : 'text-slate-600'}`}>{q.teamA}</span>
                          <span className="font-mono text-slate-400 font-black">{q.scoreA}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-50 pt-1">
                          <span className={`font-bold ${q.winner === q.teamB ? 'text-emerald-600 font-extrabold' : 'text-slate-600'}`}>{q.teamB}</span>
                          <span className="font-mono text-slate-400 font-black">{q.scoreB}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SEMIFINALS */}
                  <div className="flex-1 space-y-6">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-center border-b border-slate-200/80 pb-1">Semi Finals</p>
                    {selectedTournament.brackets.semi.map((s) => (
                      <div key={s.id} className="bg-white border border-slate-100 rounded-xl p-2 text-[10px] shadow-sm space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${s.winner === s.teamA ? 'text-emerald-600 font-extrabold' : 'text-slate-600'}`}>{s.teamA}</span>
                          <span className="font-mono text-slate-400 font-black">{s.scoreA ?? '-'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-50 pt-1">
                          <span className={`font-bold ${s.winner === s.teamB ? 'text-emerald-600 font-extrabold' : 'text-slate-600'}`}>{s.teamB}</span>
                          <span className="font-mono text-slate-400 font-black">{s.scoreB ?? '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FINALS */}
                  <div className="flex-1 space-y-12">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-center border-b border-slate-200/80 pb-1">Championship Final</p>
                    {selectedTournament.brackets.final.map((f) => (
                      <div key={f.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-[10px] shadow-md space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-amber-900">{f.teamA}</span>
                          <span className="font-mono font-black">{f.scoreA ?? '-'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-amber-100 pt-1">
                          <span className="font-black text-amber-900">{f.teamB}</span>
                          <span className="font-mono font-black">{f.scoreB ?? '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Actions inside details */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedTournament(null)}
                className="py-3 px-4 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Close Details
              </button>
              {isAlreadyRegistered(selectedTournament.id) ? (
                <span className="flex-1 bg-brand-primary/20 text-brand-forest text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-brand-forest" /> You are registered for this league
                </span>
              ) : selectedTournament.status === 'open' ? (
                <button
                  onClick={() => handleOpenRegister(selectedTournament)}
                  className="flex-1 py-3 tm-btn-primary text-xs font-black rounded-xl transition"
                >
                  Register Team (₹{selectedTournament.entryFee})
                </button>
              ) : (
                <span className="flex-1 bg-slate-100 text-slate-400 text-xs font-black py-3 rounded-xl flex items-center justify-center">
                  Registration Closed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registrations List */}
      {activeTab === 'my-registrations' && (
        <div className="p-4">
          {myRegistrations.length === 0 ? (
            <EmptyState 
              image="/images/empty_bookings.png"
              title="No Registrations Yet"
              description="You haven't registered your squad for any upcoming tournaments. Find one and claim victory!"
              actionText="Explore Tournaments"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            myRegistrations.map((reg, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 p-4 shadow-sm flex gap-4">
                <img src={reg.banner} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                      {reg.sport}
                    </span>
                    <h4 className="font-black text-brand-forest text-sm truncate mt-1">{reg.tournamentName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">Team: <span className="text-brand-forest font-black">{reg.teamName}</span></p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                    <Calendar className="w-3 h-3 text-slate-300" /> {reg.date}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <span className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest" />
                  </span>
                  <span className="text-[9px] text-slate-300 font-bold">Registered {reg.registeredAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {isRegistering && selectedTournament && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-brand-forest text-sm">Register Team Squad</h3>
                <p className="text-[10px] text-slate-400 font-bold">{selectedTournament.name}</p>
              </div>
              <button
                onClick={() => setIsRegistering(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* STEP PROGRESS BAR */}
              <div className="flex items-center justify-between gap-2 px-4 mb-4">
                {[1, 2, 3, 4].map(step => (
                  <React.Fragment key={step}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${
                      registrationStep >= step ? 'tm-chip-green !rounded-full w-8 h-8 !px-0' : 'tm-chip-neutral !rounded-full w-8 h-8 !px-0'
                    }`}>
                      {step === 4 && registrationStep === 4 ? <CheckCircle2 className="w-4 h-4" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 rounded-full transition ${
                        registrationStep > step ? 'bg-brand-forest' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* STEP 1: TEAM NAME */}
              {registrationStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Team Name</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Virar Strikers FC"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl flex gap-2.5 items-start">
                    <ShieldCheck className="w-5 h-5 text-brand-forest shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                      As team captain, you will host the squad booking. Team players will be notified to join your tournament roster.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!teamName.trim()) {
                        app.showToast('Please enter a team name', 'error');
                      } else {
                        setRegistrationStep(2);
                      }
                    }}
                    className="w-full py-3 tm-btn-primary text-xs font-black rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1"
                  >
                    Select Squad Players <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: SELECT SQUAD */}
              {registrationStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Squad (Min 3)</label>
                    <span className="text-xs text-brand-forest font-bold">{selectedSquad.length} selected</span>
                  </div>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {MOCK_SQUAD_MEMBERS.map(member => {
                      const isSelected = selectedSquad.find(m => m.id === member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleToggleSquadMember(member)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                            isSelected ? 'tm-tint-green border-brand-grassFresh' : 'glass-card border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={member.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                          <span className="text-xs font-bold text-slate-700 flex-1">{member.name}</span>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                            isSelected ? 'tm-chip-green' : 'tm-chip-neutral'
                          }`}>
                            {isSelected && <UserCheck className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setRegistrationStep(1)}
                      className="py-3 px-4 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleProceedPayment}
                      className="flex-1 py-3 tm-btn-primary text-xs font-black rounded-xl hover:bg-slate-800 transition"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: MOCK UPI PAYMENT */}
              {registrationStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Tournament:</span>
                      <span className="text-slate-700 font-black">{selectedTournament.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Team Name:</span>
                      <span className="text-slate-700 font-black">{teamName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Total Players:</span>
                      <span className="text-slate-700 font-black">{selectedSquad.length + 1} players</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/80">
                      <span className="text-slate-400 font-bold">Entry Fee Amount:</span>
                      <span className="text-sm font-black text-brand-forest">₹{selectedTournament.entryFee}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Payment Method</p>
                    <div className="border border-brand-primary bg-brand-primary/5 rounded-xl p-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 bg-brand-primary/20 rounded-lg text-brand-forest font-black text-xs">UPI</span>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">PhonePe / Google Pay / BHIM</p>
                          <p className="text-[10px] text-slate-400 font-medium">Pay securely from any UPI app</p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-brand-forest flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setRegistrationStep(2)}
                      disabled={isProcessingPay}
                      className="py-3 px-4 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPay}
                      className="flex-1 py-3 tm-btn-primary text-xs font-black rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessingPay ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing UPI Payment...
                        </>
                      ) : (
                        `Pay ₹${selectedTournament.entryFee} via UPI`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {registrationStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto text-brand-forest border-4 border-white shadow-md">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-brand-forest">Registration Confirmed!</h4>
                    <p className="text-xs text-slate-400 mt-1">Your team <strong>{teamName}</strong> is registered for the <strong>{selectedTournament.name}</strong>.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Venue:</span>
                      <span className="text-slate-500 font-medium">{selectedTournament.location}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Date:</span>
                      <span className="text-slate-500 font-medium">{selectedTournament.date}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Roster:</span>
                      <span className="text-slate-500 font-medium text-right truncate max-w-[200px]">{[app.userProfile.name, ...selectedSquad.map(s => s.name)].join(', ')}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => { setIsRegistering(false); setActiveTab('my-registrations'); setSelectedTournament(null); }}
                    className="w-full py-3 tm-btn-primary text-xs font-black rounded-xl hover:bg-slate-800 transition"
                  >
                    View My Registrations
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

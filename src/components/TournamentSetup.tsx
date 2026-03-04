import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Users, Settings2, Play, Hash, Target, GitBranch } from 'lucide-react';
import { TournamentFormat, Team, SwissInitialPairing, SwissPairingSystem, SwissConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

import { TranslationKey } from '../i18n';

interface TournamentSetupProps {
  t: (key: TranslationKey) => string;
  onStart: (name: string, format: TournamentFormat, teams: Team[], swissConfig?: SwissConfig) => void;
}

export const TournamentSetup: React.FC<TournamentSetupProps> = ({ t, onStart }) => {
  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>(TournamentFormat.LEAGUE_SINGLE);
  const [teams, setTeams] = useState<Team[]>([
    { id: crypto.randomUUID(), name: 'Team 1' },
    { id: crypto.randomUUID(), name: 'Team 2' },
    { id: crypto.randomUUID(), name: 'Team 3' },
    { id: crypto.randomUUID(), name: 'Team 4' },
  ]);
  const [teamCount, setTeamCount] = useState<number>(4);
  
  // Swiss Config
  const [swissRounds, setSwissRounds] = useState(3);
  const [swissInitialPairing, setSwissInitialPairing] = useState<SwissInitialPairing>(SwissInitialPairing.RANDOM);
  const [swissPairingSystem, setSwissPairingSystem] = useState<SwissPairingSystem>(SwissPairingSystem.DUTCH);

  const handleTeamCountChange = (count: number) => {
    const newCount = Math.max(2, count);
    setTeamCount(newCount);
    
    setTeams(prev => {
      const updated = [...prev];
      if (updated.length < newCount) {
        for (let i = updated.length; i < newCount; i++) {
          updated.push({ id: crypto.randomUUID(), name: `Team ${i + 1}` });
        }
      } else if (updated.length > newCount) {
        updated.splice(newCount);
      }
      return updated;
    });

    // Auto-calculate Swiss rounds: ceil(log2(N))
    if (format === TournamentFormat.SWISS) {
      setSwissRounds(Math.ceil(Math.log2(newCount)));
    }
  };

  const updateTeamName = (id: string, newName: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const isKnockout = format === TournamentFormat.SINGLE_ELIMINATION || format === TournamentFormat.KNOCKOUT_HOME_AWAY;
  const isEven = teams.length % 2 === 0;
  const isValid = name && teams.length >= 2 && (!isKnockout || isEven);

  const handleStart = () => {
    if (isValid) {
      const swissConfig: SwissConfig | undefined = format === TournamentFormat.SWISS ? {
        rounds: swissRounds,
        initialPairing: swissInitialPairing,
        pairingSystem: swissPairingSystem
      } : undefined;
      
      onStart(name, format, teams, swissConfig);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="relative inline-block">
          <Trophy className="w-20 h-20 mx-auto text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-green-500/30 rounded-full"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">Arena</h1>
          <p className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Tournament Generator</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings2 className="w-24 h-24" />
          </div>
          
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              {t('tournamentName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Champions League"
              className="w-full bg-zinc-950 px-5 py-4 rounded-2xl border border-zinc-800 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-800 font-bold"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('selectFormat')}</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: TournamentFormat.SINGLE_ELIMINATION, label: 'Knockout (Single)', desc: 'One match - High Stakes' },
                { id: TournamentFormat.KNOCKOUT_HOME_AWAY, label: 'Knockout (Double)', desc: 'Home & Away - Aggregate Score' },
                { id: TournamentFormat.LEAGUE_SINGLE, label: 'League (Single)', desc: 'Classic Round Robin' },
                { id: TournamentFormat.LEAGUE_DOUBLE, label: 'League (Double)', desc: 'Home & Away Intensity' },
                { id: TournamentFormat.SWISS, label: 'Swiss System', desc: 'Skill-based Pairings - No Elimination' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFormat(f.id);
                    if (f.id === TournamentFormat.SWISS) {
                      setSwissRounds(Math.ceil(Math.log2(teams.length)));
                    }
                  }}
                  className={`p-5 text-left rounded-2xl border transition-all relative overflow-hidden ${
                    format === f.id 
                      ? 'border-green-500 bg-green-500/10 ring-1 ring-green-500' 
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-black text-zinc-100 text-lg">{f.label}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{f.desc}</div>
                  {format === f.id && (
                    <motion.div 
                      layoutId="active-format"
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,1)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Swiss Options */}
          <AnimatePresence>
            {format === TournamentFormat.SWISS && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-4 border-t border-zinc-800 overflow-hidden"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    {t('rounds')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={swissRounds}
                    onChange={(e) => setSwissRounds(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-white font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    {t('initialPairing')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: SwissInitialPairing.RANDOM, label: t('random') },
                      { id: SwissInitialPairing.SEEDED, label: t('seeded') },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSwissInitialPairing(p.id)}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          swissInitialPairing === p.id 
                            ? 'border-green-500 bg-green-500/10 text-white' 
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <GitBranch className="w-3 h-3" />
                    {t('pairingSystem')}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: SwissPairingSystem.DUTCH, label: 'Dutch System', desc: 'Standard pairing' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSwissPairingSystem(s.id)}
                        className={`px-4 py-3 rounded-xl border text-left transition-all ${
                          swissPairingSystem === s.id 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`font-bold text-sm ${swissPairingSystem === s.id ? 'text-white' : 'text-zinc-500'}`}>{s.label}</div>
                        <div className="text-[10px] text-zinc-600 uppercase font-bold">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24" />
          </div>

          <div className="space-y-4 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                {t('numberOfTeams')}
              </label>
              {isKnockout && !isEven && (
                <span className="text-[10px] font-black text-red-500 uppercase animate-pulse">Must be even</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="2"
                max="32"
                value={teamCount}
                onChange={(e) => handleTeamCountChange(parseInt(e.target.value) || 2)}
                className="w-full bg-zinc-950 px-5 py-4 rounded-2xl border border-zinc-800 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-black text-xl text-center"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {teams.map((team, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={team.id}
                  className="flex items-center gap-3 p-2 bg-zinc-950 rounded-2xl border border-zinc-800 group/item focus-within:border-green-500/50 transition-all"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-zinc-900 rounded-xl flex items-center justify-center text-xs font-black text-zinc-600 italic">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-zinc-100 font-bold placeholder:text-zinc-800"
                    placeholder={`Team ${index + 1}`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleStart}
          disabled={!isValid}
          className="group relative flex items-center gap-4 px-16 py-6 bg-green-500 text-black font-black uppercase italic tracking-tighter text-xl rounded-2xl hover:bg-green-400 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_40px_rgba(34,197,94,0.3)]"
        >
          <Play className="w-7 h-7 fill-current" />
          {t('startTournament')}
          <div className="absolute -inset-1 bg-green-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        </button>
      </div>
    </div>
  );
};

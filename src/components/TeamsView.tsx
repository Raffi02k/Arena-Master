import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Edit2, Check, X, Trophy, Swords, Goal } from 'lucide-react';
import { Tournament, Team, MatchStatus } from '../types';
import { calculateStandings } from '../logic/tournamentLogic';

interface TeamsViewProps {
  tournament: Tournament;
  onUpdateTeamName: (oldName: string, newName: string) => void;
}

const TeamsView: React.FC<TeamsViewProps> = ({ tournament, onUpdateTeamName }) => {
  const [search, setSearch] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Stats for this specific tournament
  const getStats = () => {
    const standings = calculateStandings(tournament.teams, tournament.matches);
    return standings.sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor);
  };

  const allStats = getStats();
  const filteredStats = allStats.filter(s => 
    s.teamName.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const handleSaveEdit = () => {
    if (editingName && editValue.trim() && editValue !== editingName) {
      onUpdateTeamName(editingName, editValue.trim());
    }
    setEditingName(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">Teams & Performance</h1>
          <p className="text-zinc-500 font-medium">Detailed statistics and management for {tournament.name}</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none w-full md:w-80 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredStats.map((stat, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              key={stat.teamName}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-black text-zinc-700 italic border border-zinc-800">
                  {stat.teamName.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  {editingName === stat.teamName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="bg-zinc-950 border border-green-500/50 rounded-lg px-3 py-1 text-xl font-black text-white outline-none"
                      />
                      <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingName(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <h3 className="text-xl font-black text-white">{stat.teamName}</h3>
                      <button 
                        onClick={() => handleStartEdit(stat.teamName)}
                        className="p-1 text-zinc-600 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Trophy className="w-3 h-3" />
                      Rank #{index + 1}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Swords className="w-3 h-3" />
                      {stat.points} Points
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-8 px-6 border-l border-zinc-800">
                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1 justify-center">
                    P
                  </div>
                  <div className="text-xl font-black text-white">{stat.played}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1 justify-center">
                    W
                  </div>
                  <div className="text-xl font-black text-green-500">{stat.wins}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1 justify-center">
                    GF
                  </div>
                  <div className="text-xl font-black text-white">{stat.goalsFor}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1 justify-center">
                    GA
                  </div>
                  <div className="text-xl font-black text-white">{stat.goalsAgainst}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredStats.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No teams found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsView;

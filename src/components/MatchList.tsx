import React from 'react';
import { Match, Team, MatchStatus } from '../types';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchListProps {
  matches: Match[];
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

interface MatchItemProps {
  match: Match;
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

const MatchItem: React.FC<MatchItemProps> = ({ match, teams, onUpdateScore }) => {
  const [localScoreA, setLocalScoreA] = React.useState<string>(match.scoreA?.toString() || '');
  const [localScoreB, setLocalScoreB] = React.useState<string>(match.scoreB?.toString() || '');

  const getTeamName = (id: string) => {
    if (id === 'BYE') return 'BYE';
    return teams.find(t => t.id === id)?.name || 'TBD';
  };

  const isBye = match.teamAId === 'BYE' || match.teamBId === 'BYE';

  const handleBlur = () => {
    if (isBye) return;
    const sA = parseInt(localScoreA);
    const sB = parseInt(localScoreB);
    
    if (!isNaN(sA) && !isNaN(sB)) {
      if (sA !== match.scoreA || sB !== match.scoreB) {
        onUpdateScore(match.id, sA, sB);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Sync with props if they change externally (e.g. from another client)
  React.useEffect(() => {
    setLocalScoreA(match.scoreA?.toString() || '');
    setLocalScoreB(match.scoreB?.toString() || '');
  }, [match.scoreA, match.scoreB]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-6 rounded-3xl border transition-all overflow-hidden ${
        match.status === MatchStatus.PLAYED 
          ? 'bg-zinc-900/40 border-zinc-800/50' 
          : 'bg-zinc-900 border-zinc-800 hover:border-green-500/50 shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
          ID: {match.id.slice(0, 4)}
        </span>
        {match.status === MatchStatus.PLAYED ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-500">
            <CheckCircle2 className="w-3 h-3" /> Final
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-500">
            <Circle className="w-3 h-3 animate-pulse" /> Live
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-1.5 h-8 rounded-full ${match.winnerId === match.teamAId ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-800'}`} />
            <span className={`font-bold truncate text-sm uppercase tracking-tight ${match.winnerId === match.teamAId ? 'text-white' : 'text-zinc-400'}`}>
              {getTeamName(match.teamAId)}
            </span>
          </div>
          <input
            type="number"
            min="0"
            value={localScoreA}
            onChange={(e) => setLocalScoreA(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isBye}
            className={`w-14 h-12 text-center font-black text-lg bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-white transition-all ${isBye ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-1.5 h-8 rounded-full ${match.winnerId === match.teamBId ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-800'}`} />
            <span className={`font-bold truncate text-sm uppercase tracking-tight ${match.winnerId === match.teamBId ? 'text-white' : 'text-zinc-400'}`}>
              {getTeamName(match.teamBId)}
            </span>
          </div>
          <input
            type="number"
            min="0"
            value={localScoreB}
            onChange={(e) => setLocalScoreB(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isBye}
            className={`w-14 h-12 text-center font-black text-lg bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-white transition-all ${isBye ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      {match.winnerId && (
        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Trophy className="w-20 h-20 rotate-12" />
        </div>
      )}
    </motion.div>
  );
};

export const MatchList: React.FC<MatchListProps> = ({ matches, teams, onUpdateScore }) => {
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="space-y-12 pb-20">
      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
              Round {round}
            </h3>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(roundMatches as Match[]).map((match) => (
              <MatchItem 
                key={match.id} 
                match={match} 
                teams={teams} 
                onUpdateScore={onUpdateScore} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

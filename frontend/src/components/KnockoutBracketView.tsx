import React from 'react';
import { Match, MatchStatus, Team, Tournament } from '../types';
import { GitBranch, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface KnockoutBracketViewProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

const getRoundLabel = (matches: Match[]) => {
  if (matches.some((match) => match.stage === 'QUALIFIER')) return 'Qualifiers';
  if (matches.length === 1) return 'Final';
  if (matches.length === 2) return 'Semifinals';
  if (matches.length === 4) return 'Quarterfinals';
  return `Round of ${matches.length * 2}`;
};

const BracketMatchCard: React.FC<{
  match: Match;
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  isFinal?: boolean;
}> = ({ match, teams, onUpdateScore, isFinal }) => {
  const [scoreA, setScoreA] = React.useState(match.scoreA?.toString() || '');
  const [scoreB, setScoreB] = React.useState(match.scoreB?.toString() || '');

  const getTeamName = (teamId: string) => teams.find((team) => team.id === teamId)?.name || 'TBD';

  React.useEffect(() => {
    setScoreA(match.scoreA?.toString() || '');
    setScoreB(match.scoreB?.toString() || '');
  }, [match.scoreA, match.scoreB]);

  const saveScore = () => {
    const parsedA = parseInt(scoreA);
    const parsedB = parseInt(scoreB);

    if (!Number.isNaN(parsedA) && !Number.isNaN(parsedB) && (parsedA !== match.scoreA || parsedB !== match.scoreB)) {
      onUpdateScore(match.id, parsedA, parsedB);
    }
  };

  return (
    <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 min-w-[240px] shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
          {match.stage === 'QUALIFIER' ? 'Qualifier' : 'Knockout'}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-[0.22em] ${match.status === MatchStatus.PLAYED ? 'text-green-400' : 'text-zinc-500'}`}>
          {match.status === MatchStatus.PLAYED ? 'Played' : 'Pending'}
        </span>
      </div>

      {[{ teamId: match.teamAId, score: scoreA, setScore: setScoreA }, { teamId: match.teamBId, score: scoreB, setScore: setScoreB }].map((row, index) => {
        const isWinner = match.winnerId === row.teamId;

        return (
          <div key={`${match.id}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 px-3 py-3 mb-3 last:mb-0">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span className={`truncate text-sm font-black uppercase ${isWinner ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {row.teamId ? getTeamName(row.teamId) : 'TBD'}
              </span>
              {isWinner && isFinal && (
                <span className="flex-shrink-0 animate-pulse bg-green-500 text-[8px] font-black italic px-1.5 py-0.5 rounded text-black leading-none">
                  CHAMPION
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              value={row.score}
              onChange={(e) => row.setScore(e.target.value)}
              onBlur={saveScore}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              disabled={!match.teamAId || !match.teamBId}
              className={`h-10 w-12 rounded-xl border border-zinc-800 bg-zinc-900 text-center font-black text-white outline-none focus:ring-2 focus:ring-green-500 ${(!match.teamAId || !match.teamBId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        );
      })}

      {match.winnerId && (
        <Trophy className="absolute -right-2 -bottom-2 w-14 h-14 text-green-500/10" />
      )}
    </div>
  );
};

export const KnockoutBracketView: React.FC<KnockoutBracketViewProps> = ({ tournament, onUpdateScore }) => {
  const eliminationMatches = tournament.matches.filter((match) => match.stage === 'QUALIFIER' || match.stage === 'KNOCKOUT');
  const rounds = Object.entries(
    eliminationMatches.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, Match[]>),
  ).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-7">
        <div className="flex items-center gap-3 text-xl font-black text-white mb-2">
          <GitBranch className="w-5 h-5 text-green-500" />
          Knockout Stage
        </div>
        <p className="text-sm text-zinc-400">Lag fylls vidare automatiskt till nasta runda nar matcher blir klara.</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-6 min-w-max">
          {(rounds as [string, Match[]][]).map(([round, matches]) => (
            <motion.div
              key={round}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-[280px] flex-shrink-0"
            >
              <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Round {round}</div>
                <div className="text-lg font-black text-white">{getRoundLabel(matches)}</div>
              </div>

              <div className="space-y-5">
                {matches.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    teams={tournament.teams}
                    onUpdateScore={onUpdateScore}
                    isFinal={Number(round) === Number(rounds[rounds.length - 1]?.[0])}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

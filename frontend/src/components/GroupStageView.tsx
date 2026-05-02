import React from 'react';
import { Tournament, Match, MatchStatus, Team } from '../types';
import { calculateGroupStandings } from '../logic/tournamentLogic';
import { Layers3, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface GroupStageViewProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

const GroupMatchItem: React.FC<{
  match: Match;
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}> = ({ match, teams, onUpdateScore }) => {
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Round {match.round}</span>
        <span className={`text-[10px] font-black uppercase tracking-[0.22em] ${match.status === MatchStatus.PLAYED ? 'text-green-400' : 'text-zinc-500'}`}>
          {match.status === MatchStatus.PLAYED ? 'Played' : 'Pending'}
        </span>
      </div>

      {[
        { id: match.teamAId, score: scoreA, setScore: setScoreA, winner: match.winnerId === match.teamAId },
        { id: match.teamBId, score: scoreB, setScore: setScoreB, winner: match.winnerId === match.teamBId },
      ].map((row, index) => (
        <div key={`${match.id}-${index}`} className="flex items-center justify-between gap-3">
          <span className={`min-w-0 truncate text-sm font-bold uppercase ${row.winner ? 'text-white' : 'text-zinc-400'}`}>
            {getTeamName(row.id)}
          </span>
          <input
            type="number"
            min="0"
            value={row.score}
            onChange={(e) => row.setScore(e.target.value)}
            onBlur={saveScore}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-14 h-11 rounded-xl border border-zinc-800 bg-zinc-900 text-center text-white font-black outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ))}
    </div>
  );
};

export const GroupStageView: React.FC<GroupStageViewProps> = ({ tournament, onUpdateScore }) => {
  const groups = calculateGroupStandings(tournament);
  const groupMatches = tournament.matches.filter((match) => match.stage === 'GROUP');

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-7">
        <div className="flex items-center gap-3 text-xl font-black text-white mb-2">
          <Layers3 className="w-5 h-5 text-green-500" />
          Group Stage
        </div>
        <p className="text-sm text-zinc-400">Folj varje grupp separat med tabell och matcher i samma vy.</p>
      </div>

      <div className="space-y-6">
        {groups.map((group) => {
          const matches = groupMatches.filter((match) => match.groupName === group.groupName);

          return (
            <motion.section
              key={group.groupName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-5 sm:p-6 space-y-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{group.groupName}</h2>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 font-black">Top 2 gar vidare</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Matches</div>
                  <div className="text-lg font-black text-white">{matches.filter((match) => match.status === MatchStatus.PLAYED).length}/{matches.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,1fr] gap-6">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                  <div className="px-4 py-4 border-b border-zinc-800 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Standings</div>
                  <div className="divide-y divide-zinc-800/60">
                    {group.standings.map((standing, index) => (
                      <div key={standing.teamId} className="grid grid-cols-[auto,1fr,auto,auto] gap-3 items-center px-4 py-4">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${index < 2 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black uppercase text-zinc-100">{standing.teamName}</div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">
                            {standing.wins}W {standing.draws}D {standing.losses}L
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">GD</div>
                          <div className="text-sm font-black text-zinc-300">{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</div>
                        </div>
                        <div className="text-center min-w-[54px]">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">Pts</div>
                          <div className="text-sm font-black text-green-400">{standing.points}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    <Trophy className="w-4 h-4 text-green-500" />
                    Group Matches
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {matches.map((match) => (
                      <GroupMatchItem
                        key={match.id}
                        match={match}
                        teams={tournament.teams}
                        onUpdateScore={onUpdateScore}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
};

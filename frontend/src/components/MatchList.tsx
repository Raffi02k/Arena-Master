import React from 'react';
import { Match, MatchStatus, Team, Tournament } from '../types';
import { calculateGroupStandings } from '../logic/tournamentLogic';
import { CheckCircle2, Circle, Trophy, Layers3, Swords, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchListProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onUpdateQualifierTeams: (matchId: string, teamAId: string, teamBId: string) => void;
}

interface MatchItemProps {
  match: Match;
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onUpdateQualifierTeams: (matchId: string, teamAId: string, teamBId: string) => void;
}

const MatchItem: React.FC<MatchItemProps> = ({ match, teams, onUpdateScore, onUpdateQualifierTeams }) => {
  const [localScoreA, setLocalScoreA] = React.useState<string>(match.scoreA?.toString() || '');
  const [localScoreB, setLocalScoreB] = React.useState<string>(match.scoreB?.toString() || '');

  const getTeamName = (id: string) => {
    if (id === 'BYE') return 'BYE';
    return teams.find((t) => t.id === id)?.name || 'TBD';
  };

  const isBye = match.teamAId === 'BYE' || match.teamBId === 'BYE';
  const isQualifier = match.stage === 'QUALIFIER';

  const handleBlur = () => {
    if (isBye) return;
    const sA = parseInt(localScoreA);
    const sB = parseInt(localScoreB);

    if (!isNaN(sA) && !isNaN(sB) && (sA !== match.scoreA || sB !== match.scoreB)) {
      onUpdateScore(match.id, sA, sB);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  React.useEffect(() => {
    setLocalScoreA(match.scoreA?.toString() || '');
    setLocalScoreB(match.scoreB?.toString() || '');
  }, [match.scoreA, match.scoreB]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-5 sm:p-6 rounded-3xl border transition-all overflow-hidden ${
        match.status === MatchStatus.PLAYED
          ? 'bg-zinc-900/40 border-zinc-800/50'
          : 'bg-zinc-900 border-zinc-800 hover:border-green-500/50 shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            ID: {match.id.slice(0, 4)}
          </span>
          {match.groupName && (
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 py-1 rounded-full border border-zinc-800 bg-zinc-950/70">
              {match.groupName}
            </span>
          )}
        </div>
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

      {isQualifier && (
        <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
            <Wand2 className="w-3 h-3" /> Qualifier slots
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                {match.sourceGroupA ? `${match.sourcePositionA}${match.sourceGroupA.replace('Group ', '')}` : 'Team A'}
              </div>
              <select
                value={match.qualifierOverrideTeamAId || match.teamAId || ''}
                onChange={(e) => onUpdateQualifierTeams(match.id, e.target.value, match.qualifierOverrideTeamBId || match.teamBId || '')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100"
              >
                <option value="">Auto</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                {match.sourceGroupB ? `${match.sourcePositionB}${match.sourceGroupB.replace('Group ', '')}` : 'Team B'}
              </div>
              <select
                value={match.qualifierOverrideTeamBId || match.teamBId || ''}
                onChange={(e) => onUpdateQualifierTeams(match.id, match.qualifierOverrideTeamAId || match.teamAId || '', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100"
              >
                <option value="">Auto</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

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
            disabled={isBye || !match.teamAId || !match.teamBId}
            className={`w-12 h-10 sm:w-14 sm:h-12 text-center font-black text-base sm:text-lg bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-white transition-all ${(isBye || !match.teamAId || !match.teamBId) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            disabled={isBye || !match.teamAId || !match.teamBId}
            className={`w-12 h-10 sm:w-14 sm:h-12 text-center font-black text-base sm:text-lg bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-white transition-all ${(isBye || !match.teamAId || !match.teamBId) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

const StageSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  description: string;
  matches: Match[];
  teams: Team[];
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onUpdateQualifierTeams: (matchId: string, teamAId: string, teamBId: string) => void;
}> = ({ title, icon, description, matches, teams, onUpdateScore, onUpdateQualifierTeams }) => {
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  if (matches.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2 text-white font-black text-lg sm:text-xl">
          {icon}
          {title}
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
              Round {round}
            </h3>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {roundMatches.map((match) => (
              <MatchItem
                key={match.id}
                match={match}
                teams={teams}
                onUpdateScore={onUpdateScore}
                onUpdateQualifierTeams={onUpdateQualifierTeams}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export const MatchList: React.FC<MatchListProps> = ({ tournament, onUpdateScore, onUpdateQualifierTeams }) => {
  const teams = tournament.teams;
  const groupMatches = tournament.matches.filter((match) => match.stage === 'GROUP');
  const qualifierMatches = tournament.matches.filter((match) => match.stage === 'QUALIFIER');
  const otherMatches = tournament.matches.filter((match) => match.stage !== 'GROUP' && match.stage !== 'QUALIFIER');
  const groupStandings = calculateGroupStandings(tournament);

  return (
    <div className="space-y-12 pb-20">
      {groupStandings.length > 0 && (
        <section className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2 text-white font-black text-lg sm:text-xl">
              <Layers3 className="w-5 h-5 text-green-500" />
              Group Preview
            </div>
            <p className="text-sm text-zinc-400">Live table before the qualifier slots are locked in.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {groupStandings.map((group) => (
              <div key={group.groupName} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-zinc-300">{group.groupName}</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Top 2 qualify</span>
                </div>
                <div className="space-y-2">
                  {group.standings.map((standing, index) => (
                    <div key={standing.teamId} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${index < 2 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          {index + 1}
                        </span>
                        <span className="truncate font-bold text-zinc-100 uppercase text-sm">{standing.teamName}</span>
                      </div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 whitespace-nowrap">
                        {standing.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <StageSection
        title="Group Stage"
        icon={<Layers3 className="w-5 h-5 text-green-500" />}
        description="Round-robin matches inside each group."
        matches={groupMatches}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onUpdateQualifierTeams={onUpdateQualifierTeams}
      />

      <StageSection
        title="Qualifiers"
        icon={<Swords className="w-5 h-5 text-green-500" />}
        description="Automatic from group standings, with optional manual override per slot."
        matches={qualifierMatches}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onUpdateQualifierTeams={onUpdateQualifierTeams}
      />

      <StageSection
        title="Matches"
        icon={<Swords className="w-5 h-5 text-green-500" />}
        description="All remaining matches in the tournament."
        matches={otherMatches}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onUpdateQualifierTeams={onUpdateQualifierTeams}
      />
    </div>
  );
};

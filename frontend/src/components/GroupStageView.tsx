import React from 'react';
import { Tournament } from '../types';
import { calculateGroupStandings } from '../logic/tournamentLogic';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Layers3, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface GroupStageViewProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

export const GroupStageView: React.FC<GroupStageViewProps> = ({ tournament }) => {
  const groups = [...calculateGroupStandings(tournament)].sort((a, b) =>
    a.groupName.localeCompare(b.groupName, undefined, { numeric: true }),
  );
  const qualifiersPerGroup = tournament.groupKnockoutConfig?.qualifiersPerGroup ?? 2;
  const [selectedGroup, setSelectedGroup] = React.useState<string>('ALL');
  const visibleGroups = selectedGroup === 'ALL'
    ? groups
    : groups.filter((group) => group.groupName === selectedGroup);

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7 shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-3 text-white">
            <Layers3 className="w-6 h-6 text-green-500" />
            <span className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Group Stage</span>
          </div>
          <div className="rounded-md bg-green-500 px-6 py-3 text-center text-lg sm:text-2xl font-black uppercase tracking-tight text-black shadow-[0_10px_30px_rgba(34,197,94,0.28)]">
            Group Stage
          </div>
          <p className="text-center text-sm font-medium text-zinc-400">
            Morkt tema, riktig tabellayout och tydliga kvalplatser.
          </p>

          {groups.length > 1 && (
            <div className="flex justify-center">
              <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Filter
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-bold text-zinc-100 outline-none focus:border-green-500"
                >
                  <option value="ALL">All groups</option>
                  {groups.map((group) => (
                    <option key={group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
        {visibleGroups.map((group) => (
          <motion.section
            key={group.groupName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-zinc-950/40 border-b border-zinc-800/50 py-3 px-6 flex items-center justify-center">
              <h2 className="text-xl font-black uppercase tracking-[0.15em] text-zinc-100 flex items-center gap-3">
                <div className="w-2 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                {group.groupName}
              </h2>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,27,0.98),rgba(10,10,12,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40">
                      <th className="w-20 px-4 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">#</th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Team</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">P</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">W</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">D</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">L</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">GF</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">GA</th>
                      <th className="w-16 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">GD</th>
                      <th className="w-20 px-3 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Pts</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800/70">
                    {group.standings.map((standing, index) => {
                      const position = index + 1;
                      const rankChange = tournament.groupRankChanges?.[standing.teamId];
                      const movedUp = rankChange && rankChange.current === position && rankChange.current < rankChange.previous;
                      const movedDown = rankChange && rankChange.current === position && rankChange.current > rankChange.previous;
                      const isQualified = position <= qualifiersPerGroup;

                      return (
                        <tr key={standing.teamId} className={isQualified ? 'bg-green-500/[0.03]' : 'bg-transparent'}>
                          <td className="relative px-4 py-5 text-center">
                            {isQualified && <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500" />}
                            <div className="inline-flex items-center gap-2">
                              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                                isQualified ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-300'
                              }`}>
                                {position}
                              </span>
                              {movedUp ? <ArrowUpRight className="w-4 h-4 text-green-400" /> : null}
                              {movedDown ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : null}
                            </div>
                          </td>

                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-black text-zinc-400">
                                {standing.teamName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-base sm:text-lg font-black text-zinc-100">{standing.teamName}</div>
                                <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                                  {isQualified ? (
                                    <span className="inline-flex items-center gap-1 text-green-400">
                                      <CheckCircle2 className="w-3 h-3" /> Qualifying
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-500">
                                      <XCircle className="w-3 h-3" /> Out
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.played}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.wins}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.draws}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.losses}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.goalsFor}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">{standing.goalsAgainst}</td>
                          <td className="px-3 py-5 text-center text-lg font-medium text-zinc-300 tabular-nums">
                            {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                          </td>
                          <td className={`px-3 py-5 text-center text-xl font-black tabular-nums ${isQualified ? 'text-green-400' : 'text-zinc-100'}`}>
                            {standing.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

              <div className="px-5 py-4 bg-zinc-900/50 border-t border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Advancement status
                </span>
                <span className="text-xs font-bold text-zinc-100 italic">
                  {groups.length === 2 ? 'Semifinals' : 'Knockout Stage'}
                </span>
              </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Users, Settings2, Play, Hash, Target, GitBranch, Shuffle, Rows3, Shield } from 'lucide-react';
import {
  TournamentFormat,
  Team,
  SwissInitialPairing,
  SwissPairingSystem,
  SwissConfig,
  GroupAssignmentMethod,
  GroupKnockoutConfig,
} from '../types';
import { motion, AnimatePresence } from 'motion/react';

import { TranslationKey } from '../i18n';
import { buildGroupDraw } from '../logic/tournamentLogic';

interface TournamentSetupProps {
  t: (key: TranslationKey) => string;
  onStart: (
    name: string,
    format: TournamentFormat,
    teams: Team[],
    swissConfig?: SwissConfig,
    groupKnockoutConfig?: GroupKnockoutConfig,
  ) => void;
}

export const TournamentSetup: React.FC<TournamentSetupProps> = ({ t, onStart }) => {
  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>(TournamentFormat.LEAGUE_SINGLE);
  const [teamPool, setTeamPool] = useState<Team[]>([
    { id: crypto.randomUUID(), name: 'Team 1' },
    { id: crypto.randomUUID(), name: 'Team 2' },
    { id: crypto.randomUUID(), name: 'Team 3' },
    { id: crypto.randomUUID(), name: 'Team 4' },
  ]);
  const [teamCount, setTeamCount] = useState<number>(4);

  const [swissRounds, setSwissRounds] = useState(3);
  const [swissInitialPairing, setSwissInitialPairing] = useState<SwissInitialPairing>(SwissInitialPairing.RANDOM);
  const [swissPairingSystem, setSwissPairingSystem] = useState<SwissPairingSystem>(SwissPairingSystem.DUTCH);

  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [groupAssignmentMethod, setGroupAssignmentMethod] = useState<GroupAssignmentMethod>(GroupAssignmentMethod.RANDOM);
  const [manualGroupAssignments, setManualGroupAssignments] = useState<Record<string, string>>({});
  const [previewGroups, setPreviewGroups] = useState<GroupKnockoutConfig['groups']>([]);

  const activeTeams = useMemo(() => teamPool.slice(0, teamCount), [teamPool, teamCount]);

  const groupCount = teamsPerGroup >= 2 ? Math.ceil(teamCount / teamsPerGroup) : 0;
  const groupNames = useMemo(
    () => Array.from({ length: groupCount }, (_, index) => `Group ${String.fromCharCode(65 + index)}`),
    [groupCount],
  );

  const handleTeamCountChange = (count: number) => {
    const newCount = Math.max(2, count);
    setTeamCount(newCount);

    setTeamPool((prev) => {
      const updated = [...prev];
      if (updated.length < newCount) {
        for (let i = updated.length; i < newCount; i++) {
          updated.push({ id: crypto.randomUUID(), name: `Team ${i + 1}` });
        }
      }
      return updated;
    });

    if (format === TournamentFormat.SWISS) {
      setSwissRounds(Math.ceil(Math.log2(newCount)));
    }
  };

  const updateTeamName = (id: string, newName: string) => {
    setTeamPool((prev) => prev.map((team) => (team.id === id ? { ...team, name: newName } : team)));
  };

  const updateManualGroup = (teamId: string, groupName: string) => {
    setManualGroupAssignments((prev) => ({ ...prev, [teamId]: groupName }));
  };

  const isKnockout = format === TournamentFormat.SINGLE_ELIMINATION || format === TournamentFormat.KNOCKOUT_HOME_AWAY;
  const isGroupKnockout = format === TournamentFormat.GROUP_KNOCKOUT;
  const isEven = activeTeams.length % 2 === 0;
  const hasPowerOfTwoGroupCount = groupCount >= 2 && (groupCount & (groupCount - 1)) === 0;
  const isGroupSizeValid = teamsPerGroup >= 2 && teamCount % teamsPerGroup === 0;

  const manualGroupSizes = groupNames.reduce<Record<string, number>>((acc, groupName) => {
    acc[groupName] = activeTeams.filter((team) => manualGroupAssignments[team.id] === groupName).length;
    return acc;
  }, {});

  const hasValidManualGroups =
    !isGroupKnockout ||
    groupAssignmentMethod !== GroupAssignmentMethod.MANUAL ||
    groupNames.every((groupName) => manualGroupSizes[groupName] === teamsPerGroup);

  const isValid =
    !!name &&
    activeTeams.length >= 2 &&
    (!isKnockout || isEven) &&
    (!isGroupKnockout || (isGroupSizeValid && hasPowerOfTwoGroupCount && hasValidManualGroups));

  const handleStart = () => {
    if (!isValid) return;

    const swissConfig: SwissConfig | undefined = format === TournamentFormat.SWISS
      ? {
          rounds: swissRounds,
          initialPairing: swissInitialPairing,
          pairingSystem: swissPairingSystem,
        }
      : undefined;

    const groups = isGroupKnockout
      ? buildGroupDraw(
          activeTeams,
          groupCount,
          teamsPerGroup,
          groupAssignmentMethod === GroupAssignmentMethod.MANUAL ? manualGroupAssignments : undefined,
        )
      : [];

    const teamsWithGroups = activeTeams.map((team) => ({
      ...team,
      groupName: groups.find((group) => group.teamIds.includes(team.id))?.name,
    }));

    const groupKnockoutConfig: GroupKnockoutConfig | undefined = isGroupKnockout
      ? {
          teamsPerGroup,
          groupCount,
          qualifiersPerGroup: 2,
          assignmentMethod: groupAssignmentMethod,
          groups,
        }
      : undefined;

    onStart(name, format, teamsWithGroups, swissConfig, groupKnockoutConfig);
  };

  const selectedGroupCounts = activeTeams.reduce<Record<string, number>>((acc, team) => {
    const groupName = manualGroupAssignments[team.id];
    if (groupName) {
      acc[groupName] = (acc[groupName] || 0) + 1;
    }
    return acc;
  }, {});

  const getTeamInitials = (teamName: string) => {
    const trimmedName = teamName.trim();
    if (!trimmedName) return 'T';

    return trimmedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  };

  useEffect(() => {
    if (!isGroupKnockout || !isGroupSizeValid || groupCount === 0) {
      setPreviewGroups([]);
      return;
    }

    setPreviewGroups(
      buildGroupDraw(
        activeTeams,
        groupCount,
        teamsPerGroup,
        groupAssignmentMethod === GroupAssignmentMethod.MANUAL ? manualGroupAssignments : undefined,
      ),
    );
  }, [
    activeTeams,
    groupAssignmentMethod,
    groupCount,
    isGroupKnockout,
    isGroupSizeValid,
    manualGroupAssignments,
    teamsPerGroup,
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 sm:space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="relative inline-block">
          <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 border border-dashed border-green-500/30 rounded-full"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase italic">Arena</h1>
          <p className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs">Tournament Generator</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-6 bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
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
                { id: TournamentFormat.GROUP_KNOCKOUT, label: 'Groups + Qualifiers', desc: 'Group stage then 1A vs 2B' },
                { id: TournamentFormat.SWISS, label: 'Swiss System', desc: 'Skill-based Pairings - No Elimination' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFormat(f.id);
                    if (f.id === TournamentFormat.SWISS) {
                      setSwissRounds(Math.ceil(Math.log2(activeTeams.length)));
                    }
                  }}
                  className={`p-4 sm:p-5 text-left rounded-2xl border transition-all relative overflow-hidden ${
                    format === f.id
                      ? 'border-green-500 bg-green-500/10 ring-1 ring-green-500'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-black text-zinc-100 text-base sm:text-lg">{f.label}</div>
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
                    <button
                      onClick={() => setSwissPairingSystem(SwissPairingSystem.DUTCH)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${
                        swissPairingSystem === SwissPairingSystem.DUTCH
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`font-bold text-sm ${swissPairingSystem === SwissPairingSystem.DUTCH ? 'text-white' : 'text-zinc-500'}`}>Dutch System</div>
                      <div className="text-[10px] text-zinc-600 uppercase font-bold">Standard pairing</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isGroupKnockout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-4 border-t border-zinc-800 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Teams Per Group
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="16"
                      value={teamsPerGroup}
                      onChange={(e) => setTeamsPerGroup(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-white font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Rows3 className="w-3 h-3" />
                      Groups Created
                    </label>
                    <div className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-white font-bold">
                      {groupCount}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
                  Top 2 from each group go to qualifiers. Pairings are `1A vs 2B` and `2A vs 1B`, then the same pattern for `C/D`, `E/F` and so on.
                </div>

                {!isGroupSizeValid && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    Number of teams must be evenly divisible by teams per group.
                  </div>
                )}

                {isGroupSizeValid && !hasPowerOfTwoGroupCount && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    You need 2, 4, 8 or 16 groups so the knockout bracket can continue automatically.
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Shuffle className="w-3 h-3" />
                    Group Assignment
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: GroupAssignmentMethod.RANDOM, label: 'Random draw' },
                      { id: GroupAssignmentMethod.MANUAL, label: 'Manual groups' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setGroupAssignmentMethod(mode.id)}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          groupAssignmentMethod === mode.id
                            ? 'border-green-500 bg-green-500/10 text-white'
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {previewGroups.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Group Preview</label>
                      {groupAssignmentMethod === GroupAssignmentMethod.RANDOM && (
                        <button
                          type="button"
                          onClick={() => setPreviewGroups(buildGroupDraw(activeTeams, groupCount, teamsPerGroup))}
                          className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400 hover:text-green-300"
                        >
                          Redraw Preview
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {previewGroups.map((group) => (
                        <div key={group.name} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                          <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">{group.name}</div>
                          <div className="space-y-2">
                            {group.teamIds.map((teamId, index) => {
                              const team = activeTeams.find((entry) => entry.id === teamId);
                              return (
                                <div key={teamId} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-black text-zinc-300">
                                    {index + 1}
                                  </span>
                                  <span className="truncate text-sm font-bold text-zinc-100 uppercase">{team?.name || 'Unknown team'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
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
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 16, 32].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleTeamCountChange(count)}
                    className={`rounded-2xl px-3 py-2 text-sm font-black transition-all ${
                      teamCount === count
                        ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                        : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Team names stay saved even if you lower the count and increase it again.
              </p>
            </div>
          </div>

          <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {activeTeams.map((team, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={team.id}
                  className="group/item relative overflow-hidden rounded-[32px] border border-zinc-800 bg-[linear-gradient(135deg,rgba(24,24,27,0.95),rgba(12,12,14,0.98))] p-4 sm:p-5 transition-all hover:border-green-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col gap-4"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl bg-[linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05))] border border-green-500/20 flex items-center justify-center text-lg font-black text-green-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="relative z-10 drop-shadow-lg">{getTeamInitials(team.name)}</span>
                      <Shield className="absolute w-10 h-10 text-green-500/5 rotate-12" />
                      
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-green-500/0 group-hover/item:bg-green-500/10 transition-colors duration-500" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500/70">
                          Arena Member #{index + 1}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeamName(team.id, e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-zinc-100 font-black text-lg sm:text-xl placeholder:text-zinc-800 transition-all focus:placeholder:text-zinc-900"
                        placeholder={`Team ${index + 1}`}
                      />
                    </div>
                  </div>
                  {isGroupKnockout && groupAssignmentMethod === GroupAssignmentMethod.MANUAL && groupNames.length > 0 && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Group slot</span>
                      <select
                        value={manualGroupAssignments[team.id] || ''}
                        onChange={(e) => updateManualGroup(team.id, e.target.value)}
                        className="min-w-[140px] bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100"
                      >
                        <option value="">Select group</option>
                        {groupNames.map((groupName) => {
                          const assignedCount = selectedGroupCounts[groupName] || 0;
                          const isCurrentGroup = manualGroupAssignments[team.id] === groupName;
                          const isFull = assignedCount >= teamsPerGroup && !isCurrentGroup;

                          return (
                            <option key={groupName} value={groupName} disabled={isFull}>
                              {groupName}{isFull ? ' (Full)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isGroupKnockout && groupAssignmentMethod === GroupAssignmentMethod.MANUAL && groupNames.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groupNames.map((groupName) => (
                <div key={groupName} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{groupName}</div>
                  <div className={`text-sm font-bold ${manualGroupSizes[groupName] === teamsPerGroup ? 'text-green-400' : 'text-zinc-300'}`}>
                    {manualGroupSizes[groupName]} / {teamsPerGroup} teams
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-4 sm:pt-8">
        <button
          onClick={handleStart}
          disabled={!isValid}
          className="group relative flex items-center gap-4 px-10 sm:px-16 py-5 sm:py-6 bg-green-500 text-black font-black uppercase italic tracking-tighter text-lg sm:text-xl rounded-2xl hover:bg-green-400 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_40px_rgba(34,197,94,0.3)]"
        >
          <Play className="w-7 h-7 fill-current" />
          {t('startTournament')}
          <div className="absolute -inset-1 bg-green-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        </button>
      </div>
    </div>
  );
};

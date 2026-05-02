import {
  Tournament,
  TournamentFormat,
  Team,
  Match,
  MatchStatus,
  Standing,
  PointsConfig,
  SwissConfig,
  SwissInitialPairing,
  GroupDefinition,
  GroupKnockoutConfig,
} from '../types';

const createRoundRobinMatches = (
  teamIds: string[],
  stage: Match['stage'],
  groupName?: string,
  roundOffset = 0,
): Match[] => {
  const matches: Match[] = [];
  const tempTeams = [...teamIds];

  if (tempTeams.length % 2 !== 0) tempTeams.push('BYE');

  const rounds = tempTeams.length - 1;
  const matchesPerRound = tempTeams.length / 2;

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const home = tempTeams[m];
      const away = tempTeams[tempTeams.length - 1 - m];

      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({
          id: crypto.randomUUID(),
          round: roundOffset + r + 1,
          teamAId: home,
          teamBId: away,
          status: MatchStatus.UNPLAYED,
          stage,
          groupName,
        });
      }
    }

    tempTeams.splice(1, 0, tempTeams.pop()!);
  }

  return matches;
};

const shuffleTeams = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createGroupStageMatches = (groups: GroupDefinition[]): Match[] => {
  return groups.flatMap((group) =>
    createRoundRobinMatches(group.teamIds, 'GROUP', group.name),
  );
};

const createQualifierMatches = (groups: GroupDefinition[], startingRound: number): Match[] => {
  const qualifiers: Match[] = [];

  for (let i = 0; i < groups.length; i += 2) {
    const groupA = groups[i];
    const groupB = groups[i + 1];

    if (!groupA || !groupB) continue;

    qualifiers.push({
      id: crypto.randomUUID(),
      round: startingRound,
      teamAId: '',
      teamBId: '',
      status: MatchStatus.UNPLAYED,
      stage: 'QUALIFIER',
      groupName: `${groupA.name} vs ${groupB.name}`,
      sourceGroupA: groupA.name,
      sourcePositionA: 1,
      sourceGroupB: groupB.name,
      sourcePositionB: 2,
    });

    qualifiers.push({
      id: crypto.randomUUID(),
      round: startingRound,
      teamAId: '',
      teamBId: '',
      status: MatchStatus.UNPLAYED,
      stage: 'QUALIFIER',
      groupName: `${groupA.name} vs ${groupB.name}`,
      sourceGroupA: groupA.name,
      sourcePositionA: 2,
      sourceGroupB: groupB.name,
      sourcePositionB: 1,
    });
  }

  return qualifiers;
};

export const generateGroupDefinitions = (
  teams: Team[],
  config: GroupKnockoutConfig,
): GroupDefinition[] => {
  if (config.groups.length) {
    return config.groups.map((group) => ({
      ...group,
      teamIds: group.teamIds.filter((teamId) => teams.some((team) => team.id === teamId)),
    }));
  }

  return [];
};

export const generateMatches = (
  format: TournamentFormat,
  teams: Team[],
  swissConfig?: SwissConfig,
  groupKnockoutConfig?: GroupKnockoutConfig,
): Match[] => {
  const matches: Match[] = [];
  const teamIds = teams.map((t) => t.id);

  if (format === TournamentFormat.SWISS) {
    return generateSwissRound(1, teams, [], swissConfig);
  }

  if (format === TournamentFormat.GROUP_KNOCKOUT && groupKnockoutConfig) {
    const groups = generateGroupDefinitions(teams, groupKnockoutConfig);
    const groupMatches = createGroupStageMatches(groups);
    const highestGroupRound = Math.max(0, ...groupMatches.map((match) => match.round));
    const qualifiers = createQualifierMatches(groups, highestGroupRound + 1);
    return [...groupMatches, ...qualifiers];
  }

  if (format === TournamentFormat.LEAGUE_SINGLE || format === TournamentFormat.LEAGUE_DOUBLE) {
    const firstLeg = createRoundRobinMatches(teamIds, 'LEAGUE');

    if (format === TournamentFormat.LEAGUE_DOUBLE) {
      const roundOffset = Math.max(0, ...firstLeg.map((match) => match.round));
      const secondLeg = firstLeg.map((match) => ({
        ...match,
        id: crypto.randomUUID(),
        round: match.round + roundOffset,
        teamAId: match.teamBId,
        teamBId: match.teamAId,
      }));
      return [...firstLeg, ...secondLeg];
    }

    return firstLeg;
  }

  if (format === TournamentFormat.SINGLE_ELIMINATION || format === TournamentFormat.KNOCKOUT_HOME_AWAY) {
    const isDoubleLeg = format === TournamentFormat.KNOCKOUT_HOME_AWAY;
    const n = teamIds.length;
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(n)));
    const seeds = [...teamIds];
    while (seeds.length < nextPowerOfTwo) seeds.push('BYE');

    const firstRoundMatches: Match[] = [];
    for (let i = 0; i < seeds.length; i += 2) {
      const teamA = seeds[i];
      const teamB = seeds[i + 1];

      if (teamA === 'BYE' && teamB === 'BYE') continue;

      const createMatch = (tA: string, tB: string, round: number): Match => {
        const match: Match = {
          id: crypto.randomUUID(),
          round,
          teamAId: tA === 'BYE' ? '' : tA,
          teamBId: tB === 'BYE' ? '' : tB,
          status: tA === 'BYE' || tB === 'BYE' ? MatchStatus.PLAYED : MatchStatus.UNPLAYED,
          stage: 'KNOCKOUT',
        };

        if (tA === 'BYE') {
          match.scoreA = 0;
          match.scoreB = 1;
          match.winnerId = tB;
        } else if (tB === 'BYE') {
          match.scoreA = 1;
          match.scoreB = 0;
          match.winnerId = tA;
        }

        return match;
      };

      const firstLeg = createMatch(teamA, teamB, 1);
      firstRoundMatches.push(firstLeg);

      if (isDoubleLeg && teamA !== 'BYE' && teamB !== 'BYE') {
        firstRoundMatches.push(createMatch(teamB, teamA, 1));
      }
    }

    let currentPairings = isDoubleLeg
      ? Array.from({ length: Math.ceil(firstRoundMatches.length / 2) }, (_, index) =>
          firstRoundMatches.slice(index * 2, index * 2 + 2),
        )
      : firstRoundMatches.map((match) => [match]);
    let allMatches = [...firstRoundMatches];
    let roundNum = 2;

    while (currentPairings.length > 1) {
      const nextRoundMatches: Match[] = [];

      for (let i = 0; i < currentPairings.length; i += 2) {
        const p1 = currentPairings[i];
        const p2 = currentPairings[i + 1];

        const m1: Match = {
          id: crypto.randomUUID(),
          round: roundNum,
          teamAId: '',
          teamBId: '',
          status: MatchStatus.UNPLAYED,
          stage: 'KNOCKOUT',
        };
        nextRoundMatches.push(m1);

        p1.forEach((match) => {
          match.nextMatchId = m1.id;
        });
        p2?.forEach((match) => {
          match.nextMatchId = m1.id;
        });

        if (isDoubleLeg && p2) {
          nextRoundMatches.push({
            id: crypto.randomUUID(),
            round: roundNum,
            teamAId: '',
            teamBId: '',
            status: MatchStatus.UNPLAYED,
            stage: 'KNOCKOUT',
          });
        }
      }

      allMatches = [...allMatches, ...nextRoundMatches];
      currentPairings = isDoubleLeg
        ? Array.from({ length: Math.ceil(nextRoundMatches.length / 2) }, (_, index) =>
            nextRoundMatches.slice(index * 2, index * 2 + 2),
          )
        : nextRoundMatches.map((match) => [match]);
      roundNum++;
    }

    return allMatches;
  }

  return matches;
};

export const generateSwissRound = (round: number, teams: Team[], existingMatches: Match[], config?: SwissConfig): Match[] => {
  const matches: Match[] = [];
  const standings = calculateStandings(teams, existingMatches);

  let sortedTeams = [...standings];

  if (round === 1) {
    if (config?.initialPairing === SwissInitialPairing.RANDOM) {
      sortedTeams = shuffleTeams(sortedTeams);
    } else if (config?.initialPairing === SwissInitialPairing.SEEDED) {
      const half = Math.ceil(sortedTeams.length / 2);
      const top = sortedTeams.slice(0, half);
      const bottom = sortedTeams.slice(half);
      const paired: Match[] = [];

      for (let i = 0; i < top.length; i++) {
        const teamA = top[i];
        const teamB = bottom[i];

        if (teamB) {
          paired.push({
            id: crypto.randomUUID(),
            round,
            teamAId: teamA.teamId,
            teamBId: teamB.teamId,
            status: MatchStatus.UNPLAYED,
            stage: 'SWISS',
          });
        } else {
          paired.push({
            id: crypto.randomUUID(),
            round,
            teamAId: teamA.teamId,
            teamBId: 'BYE',
            status: MatchStatus.PLAYED,
            scoreA: 1,
            scoreB: 0,
            winnerId: teamA.teamId,
            isBye: true,
            stage: 'SWISS',
          });
        }
      }

      return paired;
    }
  }

  const paired = new Set<string>();
  const teamsToPair = sortedTeams.map((standing) => standing.teamId);

  if (teamsToPair.length % 2 !== 0) {
    const teamsWithBye = new Set(existingMatches.filter((match) => match.isBye).map((match) => match.teamAId));
    for (let i = teamsToPair.length - 1; i >= 0; i--) {
      const teamId = teamsToPair[i];
      if (!teamsWithBye.has(teamId)) {
        matches.push({
          id: crypto.randomUUID(),
          round,
          teamAId: teamId,
          teamBId: 'BYE',
          status: MatchStatus.PLAYED,
          scoreA: 1,
          scoreB: 0,
          winnerId: teamId,
          isBye: true,
          stage: 'SWISS',
        });
        paired.add(teamId);
        break;
      }
    }
  }

  for (let i = 0; i < teamsToPair.length; i++) {
    const teamAId = teamsToPair[i];
    if (paired.has(teamAId)) continue;

    let opponentId: string | undefined;
    for (let j = i + 1; j < teamsToPair.length; j++) {
      const teamBId = teamsToPair[j];
      if (paired.has(teamBId)) continue;

      const alreadyPlayed = existingMatches.some((match) =>
        (match.teamAId === teamAId && match.teamBId === teamBId) ||
        (match.teamAId === teamBId && match.teamBId === teamAId),
      );

      if (!alreadyPlayed) {
        opponentId = teamBId;
        break;
      }
    }

    if (!opponentId) {
      for (let j = i + 1; j < teamsToPair.length; j++) {
        const teamBId = teamsToPair[j];
        if (!paired.has(teamBId)) {
          opponentId = teamBId;
          break;
        }
      }
    }

    if (opponentId) {
      matches.push({
        id: crypto.randomUUID(),
        round,
        teamAId,
        teamBId: opponentId,
        status: MatchStatus.UNPLAYED,
        stage: 'SWISS',
      });
      paired.add(teamAId);
      paired.add(opponentId);
    }
  }

  return matches;
};

export const calculateStandings = (teams: Team[], matches: Match[], pointsConfig?: PointsConfig): Standing[] => {
  const standingsMap: Record<string, Standing> = {};
  const winPoints = pointsConfig?.win ?? 3;
  const drawPoints = pointsConfig?.draw ?? 1;
  const lossPoints = pointsConfig?.loss ?? 0;

  teams.forEach((team) => {
    standingsMap[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      buchholz: 0,
      sonnebornBerger: 0,
      groupName: team.groupName,
    };
  });

  matches.forEach((match) => {
    if (match.status !== MatchStatus.PLAYED) return;

    const sA = standingsMap[match.teamAId];
    const sB = standingsMap[match.teamBId];

    if (sA) {
      sA.played++;
      if (match.teamBId !== 'BYE') {
        sA.goalsFor += match.scoreA || 0;
        sA.goalsAgainst += match.scoreB || 0;
      }

      if (match.winnerId === match.teamAId) {
        sA.wins++;
        sA.points += winPoints;
      } else if (match.winnerId === match.teamBId) {
        sA.losses++;
        sA.points += lossPoints;
      } else if (match.scoreA === match.scoreB && match.teamBId !== 'BYE') {
        sA.draws++;
        sA.points += drawPoints;
      }
      sA.goalDifference = sA.goalsFor - sA.goalsAgainst;
    }

    if (sB && match.teamBId !== 'BYE') {
      sB.played++;
      sB.goalsFor += match.scoreB || 0;
      sB.goalsAgainst += match.scoreA || 0;

      if (match.winnerId === match.teamBId) {
        sB.wins++;
        sB.points += winPoints;
      } else if (match.winnerId === match.teamAId) {
        sB.losses++;
        sB.points += lossPoints;
      } else if (match.scoreA === match.scoreB) {
        sB.draws++;
        sB.points += drawPoints;
      }
      sB.goalDifference = sB.goalsFor - sB.goalsAgainst;
    }
  });

  Object.values(standingsMap).forEach((standing) => {
    const teamMatches = matches.filter((match) =>
      (match.teamAId === standing.teamId || match.teamBId === standing.teamId) &&
      match.status === MatchStatus.PLAYED &&
      match.teamBId !== 'BYE' &&
      match.teamAId !== 'BYE',
    );

    teamMatches.forEach((match) => {
      const opponentId = match.teamAId === standing.teamId ? match.teamBId : match.teamAId;
      const opponentStanding = standingsMap[opponentId];
      if (!opponentStanding) return;

      standing.buchholz! += opponentStanding.points;

      if (match.winnerId === standing.teamId) {
        standing.sonnebornBerger! += opponentStanding.points;
      } else if (!match.winnerId && match.scoreA === match.scoreB) {
        standing.sonnebornBerger! += opponentStanding.points * 0.5;
      }
    });
  });

  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.buchholz || 0) !== (a.buchholz || 0)) return (b.buchholz || 0) - (a.buchholz || 0);
    if ((b.sonnebornBerger || 0) !== (a.sonnebornBerger || 0)) return (b.sonnebornBerger || 0) - (a.sonnebornBerger || 0);
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
};

export const calculateGroupStandings = (tournament: Tournament): Array<{ groupName: string; standings: Standing[] }> => {
  const groups = tournament.groupKnockoutConfig?.groups || [];
  const groupMatches = tournament.matches.filter((match) => match.stage === 'GROUP');

  return groups.map((group) => {
    const groupTeams = tournament.teams.filter((team) => group.teamIds.includes(team.id));
    const standings = calculateStandings(
      groupTeams,
      groupMatches.filter((match) => match.groupName === group.name),
      tournament.pointsConfig,
    ).map((standing) => ({ ...standing, groupName: group.name }));

    return { groupName: group.name, standings };
  });
};

export const syncGroupQualifierMatches = (tournament: Tournament): Tournament => {
  if (tournament.format !== TournamentFormat.GROUP_KNOCKOUT || !tournament.groupKnockoutConfig) {
    return tournament;
  }

  const standingsByGroup = new Map(
    calculateGroupStandings(tournament).map((group) => [group.groupName, group.standings]),
  );

  const matches = tournament.matches.map((match) => {
    if (match.stage !== 'QUALIFIER') return match;

    const teamAId = match.sourceGroupA
      ? standingsByGroup.get(match.sourceGroupA)?.[Math.max(0, (match.sourcePositionA || 1) - 1)]?.teamId || ''
      : match.teamAId;
    const teamBId = match.sourceGroupB
      ? standingsByGroup.get(match.sourceGroupB)?.[Math.max(0, (match.sourcePositionB || 1) - 1)]?.teamId || ''
      : match.teamBId;

    const teamsChanged = teamAId !== match.teamAId || teamBId !== match.teamBId;

    return {
      ...match,
      teamAId,
      teamBId,
      status: teamsChanged ? MatchStatus.UNPLAYED : match.status,
      scoreA: teamsChanged ? undefined : match.scoreA,
      scoreB: teamsChanged ? undefined : match.scoreB,
      winnerId: teamsChanged ? undefined : match.winnerId,
    };
  });

  return { ...tournament, matches };
};

export const buildGroupDraw = (
  teams: Team[],
  groupCount: number,
  teamsPerGroup: number,
  manualAssignments?: Record<string, string>,
): GroupDefinition[] => {
  const groupNames = Array.from({ length: groupCount }, (_, index) => `Group ${String.fromCharCode(65 + index)}`);

  if (manualAssignments) {
    return groupNames.map((name) => ({
      name,
      teamIds: teams
        .filter((team) => manualAssignments[team.id] === name)
        .slice(0, teamsPerGroup)
        .map((team) => team.id),
    }));
  }

  const shuffledTeams = shuffleTeams(teams);
  return groupNames.map((name, index) => ({
    name,
    teamIds: shuffledTeams
      .slice(index * teamsPerGroup, index * teamsPerGroup + teamsPerGroup)
      .map((team) => team.id),
  }));
};

import { TournamentFormat, Team, Match, MatchStatus, Standing, PointsConfig, SwissConfig, SwissInitialPairing } from '../types';

export const generateMatches = (format: TournamentFormat, teams: Team[], swissConfig?: SwissConfig): Match[] => {
  const matches: Match[] = [];
  const teamIds = teams.map(t => t.id);

  if (format === TournamentFormat.SWISS) {
    // For Swiss, we only generate the first round initially
    return generateSwissRound(1, teams, [], swissConfig);
  }

  if (format === TournamentFormat.LEAGUE_SINGLE || format === TournamentFormat.LEAGUE_DOUBLE) {
    // Round Robin Logic (Circle Method)
    const n = teamIds.length;
    const tempTeams = [...teamIds];
    if (n % 2 !== 0) tempTeams.push('BYE');
    const numTeams = tempTeams.length;
    const rounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    for (let r = 0; r < rounds; r++) {
      for (let m = 0; m < matchesPerRound; m++) {
        const home = tempTeams[m];
        const away = tempTeams[numTeams - 1 - m];

        if (home !== 'BYE' && away !== 'BYE') {
          matches.push({
            id: crypto.randomUUID(),
            round: r + 1,
            teamAId: home,
            teamBId: away,
            status: MatchStatus.UNPLAYED,
          });
        }
      }
      // Rotate teams
      tempTeams.splice(1, 0, tempTeams.pop()!);
    }

    if (format === TournamentFormat.LEAGUE_DOUBLE) {
      const secondHalf = matches.map(m => ({
        ...m,
        id: crypto.randomUUID(),
        round: m.round + rounds,
        teamAId: m.teamBId,
        teamBId: m.teamAId,
      }));
      return [...matches, ...secondHalf];
    }
    return matches;
  }

  if (format === TournamentFormat.SINGLE_ELIMINATION || format === TournamentFormat.KNOCKOUT_HOME_AWAY) {
    const isDoubleLeg = format === TournamentFormat.KNOCKOUT_HOME_AWAY;
    
    // Knockout Logic
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

      const m1 = createMatch(teamA, teamB, 1);
      firstRoundMatches.push(m1);
      
      if (isDoubleLeg && teamA !== 'BYE' && teamB !== 'BYE') {
        const m2 = createMatch(teamB, teamA, 1);
        firstRoundMatches.push(m2);
      }
    }

    // Generate subsequent rounds
    let currentRoundMatches = firstRoundMatches;
    let allMatches = [...firstRoundMatches];
    let roundNum = 2;
    
    // For double leg, we group matches by pairing
    const getPairings = (matches: Match[]) => {
      if (!isDoubleLeg) return matches.map(m => [m]);
      const pairings: Match[][] = [];
      for (let i = 0; i < matches.length; i += 2) {
        pairings.push([matches[i], matches[i+1]].filter(Boolean));
      }
      return pairings;
    };

    let currentPairings = getPairings(firstRoundMatches);
    
    while (currentPairings.length > 1) {
      const nextRoundMatches: Match[] = [];
      for (let i = 0; i < currentPairings.length; i += 2) {
        const p1 = currentPairings[i];
        const p2 = currentPairings[i+1];
        
        const m1 = {
          id: crypto.randomUUID(),
          round: roundNum,
          teamAId: '',
          teamBId: '',
          status: MatchStatus.UNPLAYED,
        };
        nextRoundMatches.push(m1);
        
        p1.forEach(m => m.nextMatchId = m1.id);
        if (p2) p2.forEach(m => m.nextMatchId = m1.id);

        if (isDoubleLeg && p2) {
          const m2 = {
            id: crypto.randomUUID(),
            round: roundNum,
            teamAId: '',
            teamBId: '',
            status: MatchStatus.UNPLAYED,
          };
          nextRoundMatches.push(m2);
        }
      }
      allMatches = [...allMatches, ...nextRoundMatches];
      currentPairings = getPairings(nextRoundMatches);
      roundNum++;
    }

    return allMatches;
  }

  return [];
};

export const generateSwissRound = (round: number, teams: Team[], existingMatches: Match[], config?: SwissConfig): Match[] => {
  const matches: Match[] = [];
  const standings = calculateStandings(teams, existingMatches);
  
  // Sort teams for pairing
  let sortedTeams = [...standings];
  
  if (round === 1) {
    if (config?.initialPairing === SwissInitialPairing.RANDOM) {
      sortedTeams = sortedTeams.sort(() => Math.random() - 0.5);
    } else if (config?.initialPairing === SwissInitialPairing.SEEDED) {
      // Seeded pairing: Top half vs Bottom half
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
          });
        } else {
          // BYE
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
          });
        }
      }
      return paired;
    }
  }

  // General Swiss Pairing (Dutch System simplified)
  // Pair teams with similar points who haven't played each other
  const paired = new Set<string>();
  const teamsToPair = sortedTeams.map(s => s.teamId);
  
  // Check for BYE if odd number of teams
  if (teamsToPair.length % 2 !== 0) {
    // Find team with lowest points who hasn't had a BYE
    const teamsWithBye = new Set(existingMatches.filter(m => m.isBye).map(m => m.teamAId));
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
        });
        paired.add(teamId);
        break;
      }
    }
  }

  for (let i = 0; i < teamsToPair.length; i++) {
    const teamAId = teamsToPair[i];
    if (paired.has(teamAId)) continue;

    // Find best opponent for teamA
    let opponentId: string | undefined;
    for (let j = i + 1; j < teamsToPair.length; j++) {
      const teamBId = teamsToPair[j];
      if (paired.has(teamBId)) continue;

      // Check if they've played each other
      const alreadyPlayed = existingMatches.some(m => 
        (m.teamAId === teamAId && m.teamBId === teamBId) || 
        (m.teamAId === teamBId && m.teamBId === teamAId)
      );

      if (!alreadyPlayed) {
        opponentId = teamBId;
        break;
      }
    }

    // If no opponent found who hasn't played, just take the next available (should be rare in early rounds)
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

  teams.forEach(team => {
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
    };
  });

  matches.forEach(match => {
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

  // Calculate Buchholz and Sonneborn-Berger
  Object.values(standingsMap).forEach(standing => {
    const teamMatches = matches.filter(m => 
      (m.teamAId === standing.teamId || m.teamBId === standing.teamId) && 
      m.status === MatchStatus.PLAYED && 
      m.teamBId !== 'BYE' && m.teamAId !== 'BYE'
    );

    teamMatches.forEach(match => {
      const opponentId = match.teamAId === standing.teamId ? match.teamBId : match.teamAId;
      const opponentStanding = standingsMap[opponentId];
      if (opponentStanding) {
        standing.buchholz! += opponentStanding.points;
        
        if (match.winnerId === standing.teamId) {
          standing.sonnebornBerger! += opponentStanding.points;
        } else if (!match.winnerId && match.scoreA === match.scoreB) {
          standing.sonnebornBerger! += opponentStanding.points * 0.5;
        }
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

import { Tournament, TournamentFormat, MatchStatus } from './types';

export const getDemoTournaments = (): Tournament[] => {
  const teams = [
    { id: '1', name: 'Real Madrid' },
    { id: '2', name: 'Manchester City' },
    { id: '3', name: 'Bayern Munich' },
    { id: '4', name: 'Paris Saint-Germain' },
    { id: '5', name: 'Liverpool' },
    { id: '6', name: 'Arsenal' },
    { id: '7', name: 'Barcelona' },
    { id: '8', name: 'Inter Milan' },
  ];

  const leagueTournament: Tournament = {
    id: 'demo-league',
    name: 'Champions League Demo',
    format: TournamentFormat.LEAGUE_SINGLE,
    teams: teams.slice(0, 4),
    createdAt: Date.now(),
    pointsConfig: { win: 3, draw: 1, loss: 0 },
    matches: [
      { id: 'm1', teamAId: '1', teamBId: '2', scoreA: 2, scoreB: 1, status: MatchStatus.PLAYED, winnerId: '1', round: 1 },
      { id: 'm2', teamAId: '3', teamBId: '4', scoreA: 0, scoreB: 0, status: MatchStatus.PLAYED, round: 1 },
      { id: 'm3', teamAId: '1', teamBId: '3', scoreA: 3, scoreB: 1, status: MatchStatus.PLAYED, winnerId: '1', round: 2 },
      { id: 'm4', teamAId: '2', teamBId: '4', scoreA: 2, scoreB: 2, status: MatchStatus.PLAYED, round: 2 },
      { id: 'm5', teamAId: '1', teamBId: '4', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 3 },
      { id: 'm6', teamAId: '2', teamBId: '3', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 3 },
    ],
  };

  const knockoutTournament: Tournament = {
    id: 'demo-knockout',
    name: 'World Cup Knockout Demo',
    format: TournamentFormat.SINGLE_ELIMINATION,
    teams: teams,
    createdAt: Date.now(),
    pointsConfig: { win: 3, draw: 1, loss: 0 },
    matches: [
      // Quarter Finals
      { id: 'q1', teamAId: '1', teamBId: '2', scoreA: 1, scoreB: 0, status: MatchStatus.PLAYED, winnerId: '1', round: 1, nextMatchId: 's1' },
      { id: 'q2', teamAId: '3', teamBId: '4', scoreA: 2, scoreB: 3, status: MatchStatus.PLAYED, winnerId: '4', round: 1, nextMatchId: 's1' },
      { id: 'q3', teamAId: '5', teamBId: '6', scoreA: 0, scoreB: 2, status: MatchStatus.PLAYED, winnerId: '6', round: 1, nextMatchId: 's2' },
      { id: 'q4', teamAId: '7', teamBId: '8', scoreA: 1, scoreB: 1, status: MatchStatus.PLAYED, winnerId: '7', round: 1, nextMatchId: 's2' },
      // Semi Finals
      { id: 's1', teamAId: '1', teamBId: '4', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 2, nextMatchId: 'f1' },
      { id: 's2', teamAId: '6', teamBId: '7', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 2, nextMatchId: 'f1' },
      // Final
      { id: 'f1', teamAId: 'TBD', teamBId: 'TBD', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 3 },
    ],
  };

  const swissTournament: Tournament = {
    id: 'demo-swiss',
    name: 'Pro Swiss Demo',
    format: TournamentFormat.SWISS,
    teams: teams,
    createdAt: Date.now(),
    pointsConfig: { win: 3, draw: 1, loss: 0 },
    currentRound: 1,
    swissConfig: { rounds: 3 },
    matches: [
      { id: 'sw1', teamAId: '1', teamBId: '2', scoreA: 2, scoreB: 0, status: MatchStatus.PLAYED, winnerId: '1', round: 1 },
      { id: 'sw2', teamAId: '3', teamBId: '4', scoreA: 1, scoreB: 2, status: MatchStatus.PLAYED, winnerId: '4', round: 1 },
      { id: 'sw3', teamAId: '5', teamBId: '6', scoreA: 0, scoreB: 2, status: MatchStatus.PLAYED, winnerId: '6', round: 1 },
      { id: 'sw4', teamAId: '7', teamBId: '8', scoreA: 1, scoreB: 1, status: MatchStatus.PLAYED, round: 1 },
    ],
  };

  const homeAwayTournament: Tournament = {
    id: 'demo-homeaway',
    name: 'Champions League Playoffs Demo',
    format: TournamentFormat.KNOCKOUT_HOME_AWAY,
    teams: teams.slice(0, 4),
    createdAt: Date.now(),
    pointsConfig: { win: 3, draw: 1, loss: 0 },
    matches: [
      // Semi Finals Leg 1
      { id: 'ha1', teamAId: '1', teamBId: '2', scoreA: 2, scoreB: 1, status: MatchStatus.PLAYED, round: 1, nextMatchId: 'haf1' },
      { id: 'ha2', teamAId: '3', teamBId: '4', scoreA: 0, scoreB: 0, status: MatchStatus.PLAYED, round: 1, nextMatchId: 'haf1' },
      // Semi Finals Leg 2
      { id: 'ha3', teamAId: '2', teamBId: '1', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 1, nextMatchId: 'haf1' },
      { id: 'ha4', teamAId: '4', teamBId: '3', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 1, nextMatchId: 'haf1' },
      // Final
      { id: 'haf1', teamAId: 'TBD', teamBId: 'TBD', scoreA: undefined, scoreB: undefined, status: MatchStatus.UNPLAYED, round: 2 },
    ],
  };

  return [leagueTournament, knockoutTournament, swissTournament, homeAwayTournament];
};

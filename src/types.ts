export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  KNOCKOUT_HOME_AWAY = 'KNOCKOUT_HOME_AWAY',
  LEAGUE_SINGLE = 'LEAGUE_SINGLE',
  LEAGUE_DOUBLE = 'LEAGUE_DOUBLE',
  SWISS = 'SWISS',
}

export enum MatchStatus {
  UNPLAYED = 'UNPLAYED',
  ONGOING = 'ONGOING',
  PLAYED = 'PLAYED',
}

export interface Team {
  id: string;
  name: string;
  seed?: number;
}

export interface Match {
  id: string;
  round: number;
  teamAId: string;
  teamBId: string;
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  winnerId?: string;
  nextMatchId?: string; // For knockout brackets
  isBye?: boolean;
}

export interface PointsConfig {
  win: number;
  draw: number;
  loss: number;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

export enum SwissPairingSystem {
  DUTCH = 'DUTCH',
  MONRAD = 'MONRAD',
  BURSTEIN = 'BURSTEIN',
}

export enum SwissInitialPairing {
  SEEDED = 'SEEDED',
  RANDOM = 'RANDOM',
  MANUAL = 'MANUAL',
}

export interface SwissConfig {
  rounds: number;
  initialPairing: SwissInitialPairing;
  pairingSystem: SwissPairingSystem;
}

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  teams: Team[];
  matches: Match[];
  createdAt: number;
  pointsConfig?: PointsConfig;
  contactInfo?: ContactInfo;
  swissConfig?: SwissConfig;
  currentRound?: number;
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  buchholz?: number;
  sonnebornBerger?: number;
}

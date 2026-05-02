import { useState, useEffect } from 'react';
import { Tournament, TournamentFormat, Team, Match, MatchStatus, GroupKnockoutConfig } from './types';
import { generateMatches, calculateStandings, calculateGroupStandings, generateSwissRound, syncGroupQualifierMatches } from './logic/tournamentLogic';
import { translations, Language, TranslationKey } from './i18n';
import { TournamentSetup } from './components/TournamentSetup';
import { MatchList } from './components/MatchList';
import { StandingsTable } from './components/StandingsTable';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TeamsView from './components/TeamsView';
import Overview from './components/Overview';
import { GroupStageView } from './components/GroupStageView';
import { KnockoutBracketView } from './components/KnockoutBracketView';
import Settings from './components/Settings';
import { TournamentInfo } from './components/TournamentInfo';
import { getDemoTournaments } from './demoData';
import { Trophy, LayoutDashboard, Swords, ChevronLeft, RotateCcw, Share2, Check, LayoutGrid, LogOut, Settings as SettingsIcon, Users, Edit2, Info, Trash2, Play, HelpCircle, Menu, X, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { client } from './auth/client';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

import { SwissConfig } from './types';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'setup' | 'tournament' | 'teams' | 'settings' | 'info' | 'demo';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [lastView, setLastView] = useState<View>('landing');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'standings' | 'teams' | 'groups' | 'bracket'>('overview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const { user, loading: authLoading, logout } = useAuth();
  const [appSettings, setAppSettings] = useState({
    language: 'en' as Language,
    accentColor: 'green' as 'green' | 'blue' | 'purple' | 'orange',
    defaultPoints: { win: 3, draw: 1, loss: 0 },
    user: { name: 'Arena Master', email: 'admin@arenamaster.com' }
  });

  const t = (key: TranslationKey) => translations[appSettings.language][key] || key;

  const applyTournamentAutoSync = (input: Tournament): Tournament => {
    if (input.format !== TournamentFormat.GROUP_KNOCKOUT) {
      return input;
    }

    return syncGroupQualifierMatches(input);
  };

  const normalizeTournamentData = (data: any): Tournament => {
    const safeData = (data && typeof data === 'object') ? data : {};
    return applyTournamentAutoSync({
      id: safeData.id || crypto.randomUUID(),
      name: safeData.name || 'Untitled Tournament',
      format: safeData.format || TournamentFormat.LEAGUE_SINGLE,
      teams: Array.isArray(safeData.teams) ? safeData.teams : [],
      matches: Array.isArray(safeData.matches) ? safeData.matches : [],
      createdAt: typeof safeData.createdAt === 'number' ? safeData.createdAt : Date.now(),
      pointsConfig: safeData.pointsConfig || appSettings.defaultPoints,
      contactInfo: safeData.contactInfo,
      swissConfig: safeData.swissConfig,
      groupKnockoutConfig: safeData.groupKnockoutConfig,
      groupRankChanges: safeData.groupRankChanges || {},
      currentRound: typeof safeData.currentRound === 'number' ? safeData.currentRound : 1,
    });
  };

  useEffect(() => {
    if (view !== 'info') {
      setLastView(view);
    }
  }, [view]);

  useEffect(() => {
    if (user && (view === 'login' || view === 'signup')) {
      setView('dashboard');
    }
  }, [user, view]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('arena_settings');
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  // Save settings to localStorage and update CSS variables
  useEffect(() => {
    localStorage.setItem('arena_settings', JSON.stringify(appSettings));
    
    const colors: Record<string, { main: string, glow: string }> = {
      green: { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
      blue: { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
      purple: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
      orange: { main: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
    };

    const selected = colors[appSettings.accentColor];
    document.documentElement.style.setProperty('--accent', selected.main);
    document.documentElement.style.setProperty('--accent-glow', selected.glow);
  }, [appSettings]);

  // Load tournament from URL if ID exists
  useEffect(() => {
    const pathId = window.location.pathname.split('/').pop();
    if (pathId && pathId.length > 10) { // Basic check for UUID-like string
      client.get(`/api/tournaments/${pathId}`)
        .then(res => {
          const data = res.data;
          if (data) {
            setTournament(normalizeTournamentData(data));
            setView('tournament');
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch all tournaments for dashboard
  useEffect(() => {
    if (view === 'dashboard' && user) {
      client.get('/api/tournaments/')
        .then(res => {
          const normalized = Array.isArray(res.data)
            ? res.data.map((item: any) => ({
                ...item,
                data: normalizeTournamentData(item.data || item),
              }))
            : [];
          setTournaments(normalized);
        })
        .catch(err => console.error('Failed to fetch tournaments:', err));
    }
  }, [view, user]);

  const startTournament = async (
    name: string,
    format: TournamentFormat,
    teams: Team[],
    swissConfig?: SwissConfig,
    groupKnockoutConfig?: GroupKnockoutConfig
  ) => {
    const matches = generateMatches(format, teams, swissConfig, groupKnockoutConfig);
    const newTournament: Tournament = {
      id: crypto.randomUUID(),
      name,
      format,
      teams,
      matches,
      createdAt: Date.now(),
      pointsConfig: appSettings.defaultPoints,
      swissConfig,
      groupKnockoutConfig,
      currentRound: 1
    };

    const syncedTournament = applyTournamentAutoSync(newTournament);

    try {
      await client.post('/api/tournaments/', {
        id: syncedTournament.id,
        name: syncedTournament.name,
        data: syncedTournament,
      });
      window.history.pushState({}, '', `/${syncedTournament.id}`);
      setTournament(syncedTournament);
      setView('tournament');
       setActiveTab(format === TournamentFormat.GROUP_KNOCKOUT ? 'groups' : 'matches');
    } catch (error) {
      console.error('Failed to save tournament:', error);
      setTournament(syncedTournament);
      setView('tournament');
    }
  };

  const generateNextSwissRoundAction = async () => {
    if (!tournament || !tournament.swissConfig) return;
    
    const nextRoundNum = (tournament.currentRound || 1) + 1;
    if (nextRoundNum > tournament.swissConfig.rounds) return;

    const nextRoundMatches = generateSwissRound(nextRoundNum, tournament.teams, tournament.matches, tournament.swissConfig);
    const updatedTournament: Tournament = {
      ...tournament,
      currentRound: nextRoundNum,
      matches: [...tournament.matches, ...nextRoundMatches]
    };

    setTournament(updatedTournament);
    await updateTournamentData(updatedTournament);
  };

  const selectTournament = (id: string) => {
    const t = tournaments.find(t => t.id === id);
    if (t) {
      setTournament(normalizeTournamentData(t.data));
      window.history.pushState({}, '', `/${id}`);
      setView('tournament');
      setActiveTab(normalizeTournamentData(t.data).format === TournamentFormat.GROUP_KNOCKOUT ? 'groups' : 'overview');
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      await client.delete(`/api/tournaments/${id}`);
      setTournaments(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete tournament:', error);
    }
  };

  const updateTournamentName = async (id: string, newName: string) => {
    const t = tournaments.find(t => t.id === id);
    if (!t) return;

      const updatedTournament = applyTournamentAutoSync({ ...t.data, name: newName });
    
    try {
      await client.patch(`/api/tournaments/${id}`, { name: newName, data: updatedTournament });
      setTournaments(prev => prev.map(item => item.id === id ? { ...item, name: newName, data: updatedTournament } : item));
      if (tournament?.id === id) {
        setTournament(updatedTournament);
      }
    } catch (error) {
      console.error('Failed to update tournament name:', error);
    }
  };

  const updateTeamNameGlobal = async (oldName: string, newName: string) => {
    // Update all tournaments that contain this team
    const updatedTournaments = tournaments.map(t => {
      const data = { ...t.data } as Tournament;
      let changed = false;

      // Update teams list
      data.teams = data.teams.map(team => {
        if (team.name === oldName) {
          changed = true;
          return { ...team, name: newName };
        }
        return team;
      });

      // Update matches if needed (though matches usually use teamId, 
      // but let's be safe if we display names anywhere in data)
      // Our Match type uses teamAId/teamBId, so we don't need to update matches 
      // UNLESS we store names there. We don't.
      
      return { ...t, data: changed ? data : t.data, changed };
    });

    // Save all changed tournaments
    for (const t of updatedTournaments) {
      if (t.changed) {
        try {
          await client.patch(`/api/tournaments/${t.id}`, { data: t.data });
        } catch (error) {
          console.error(`Failed to update tournament ${t.id} for team rename:`, error);
        }
      }
    }

    // Refresh local state
    client.get('/api/tournaments/')
      .then(res => res.data)
      .then(data => {
        const normalized = Array.isArray(data)
          ? data.map((item: any) => ({
              ...item,
              data: normalizeTournamentData(item.data || item),
            }))
          : [];
        setTournaments(normalized);
        if (tournament) {
          const current = normalized.find((item: any) => item.id === tournament.id);
          if (current) setTournament(normalizeTournamentData(current.data));
        }
      });
  };

  const updateMatchScore = async (matchId: string, scoreA: number, scoreB: number) => {
    if (!tournament) return;

    const previousGroupStandings = tournament.format === TournamentFormat.GROUP_KNOCKOUT
      ? calculateGroupStandings(syncGroupQualifierMatches(tournament))
      : [];

    const updatedMatches = tournament.matches.map(m => {
      if (m.id === matchId) {
        const winnerId = scoreA > scoreB ? m.teamAId : scoreB > scoreA ? m.teamBId : undefined;
        return { ...m, scoreA, scoreB, status: MatchStatus.PLAYED, winnerId };
      }
      return m;
    });

    if (
      tournament.format === TournamentFormat.SINGLE_ELIMINATION ||
      tournament.format === TournamentFormat.KNOCKOUT_HOME_AWAY ||
      tournament.format === TournamentFormat.GROUP_KNOCKOUT
    ) {
      const isDoubleLeg = tournament.format === TournamentFormat.KNOCKOUT_HOME_AWAY;
      const completedMatch = updatedMatches.find(m => m.id === matchId)!;
      
      if (completedMatch.nextMatchId) {
        const sourceMatches = updatedMatches.filter(m => m.nextMatchId === completedMatch.nextMatchId);
        
        // Group matches by pairing (teams involved)
        const pairings: Match[][] = [];
        const seen = new Set();
        sourceMatches.forEach(m => {
          const key = [m.teamAId, m.teamBId].sort().join('-');
          if (!seen.has(key)) {
            pairings.push(sourceMatches.filter(sm => [sm.teamAId, sm.teamBId].sort().join('-') === key));
            seen.add(key);
          }
        });

        const myPairing = pairings.find(p => p.some(m => m.id === matchId))!;
        const myPairingIndex = pairings.indexOf(myPairing);

        if (myPairing.every(m => m.status === MatchStatus.PLAYED)) {
          let winnerId: string | undefined;

          if (!isDoubleLeg) {
            winnerId = myPairing[0].winnerId;
          } else {
            // Aggregate score
            const teamAId = myPairing[0].teamAId;
            const teamBId = myPairing[0].teamBId;
            let scoreA = 0;
            let scoreB = 0;
            
            myPairing.forEach(m => {
              if (m.teamAId === teamAId) {
                scoreA += m.scoreA || 0;
                scoreB += m.scoreB || 0;
              } else {
                scoreA += m.scoreB || 0;
                scoreB += m.scoreA || 0;
              }
            });
            
            if (scoreA > scoreB) winnerId = teamAId;
            else if (scoreB > scoreA) winnerId = teamBId;
            // Handle draw in aggregate? Maybe penalties? 
            // For now, let's just pick one or leave it undefined if draw.
          }

          if (winnerId) {
            const nextMatchIndex = updatedMatches.findIndex(m => m.id === completedMatch.nextMatchId);
            if (nextMatchIndex !== -1) {
              const nextMatch1 = { ...updatedMatches[nextMatchIndex] };
              if (myPairingIndex === 0) {
                nextMatch1.teamAId = winnerId;
              } else {
                nextMatch1.teamBId = winnerId;
              }
              updatedMatches[nextMatchIndex] = nextMatch1;

              // If double leg, also update the second leg of the next pairing
              if (isDoubleLeg) {
                const nextMatch2Index = nextMatchIndex + 1;
                if (nextMatch2Index < updatedMatches.length && updatedMatches[nextMatch2Index].round === nextMatch1.round) {
                  const nextMatch2 = { ...updatedMatches[nextMatch2Index] };
                  if (myPairingIndex === 0) {
                    nextMatch2.teamBId = winnerId;
                  } else {
                    nextMatch2.teamAId = winnerId;
                  }
                  updatedMatches[nextMatch2Index] = nextMatch2;
                }
              }
            }
          }
        }
      }
    }

    let updatedTournament = { ...tournament, matches: updatedMatches };

    // Sync qualifiers if in Group Knockout format
    if (updatedTournament.format === TournamentFormat.GROUP_KNOCKOUT) {
      updatedTournament = syncGroupQualifierMatches(updatedTournament);
    }

    if (tournament.format === TournamentFormat.GROUP_KNOCKOUT) {
      const previousPositions = new Map<string, number>();
      const nextPositions = new Map<string, number>();

      previousGroupStandings.forEach((group) => {
        group.standings.forEach((standing, index) => {
          previousPositions.set(standing.teamId, index + 1);
        });
      });

      calculateGroupStandings(updatedTournament).forEach((group) => {
        group.standings.forEach((standing, index) => {
          nextPositions.set(standing.teamId, index + 1);
        });
      });

      updatedTournament.groupRankChanges = Object.fromEntries(
        Array.from(nextPositions.entries())
          .filter(([teamId, current]) => previousPositions.get(teamId) && previousPositions.get(teamId) !== current)
          .map(([teamId, current]) => [teamId, { previous: previousPositions.get(teamId)!, current }]),
      );
    }

    setTournament(updatedTournament);

    if (isDemoMode) return;

    try {
      await client.patch(`/api/tournaments/${tournament.id}`, { data: updatedTournament });
    } catch (error) {
      console.error('Failed to update tournament:', error);
    }
  };


  const restartTournament = async () => {
    if (!tournament) return;

    // Shuffle teams
    const shuffledTeams = [...tournament.teams].sort(() => Math.random() - 0.5);
    
    // Generate new matches
    const newMatches = generateMatches(
      tournament.format,
      shuffledTeams,
      tournament.swissConfig,
      tournament.groupKnockoutConfig,
    );
    
    const updatedTournament: Tournament = {
      ...tournament,
      teams: shuffledTeams,
      matches: newMatches,
      createdAt: Date.now(),
    };

    const syncedTournament = applyTournamentAutoSync(updatedTournament);

    setTournament(syncedTournament);
    setView('tournament');
    window.history.pushState({}, '', `/${tournament.id}`);
    
    if (isDemoMode) return;

    const t = tournaments.find(t => t.data.id === tournament.id);
    if (t) {
      try {
        await client.patch(`/api/tournaments/${t.id}`, { data: syncedTournament });
        const response = await client.get('/api/tournaments/');
        const data = response.data;
        const normalized = Array.isArray(data)
          ? data.map((item: any) => ({
              ...item,
              data: normalizeTournamentData(item.data || item),
            }))
          : [];
        setTournaments(normalized);
      } catch (error) {
        console.error('Failed to restart tournament:', error);
      }
    }
  };

  const updateTournamentData = async (updated: Tournament) => {
    const syncedTournament = applyTournamentAutoSync(updated);
    setTournament(syncedTournament);
    if (isDemoMode) return;
    const t = tournaments.find(t => t.data.id === syncedTournament.id);
    if (t) {
      try {
        await client.patch(`/api/tournaments/${t.id}`, { data: syncedTournament });
        const response = await client.get('/api/tournaments/');
        const data = response.data;
        const normalized = Array.isArray(data)
          ? data.map((item: any) => ({
              ...item,
              data: normalizeTournamentData(item.data || item),
            }))
          : [];
        setTournaments(normalized);
      } catch (error) {
        console.error('Failed to update tournament data:', error);
      }
    }
  };

  const resetTournament = () => {
    window.history.pushState({}, '', '/');
    setTournament(null);
    setView(isDemoMode ? 'demo' : 'dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsDemoMode(false);
    setTournament(null);
    setTournaments([]);
    setView('landing');
    setIsMobileNavOpen(false);
    window.history.pushState({}, '', '/');
  };

  const displayName = isDemoMode
    ? t('demoUser')
    : user?.email
      ? user.email.split('@')[0]
      : 'User';
  const displayEmail = isDemoMode ? 'demo@arenamaster.com' : user?.email || '';
  const displayInitial = displayName ? displayName[0].toUpperCase() : 'U';

  const clearAllData = async () => {
    try {
      // Delete all tournaments from backend
      for (const t of tournaments) {
        await client.delete(`/api/tournaments/${t.id}`);
      }
      setTournaments([]);
      setTournament(null);
      setView('landing');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && !isDemoMode && view !== 'landing' && view !== 'info') {
    return (
      <Login
        mode={view === 'signup' ? 'signup' : 'login'}
        onBack={() => {
          setView('landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (user && (view === 'login' || view === 'signup')) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-sm text-zinc-500 mb-4">Redirecting to dashboard...</div>
          <button
            onClick={() => setView('dashboard')}
            className="w-full mb-3 px-5 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-5 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-xl hover:bg-zinc-700 transition-all"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
        <LandingPage 
          onGetStarted={() => {
            setIsDemoMode(false);
            setView('signup');
          }} 
          onLogIn={() => {
            setIsDemoMode(false);
            setView('login');
          }} 
          onViewDemo={() => {
            setIsDemoMode(true);
          const demos = getDemoTournaments();
          setTournaments(demos.map(d => ({ id: d.id, name: d.name, data: d })));
          setView('demo');
        }}
        onShowInfo={() => setView('info')}
        t={t}
      />
    );
  }

  if (view === 'info') {
    const handleInfoBack = () => {
      const nextView = lastView === 'info' ? 'landing' : lastView;
      setView(nextView);
      if (nextView === 'landing') {
        window.history.pushState({}, '', '/');
      }
    };
    return (
      <TournamentInfo 
        onBack={handleInfoBack}
        isLoggedIn={view !== 'landing'}
        t={t}
      />
    );
  }

  const Sidebar = () => (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen sticky top-0">
      <div className="px-8 py-10 flex items-center gap-3">
        <img src="/logo.png" alt="Arena Master Logo" className="w-8 h-8 rounded shrink-0 object-cover" />
        <span className="text-xl font-black tracking-tighter uppercase italic">Arena Master</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <button 
          onClick={() => {
            setView(isDemoMode ? 'demo' : 'dashboard');
            setIsMobileNavOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            view === 'dashboard' || view === 'demo' ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          {isDemoMode ? t('demoDashboard') : t('tournaments')}
        </button>
        <button 
          onClick={() => {
            setView('info');
            setIsMobileNavOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            view === 'info' ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          {t('howItWorks')}
        </button>
        {!isDemoMode && (
          <button 
            onClick={() => {
              setView('settings');
              setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              view === 'settings' ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            {t('settings')}
          </button>
        )}
      </nav>

        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl mb-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-500">
              {isDemoMode ? 'D' : displayInitial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{displayName}</div>
              <div className="text-[10px] text-zinc-600 truncate">{displayEmail}</div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (isDemoMode) {
                setIsDemoMode(false);
                setView('landing');
                window.history.pushState({}, '', '/');
                setIsMobileNavOpen(false);
                return;
              }
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:text-red-500 transition-all"
          >
          <LogOut className="w-5 h-5" />
          {isDemoMode ? t('exitDemo') : t('logout')}
        </button>
      </div>
    </aside>
  );

  const MobileSidebar = () => (
    <div
      className={`fixed inset-0 z-[70] sm:hidden transition-opacity ${
        isMobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsMobileNavOpen(false)}
      />
      <div
        className={`absolute left-0 top-0 h-full transform transition-transform duration-300 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  const MobileHeader = ({ title }: { title: string }) => (
    <div className="sm:hidden sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => setIsMobileNavOpen(true)}
        className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
        {title}
      </div>
      <div className="w-9" />
    </div>
  );

  if (view === 'dashboard' || view === 'demo') {
    return (
      <div className="flex min-h-screen text-white">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <main className="flex-1">
          <MobileHeader title={t('myTournaments')} />
          <Dashboard 
            tournaments={tournaments} 
            t={t}
            onSelect={selectTournament} 
            onCreateNew={isDemoMode ? undefined : () => setView('setup')} 
            onDelete={isDemoMode ? undefined : deleteTournament}
            onUpdateName={isDemoMode ? undefined : updateTournamentName}
          />
        </main>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="flex min-h-screen text-white">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <main className="flex-1 py-6 sm:py-12 px-4 sm:px-8">
          <MobileHeader title={t('tournaments')} />
          <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
            <button 
              onClick={() => setView(isDemoMode ? 'demo' : 'dashboard')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('backToDashboard')}
            </button>
          </div>
          <TournamentSetup t={t} onStart={startTournament} />
        </main>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="flex min-h-screen text-white">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <main className="flex-1">
          <MobileHeader title={t('settings')} />
          <Settings 
            settings={appSettings}
            t={t}
            onUpdateSettings={(newSettings) => setAppSettings(prev => ({ ...prev, ...newSettings }))}
            onClearData={clearAllData} 
          />
        </main>
      </div>
    );
  }

  if (view === 'tournament' && tournament) {
    const standings = calculateStandings(tournament.teams, tournament.matches, tournament.pointsConfig);
    const isLeague = tournament.format === TournamentFormat.LEAGUE_SINGLE || tournament.format === TournamentFormat.LEAGUE_DOUBLE || tournament.format === TournamentFormat.SWISS;
    
    // Swiss round completion check
    const currentRoundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
    const isRoundComplete = currentRoundMatches.every(m => m.status === MatchStatus.PLAYED);
    const hasMoreRounds = tournament.format === TournamentFormat.SWISS && 
                         tournament.swissConfig && 
                         (tournament.currentRound || 1) < tournament.swissConfig.rounds;

    return (
      <div className="flex min-h-screen text-zinc-100">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-black/80 backdrop-blur-md border-b border-zinc-900 h-16 sm:h-20 flex-shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileNavOpen(true)}
                  className="sm:hidden p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setView(isDemoMode ? 'demo' : 'dashboard')}
                  className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-black" />
                  </div>
                  <h1 className="font-bold text-zinc-100 truncate max-w-[140px] sm:max-w-md">
                    {tournament.name}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {tournament.format === TournamentFormat.SWISS && isRoundComplete && hasMoreRounds && (
                  <button
                    onClick={generateNextSwissRoundAction}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-black bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {t('generateNextRound')}
                  </button>
                )}
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-lg transition-all border border-zinc-800"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? t('copied') : t('share')}</span>
                </button>
                <button
                  onClick={() => setShowRestartConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('restart')}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <div className="bg-zinc-950/50 border-b border-zinc-900 flex-shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                    activeTab === 'overview' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="font-bold">{t('overview')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                    activeTab === 'teams' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{t('teams')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                    activeTab === 'matches' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  <span className="font-bold">{t('matches')}</span>
                </button>
                {tournament.format === TournamentFormat.GROUP_KNOCKOUT && (
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                      activeTab === 'groups'
                        ? 'border-green-500 text-green-500'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-bold">Groups</span>
                  </button>
                )}
                {(tournament.format === TournamentFormat.LEAGUE_SINGLE ||
                  tournament.format === TournamentFormat.LEAGUE_DOUBLE ||
                  tournament.format === TournamentFormat.LEAGUE_KNOCKOUT ||
                  tournament.format === TournamentFormat.SWISS) && (
                  <button
                    onClick={() => setActiveTab('standings')}
                    className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                      activeTab === 'standings'
                        ? 'border-green-500 text-green-500'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="font-bold">{t('standings')}</span>
                  </button>
                )}
                {(tournament.format === TournamentFormat.GROUP_KNOCKOUT ||
                  tournament.format === TournamentFormat.LEAGUE_KNOCKOUT ||
                  tournament.format === TournamentFormat.SINGLE_ELIMINATION ||
                  tournament.format === TournamentFormat.KNOCKOUT_HOME_AWAY) && (
                  <button
                    onClick={() => setActiveTab('bracket')}
                    className={`flex items-center gap-2 py-5 border-b-2 transition-all ${
                      activeTab === 'bracket'
                        ? 'border-green-500 text-green-500'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="font-bold">Bracket</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Overview 
                      tournament={tournament} 
                      onUpdateTournament={updateTournamentData}
                    />
                  </motion.div>
                ) : activeTab === 'teams' ? (
                  <motion.div
                    key="teams"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TeamsView 
                      tournament={tournament} 
                      onUpdateTeamName={updateTeamNameGlobal} 
                    />
                  </motion.div>
                ) : activeTab === 'matches' ? (
                  <motion.div
                    key="matches"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MatchList 
                      tournament={tournament}
                      onUpdateScore={updateMatchScore} 
                    />
                  </motion.div>
                ) : activeTab === 'groups' ? (
                  <motion.div
                    key="groups"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GroupStageView tournament={tournament} onUpdateScore={updateMatchScore} />
                  </motion.div>
                ) : activeTab === 'bracket' ? (
                  <motion.div
                    key="bracket"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <KnockoutBracketView tournament={tournament} onUpdateScore={updateMatchScore} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="standings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <StandingsTable standings={standings} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Restart Confirmation Modal */}
          <AnimatePresence>
            {showRestartConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRestartConfirm(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] max-w-sm w-full shadow-2xl"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <RotateCcw className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black text-center mb-2">{t('restartConfirmTitle')}</h3>
                  <p className="text-zinc-400 text-center mb-8 font-medium">
                    {t('restartConfirmDesc')}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowRestartConfirm(false)}
                      className="flex-1 py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={() => {
                        restartTournament();
                        setShowRestartConfirm(false);
                      }}
                      className="flex-1 py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                    >
                      {t('restart')}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return null;
}

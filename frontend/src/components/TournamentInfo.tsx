import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Swords, LayoutDashboard, Users, Info, ChevronLeft, Zap, Shield, Target } from 'lucide-react';

import { TranslationKey } from '../i18n';

interface TournamentInfoProps {
  onBack?: () => void;
  isLoggedIn?: boolean;
  t: (key: TranslationKey) => string;
}

export const TournamentInfo: React.FC<TournamentInfoProps> = ({ onBack, isLoggedIn, t }) => {
  const formats = [
    {
      id: 'knockout',
      title: 'Knockout (Single Elimination)',
      icon: <Trophy className="w-6 h-6 text-orange-500" />,
      description: 'The most dramatic format. Teams are paired up, and the loser is immediately eliminated. The winners advance until only one champion remains.',
      pros: ['High stakes', 'Fast progression', 'Clear winner'],
      cons: ['Teams only guaranteed one match', 'Luck of the draw matters'],
      bestFor: 'Cup competitions, quick events, large number of teams.'
    },
    {
      id: 'league',
      title: 'League (Round Robin)',
      icon: <LayoutDashboard className="w-6 h-6 text-blue-500" />,
      description: 'Every team plays against every other team. Points are awarded for wins and draws. The team with the most points at the end wins.',
      pros: ['Fairness (everyone plays everyone)', 'More matches for all teams', 'Consistent performance wins'],
      cons: ['Takes longer', 'Can have "dead" matches at the end'],
      bestFor: 'Seasonal play, professional leagues, small groups.'
    },
    {
      id: 'group-knockout',
      title: 'Groups + Qualifiers',
      icon: <Users className="w-6 h-6 text-yellow-500" />,
      description: 'The World Cup style. Teams are divided into groups for a round-robin stage. The top performers from each group advance to a knockout bracket.',
      pros: ['Guaranteed matches first', 'Dramatic playoff finale', 'Professional feel'],
      cons: ['Requires group balancing', 'Complex schedule'],
      bestFor: 'Large tournaments, corporate events, realistic Pro Cup feel.'
    },
    {
      id: 'league-playoffs',
      title: 'League + Playoffs (Pro)',
      icon: <Shield className="w-6 h-6 text-green-500" />,
      description: 'The ultimate hybrid. Everyone plays in one big league, but only the top few (Top 2, 4, or 8) reach the high-stakes final bracket.',
      pros: ['Total fairness in league', 'Unbeatable climax', 'Live sync to bracket'],
      cons: ['Longest duration', 'High fatigue'],
      bestFor: 'Seasonal championships, esports circuits, finding the absolute best.'
    },
    {
      id: 'swiss',
      title: 'Swiss System',
      icon: <Swords className="w-6 h-6 text-cyan-500" />,
      description: 'Skill-based pairing. In each round, teams face opponents with a similar record. No one is eliminated, and the competition stays balanced.',
      pros: ['Skill-balanced matches', 'No elimination', 'Fewer rounds than a league'],
      cons: ['Complex logic', 'Harder to track manually'],
      bestFor: 'Chess, Esports, Card games, many teams but limited time.'
    },
    {
      id: 'home-away',
      title: 'Home & Away (Knockout)',
      icon: <Target className="w-6 h-6 text-purple-500" />,
      description: 'Knockout format where each pairing consists of two matches. The team with the highest aggregate score across both legs advances.',
      pros: ['Reduces home-field bias', 'Strategic depth'],
      cons: ['More matches', 'Aggregate math required'],
      bestFor: 'Professional style playoffs, high-level competitive play.'
    }
  ];

  return (
    <div className={`min-h-screen ${isLoggedIn ? 'bg-transparent' : 'bg-zinc-950'} text-white pb-20`}>
      <div className="max-w-5xl mx-auto px-6 pt-12">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {t('back')}
          </button>
        )}

        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {t('tournamentFormats')}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            {t('chooseRightStructure')}
          </p>
        </div>

        <div className="grid gap-12">
          {formats.map((format, index) => (
            <motion.div
              key={format.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 md:p-12 bg-zinc-900/50 border border-zinc-800 rounded-[40px] hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {format.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-black mb-4">{format.title}</h2>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    {format.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-green-500">{t('advantages')}</h4>
                      <ul className="space-y-2">
                        {format.pros.map((pro, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                            <Zap className="w-4 h-4 text-green-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-500">{t('considerations')}</h4>
                      <ul className="space-y-2">
                        {format.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                            <Shield className="w-4 h-4 text-red-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 block mb-2">Best For</span>
                    <p className="text-zinc-300 font-medium">{format.bestFor}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-green-500 rounded-[40px] text-black text-center">
          <h3 className="text-3xl font-black mb-4">{t('stillNotSure')}</h3>
          <p className="text-black/70 font-bold mb-8 max-w-xl mx-auto">
            {t('tryDemoTournaments')}
          </p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-black text-white font-black rounded-2xl hover:bg-zinc-900 transition-all shadow-xl"
          >
            {t('getStartedNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

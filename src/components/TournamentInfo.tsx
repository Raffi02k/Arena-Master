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
      description: 'The most dramatic format. Teams are paired up, and the loser is immediately eliminated from the tournament. The winners advance to the next round until only one champion remains.',
      pros: ['High stakes', 'Fast progression', 'Clear winner'],
      cons: ['Teams only guaranteed one match', 'Luck of the draw matters'],
      bestFor: 'Cup competitions, quick events, large number of teams.'
    },
    {
      id: 'league',
      title: 'League (Round Robin)',
      icon: <LayoutDashboard className="w-6 h-6 text-blue-500" />,
      description: 'Every team plays against every other team in the tournament. Points are awarded for wins and draws. The team with the most points at the end of all rounds is the winner.',
      pros: ['Fairness (everyone plays everyone)', 'More matches for all teams', 'Consistent performance wins'],
      cons: ['Takes much longer', 'Can have "dead" matches at the end'],
      bestFor: 'Seasonal play, professional leagues, small groups.'
    },
    {
      id: 'swiss',
      title: 'Swiss System',
      icon: <Swords className="w-6 h-6 text-green-500" />,
      description: 'A skill-based pairing system. In each round, teams are matched against opponents with a similar win-loss record. No one is eliminated, and you always play someone at your level.',
      pros: ['Skill-based matching', 'No elimination', 'Fewer rounds than a full league'],
      cons: ['Complex pairing logic', 'Harder to track standings manually'],
      bestFor: 'Chess, Esports, Card games, tournaments with many teams but limited time.'
    },
    {
      id: 'home-away',
      title: 'Home & Away (Knockout)',
      icon: <Target className="w-6 h-6 text-purple-500" />,
      description: 'Similar to Single Elimination, but each pairing consists of two matches. The team with the highest aggregate score across both matches advances.',
      pros: ['Reduces home-field advantage', 'More balanced results'],
      cons: ['Twice as many matches', 'Aggregate scoring can be confusing'],
      bestFor: 'Champions League style playoffs, high-level competitive play.'
    }
  ];

  return (
    <div className={`min-h-screen ${isLoggedIn ? 'bg-black' : 'bg-zinc-950'} text-white pb-20`}>
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

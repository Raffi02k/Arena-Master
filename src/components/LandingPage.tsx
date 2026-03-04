import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Calendar, BarChart3, Share2, Zap, ArrowRight } from 'lucide-react';

import { TranslationKey } from '../i18n';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
  onShowInfo: () => void;
  t: (key: TranslationKey) => string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewDemo, onShowInfo, t }) => {
  const features = [
    {
      icon: <Trophy className="w-6 h-6 text-green-500" />,
      title: "Multiple Formats",
      description: "Knockout, league, home & away - support for all tournament types"
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Team Management",
      description: "Add, edit, and manage teams with ease"
    },
    {
      icon: <Calendar className="w-6 h-6 text-green-500" />,
      title: "Auto Scheduling",
      description: "Matches generated automatically based on your format"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-500" />,
      title: "Live Standings",
      description: "Real-time tables with points and goal difference"
    },
    {
      icon: <Share2 className="w-6 h-6 text-green-500" />,
      title: "Share Tournaments",
      description: "Share your tournament with a unique link"
    },
    {
      icon: <Zap className="w-6 h-6 text-green-500" />,
      title: "Instant Results",
      description: "Enter scores and see tables update instantly"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Arena</span>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={onShowInfo}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {t('howItWorks')}
            </button>
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">{t('logIn')}</button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-green-500 text-black text-sm font-bold rounded-lg hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              {t('signUp')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              Create tournaments <span className="text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">in seconds</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-2xl">
              The ultimate tournament generator for sports and esports. 
              Knockout, leagues, standings - everything you need to organize competitive events.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-green-500 text-black text-lg font-black rounded-xl hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-2 group"
              >
                {t('getStartedFree')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onViewDemo}
                className="px-8 py-4 bg-zinc-900 text-white text-lg font-bold rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all"
              >
                {t('viewDemo')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('everythingYouNeed')}</h2>
            <p className="text-zinc-400 text-lg">{t('powerfulFeatures')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-green-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-12">Support for all formats</h2>
            <div className="space-y-6">
              {[
                { title: "Knockout (Single Elimination)", desc: "Classic elimination format - lose once and you're out" },
                { title: "Knockout (Home & Away)", desc: "Two-legged ties with aggregate scoring" },
                { title: "League (Single Round)", desc: "Everyone plays each other once" },
                { title: "League (Double Round)", desc: "Home and away matches for every team" }
              ].map((format, i) => (
                <div key={i} className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:bg-zinc-900/50 transition-all cursor-default">
                  <h4 className="font-bold mb-1">{format.title}</h4>
                  <p className="text-sm text-zinc-500">{format.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-green-500/10 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-black text-green-500 tracking-widest uppercase">Live Standings</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left pb-4 font-medium uppercase tracking-tighter">Team</th>
                    <th className="pb-4 font-medium uppercase tracking-tighter">P</th>
                    <th className="pb-4 font-medium uppercase tracking-tighter">W</th>
                    <th className="pb-4 font-medium uppercase tracking-tighter">GD</th>
                    <th className="pb-4 font-medium uppercase tracking-tighter">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { name: "Team Alpha", p: 6, w: 5, gd: "+12", pts: 16 },
                    { name: "Team Beta", p: 6, w: 4, gd: "+8", pts: 13 },
                    { name: "Team Gamma", p: 6, w: 2, gd: "+1", pts: 8 }
                  ].map((team, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 font-bold">{team.name}</td>
                      <td className="py-4 text-center text-zinc-400">{team.p}</td>
                      <td className="py-4 text-center text-zinc-400">{team.w}</td>
                      <td className="py-4 text-center text-green-500 font-bold">{team.gd}</td>
                      <td className="py-4 text-center font-black">{team.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">{t('readyToCreate')}</h2>
          <p className="text-xl text-zinc-400 mb-12">{t('joinThousands')}</p>
          <button 
            onClick={onGetStarted}
            className="px-12 py-5 bg-green-500 text-black text-xl font-black rounded-2xl hover:bg-green-400 transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)]"
          >
            {t('createFreeAccount')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold">Arena</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2024 Arena Tournament Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

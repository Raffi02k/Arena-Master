import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Calendar, Plus, MoreVertical, LayoutGrid } from 'lucide-react';
import { Tournament } from '../types';

import { TranslationKey } from '../i18n';

interface DashboardProps {
  tournaments: any[];
  t: (key: TranslationKey) => string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tournaments, t, onSelect, onCreateNew, onDelete, onUpdateName }) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onUpdateName(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">{t('myTournaments')}</h1>
          <p className="text-zinc-500 font-medium">{t('manageCompetitions')}</p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-black rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <Plus className="w-5 h-5" />
            {t('createNew')}
          </button>
        )}
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-32 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px]">
          <Trophy className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-zinc-400 mb-2">{t('noTournaments')}</h3>
          <p className="text-zinc-600 mb-8">{t('startFirst')}</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-8 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
            >
              {t('getStarted')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((t_item, index) => {
            const data = t_item.data as Tournament;
            const playedMatches = data.matches.filter(m => m.status === 'PLAYED').length;
            const isEditing = editingId === t_item.id;
            
            return (
              <motion.div
                key={t_item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !isEditing && onSelect(t_item.id)}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 hover:border-green-500/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1 mr-4">
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(t_item.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(t_item.id)}
                        className="w-full bg-zinc-950 border border-green-500/50 rounded-lg px-3 py-1 text-white font-bold outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-xl font-black mb-2 group-hover:text-green-500 transition-colors">{t_item.name}</h3>
                    )}
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-md">
                        {data.format.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {(onDelete || onUpdateName) && (
                    <div className="relative group/menu">
                      <button 
                        className="p-2 text-zinc-600 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                        {onUpdateName && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(t_item.id, t_item.name);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                          >
                            {t('editName')}
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(t('delete') + '?')) onDelete(t_item.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            {t('delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <Users className="w-4 h-4 text-zinc-700 mx-auto mb-2" />
                    <div className="text-lg font-black">{data.teams.length}</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase">{t('teams')}</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-4 h-4 text-zinc-700 mx-auto mb-2" />
                    <div className="text-lg font-black">{data.matches.length}</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase">{t('matches')}</div>
                  </div>
                  <div className="text-center">
                    <LayoutGrid className="w-4 h-4 text-zinc-700 mx-auto mb-2" />
                    <div className="text-lg font-black">{playedMatches}</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase">{t('played')}</div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 group-hover:bg-green-500/20 transition-colors">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(playedMatches / data.matches.length) * 100}%` }}
                    className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

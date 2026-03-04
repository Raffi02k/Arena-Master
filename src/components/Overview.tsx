import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Calendar, Users, Settings, Info, Mail, Phone, MapPin, Edit2, Check, X, Save } from 'lucide-react';
import { Tournament, TournamentFormat, PointsConfig, ContactInfo } from '../types';

interface OverviewProps {
  tournament: Tournament;
  onUpdateTournament: (updated: Tournament) => void;
}

const Overview: React.FC<OverviewProps> = ({ tournament, onUpdateTournament }) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);

  const [editData, setEditData] = useState<Tournament>(tournament);

  const playedMatches = tournament.matches.filter(m => m.status === 'PLAYED').length;
  const progress = (playedMatches / tournament.matches.length) * 100;

  const handleSave = () => {
    onUpdateTournament(editData);
    setIsEditingDetails(false);
    setIsEditingSettings(false);
    setIsEditingContacts(false);
  };

  const handleCancel = () => {
    setEditData(tournament);
    setIsEditingDetails(false);
    setIsEditingSettings(false);
    setIsEditingContacts(false);
  };

  const updatePoints = (field: keyof PointsConfig, value: string) => {
    const num = parseInt(value) || 0;
    setEditData({
      ...editData,
      pointsConfig: {
        win: 3,
        draw: 1,
        loss: 0,
        ...editData.pointsConfig,
        [field]: num
      }
    });
  };

  const updateContact = (field: keyof ContactInfo, value: string) => {
    setEditData({
      ...editData,
      contactInfo: {
        email: 'support@arena.com',
        phone: '+1 (555) 000-0000',
        location: 'Arena HQ, Global',
        ...editData.contactInfo,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-4xl font-black mb-2">{progress.toFixed(0)}%</div>
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Completion</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-green-500"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-4xl font-black mb-2">{tournament.teams.length}</div>
          <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Active Teams</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-4xl font-black mb-2">{tournament.matches.length}</div>
          <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total Matches</div>
        </motion.div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-green-500 rounded-full" />
              <h3 className="text-2xl font-black">Details</h3>
            </div>
            {!isEditingDetails ? (
              <button 
                onClick={() => setIsEditingDetails(true)}
                className="p-2 text-zinc-600 hover:text-white transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleCancel} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleSave} className="p-2 text-green-500 hover:text-green-400 transition-colors">
                  <Save className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Info className="w-5 h-5" />
                <span>Status</span>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg font-black text-xs uppercase tracking-widest">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Calendar className="w-5 h-5" />
                <span>Created</span>
              </div>
              <span className="text-white font-bold">
                {new Date(tournament.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Trophy className="w-5 h-5" />
                <span>Format</span>
              </div>
              <span className="text-white font-bold uppercase tracking-widest text-xs">
                {tournament.format.replace('_', ' ')}
              </span>
            </div>
            {tournament.format === TournamentFormat.SWISS && (
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3 text-zinc-400 font-bold">
                  <Calendar className="w-5 h-5" />
                  <span>Round</span>
                </div>
                <span className="text-white font-bold">
                  {tournament.currentRound} / {tournament.swissConfig?.rounds}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-green-500 rounded-full" />
              <h3 className="text-2xl font-black">Tournament Settings</h3>
            </div>
            {!isEditingSettings ? (
              <button 
                onClick={() => setIsEditingSettings(true)}
                className="p-2 text-zinc-600 hover:text-white transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleCancel} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleSave} className="p-2 text-green-500 hover:text-green-400 transition-colors">
                  <Save className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Settings className="w-5 h-5" />
                <span>Legs</span>
              </div>
              <span className="text-white font-bold">
                {tournament.format.includes('DOUBLE') || tournament.format.includes('HOME_AWAY') ? '2' : '1'}
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Info className="w-5 h-5" />
                <span>Points (W, D, L)</span>
              </div>
              {isEditingSettings ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editData.pointsConfig?.win ?? 3}
                    onChange={(e) => updatePoints('win', e.target.value)}
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center font-bold"
                  />
                  <input
                    type="number"
                    value={editData.pointsConfig?.draw ?? 1}
                    onChange={(e) => updatePoints('draw', e.target.value)}
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center font-bold"
                  />
                  <input
                    type="number"
                    value={editData.pointsConfig?.loss ?? 0}
                    onChange={(e) => updatePoints('loss', e.target.value)}
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center font-bold"
                  />
                </div>
              ) : (
                <span className="text-white font-bold">
                  {tournament.pointsConfig?.win ?? 3}, {tournament.pointsConfig?.draw ?? 1}, {tournament.pointsConfig?.loss ?? 0}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 text-zinc-400 font-bold">
                <Users className="w-5 h-5" />
                <span>Max Teams</span>
              </div>
              <span className="text-white font-bold">{tournament.teams.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contacts Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-green-500 rounded-full" />
            <h3 className="text-2xl font-black">Contacts</h3>
          </div>
          {!isEditingContacts ? (
            <button 
              onClick={() => setIsEditingContacts(true)}
              className="p-2 text-zinc-600 hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} className="p-2 text-green-500 hover:text-green-400 transition-colors">
                <Save className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Email</div>
              {isEditingContacts ? (
                <input
                  type="text"
                  value={editData.contactInfo?.email ?? 'support@arena.com'}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 outline-none text-sm font-bold"
                />
              ) : (
                <div className="text-sm font-bold truncate">{tournament.contactInfo?.email ?? 'support@arena.com'}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Phone</div>
              {isEditingContacts ? (
                <input
                  type="text"
                  value={editData.contactInfo?.phone ?? '+1 (555) 000-0000'}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 outline-none text-sm font-bold"
                />
              ) : (
                <div className="text-sm font-bold truncate">{tournament.contactInfo?.phone ?? '+1 (555) 000-0000'}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Location</div>
              {isEditingContacts ? (
                <input
                  type="text"
                  value={editData.contactInfo?.location ?? 'Arena HQ, Global'}
                  onChange={(e) => updateContact('location', e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 outline-none text-sm font-bold"
                />
              ) : (
                <div className="text-sm font-bold truncate">{tournament.contactInfo?.location ?? 'Arena HQ, Global'}</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;

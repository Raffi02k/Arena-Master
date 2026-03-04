import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, Palette, Database, Trash2, ChevronRight, Check, AlertTriangle, Users, Edit2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { TranslationKey } from '../i18n';

interface SettingsProps {
  settings: {
    language: 'en' | 'sv';
    accentColor: 'green' | 'blue' | 'purple' | 'orange';
    defaultPoints: { win: number; draw: number; loss: number };
    user: { name: string; email: string };
  };
  t: (key: TranslationKey) => string;
  onUpdateSettings: (settings: any) => void;
  onClearData: () => void;
}

export default function Settings({ settings, t, onUpdateSettings, onClearData }: SettingsProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUser, setTempUser] = useState(settings.user);
  
  const accents = [
    { name: 'Green', color: 'bg-green-500', value: 'green' },
    { name: 'Blue', color: 'bg-blue-500', value: 'blue' },
    { name: 'Purple', color: 'bg-purple-500', value: 'purple' },
    { name: 'Orange', color: 'bg-orange-500', value: 'orange' },
  ] as const;

  const handleUserSave = () => {
    onUpdateSettings({ user: tempUser });
    setIsEditingUser(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-8">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black">{t('settings')}</h1>
          <p className="text-zinc-500 font-medium">Manage your application preferences</p>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        {/* User Profile Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold">{t('editProfile')}</h2>
            </div>
            {!isEditingUser ? (
              <button 
                onClick={() => setIsEditingUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all"
              >
                <Edit2 className="w-4 h-4" />
                {t('editProfile')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingUser(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleUserSave}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-xl text-sm font-bold transition-all"
                >
                  {t('saveChanges')}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Name</label>
              {isEditingUser ? (
                <input
                  type="text"
                  value={tempUser.name}
                  onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              ) : (
                <div className="text-lg font-bold p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">{settings.user.name}</div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
              {isEditingUser ? (
                <input
                  type="email"
                  value={tempUser.email}
                  onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                />
              ) : (
                <div className="text-lg font-bold p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">{settings.user.email}</div>
              )}
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-bold">{t('appearance')}</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 block">{t('accentColor')}</label>
              <div className="flex gap-4">
                {accents.map((accent) => (
                  <button
                    key={accent.value}
                    onClick={() => onUpdateSettings({ accentColor: accent.value })}
                    className={`group relative w-12 h-12 rounded-xl transition-all ${accent.color} ${
                      settings.accentColor === accent.value ? 'ring-4 ring-white/20 scale-110' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {settings.accentColor === accent.value && (
                      <Check className="w-6 h-6 text-black absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tournament Defaults Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-bold">Tournament Defaults</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('winPoints')}</label>
              <input
                type="number"
                value={settings.defaultPoints.win}
                onChange={(e) => onUpdateSettings({ defaultPoints: { ...settings.defaultPoints, win: parseInt(e.target.value) || 0 } })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('drawPoints')}</label>
              <input
                type="number"
                value={settings.defaultPoints.draw}
                onChange={(e) => onUpdateSettings({ defaultPoints: { ...settings.defaultPoints, draw: parseInt(e.target.value) || 0 } })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('lossPoints')}</label>
              <input
                type="number"
                value={settings.defaultPoints.loss}
                onChange={(e) => onUpdateSettings({ defaultPoints: { ...settings.defaultPoints, loss: parseInt(e.target.value) || 0 } })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Localization Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-bold">{t('localization')}</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg">
                {settings.language === 'en' ? '🇺🇸' : '🇸🇪'}
              </div>
              <div>
                <div className="font-bold">{t('language')}</div>
                <div className="text-xs text-zinc-500">Choose your preferred language</div>
              </div>
            </div>
            <div className="flex bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  settings.language === 'en' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'sv' })}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  settings.language === 'sv' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Svenska
              </button>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-bold">{t('dataManagement')}</h2>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
            <div>
              <div className="font-bold text-red-400">{t('clearAllData')}</div>
              <div className="text-sm text-zinc-500">Permanently delete all tournaments and teams</div>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('resetApp')}
            </button>
          </div>
        </section>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-center mb-2">{t('resetConfirmTitle')}</h3>
              <p className="text-zinc-400 text-center mb-8 font-medium">
                {t('resetConfirmDesc')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onClearData();
                    setShowClearConfirm(false);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Yes, Delete All Data
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

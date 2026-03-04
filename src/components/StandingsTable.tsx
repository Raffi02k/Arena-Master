import React from 'react';
import { Standing } from '../types';

interface StandingsTableProps {
  standings: Standing[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950/50 border-b border-zinc-800">
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Pos</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Team</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">P</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">W</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">D</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">L</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">GD</th>
              {standings.some(s => s.buchholz !== undefined) && (
                <>
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">BH</th>
                  <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">SB</th>
                </>
              )}
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {standings.map((standing, index) => (
              <tr key={standing.teamId} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black italic tracking-tighter ${
                    index === 0 
                      ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-zinc-700'}`} />
                    <span className="font-bold text-zinc-100 uppercase tracking-tight text-sm group-hover:text-green-500 transition-colors">
                      {standing.teamName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-400 font-mono text-xs">{standing.played}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-400 font-mono text-xs">{standing.wins}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-400 font-mono text-xs">{standing.draws}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-400 font-mono text-xs">{standing.losses}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center font-black text-zinc-100 italic tracking-tighter">
                  {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                </td>
                {standing.buchholz !== undefined && (
                  <>
                    <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-500 font-mono text-[10px]">{standing.buchholz}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-center text-zinc-500 font-mono text-[10px]">{standing.sonnebornBerger?.toFixed(1)}</td>
                  </>
                )}
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg font-black text-sm italic tracking-tighter ${
                    index === 0 ? 'text-green-500' : 'text-white'
                  }`}>
                    {standing.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

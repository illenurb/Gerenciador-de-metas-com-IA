import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { XP_PER_LEVEL } from '../../utils/gamification';
import AchievementsModal from '../dashboard/AchievementsModal';

const Header: React.FC = () => {
  const { user } = useUser();
  const [isAchievementsModalOpen, setAchievementsModalOpen] = useState(false);
  
  const xpPercentage = user ? (user.xp / XP_PER_LEVEL) * 100 : 0;

  return (
    <>
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Gerenciador de Metas</h1>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setAchievementsModalOpen(true)}
                  className="flex items-center gap-3 cursor-pointer group"
                  aria-label={`Nível ${user.level}, ${user.xp} de ${XP_PER_LEVEL} XP. Ver conquistas.`}
                >
                  <div className="text-right">
                    <span className="font-bold text-sky-400 group-hover:text-sky-300 transition-colors">Nível {user.level}</span>
                    <p className="text-xs text-slate-400">{user.xp} / {XP_PER_LEVEL} XP</p>
                  </div>
                  <div className="w-24 h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {user && <AchievementsModal 
        isOpen={isAchievementsModalOpen} 
        onClose={() => setAchievementsModalOpen(false)}
        achievements={user.achievements}
      />}
    </>
  );
};

export default Header;
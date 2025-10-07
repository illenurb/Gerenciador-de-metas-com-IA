import React from 'react';
import Modal from '../ui/Modal';
import { ACHIEVEMENTS } from '../../utils/gamification';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: string[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, achievements }) => {
    const allAchievementKeys = Object.keys(ACHIEVEMENTS);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Minhas Conquistas">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {allAchievementKeys.map(key => {
                    const achievement = ACHIEVEMENTS[key];
                    const isUnlocked = achievements.includes(key);

                    return (
                        <div 
                            key={key}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-opacity ${isUnlocked ? 'bg-slate-700/80 border-sky-500/50 opacity-100' : 'bg-slate-800 border-slate-700 opacity-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-sky-500' : 'bg-slate-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.342A4.995 4.995 0 006.5 8.5c0 1.848 1.006 3.424 2.5 4.158V16a1 1 0 102 0v-3.342c1.494-.734 2.5-2.31 2.5-4.158 0-2.485-2.015-4.5-4.5-4.5V3a1 1 0 00-1-1zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{achievement.title}</h3>
                                <p className="text-sm text-slate-400">{achievement.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default AchievementsModal;

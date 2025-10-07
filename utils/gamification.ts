import { User, Goal, Habit } from '../types';

export const XP_PER_LEVEL = 100;

export const ACHIEVEMENTS: { [key: string]: { title: string, description: string, condition: (user: User, goals: Goal[], habits: Habit[]) => boolean } } = {
    'FIRST_HABIT': {
        title: 'Primeiro Passo',
        description: 'Complete um hábito pela primeira vez.',
        condition: (user, goals, habits) => habits.some(h => h.completions.length > 0)
    },
    'FIVE_GOALS': {
        title: 'Visionário',
        description: 'Crie 5 metas diferentes.',
        condition: (user, goals) => goals.length >= 5
    },
    'PERFECT_WEEK': {
        title: 'Semana Perfeita',
        description: 'Complete um hábito diário por 7 dias seguidos.',
        condition: (user, goals, habits) => {
            const dailyHabits = habits.filter(h => h.frequency === 'daily');
            if (dailyHabits.length === 0) return false;

            for (const habit of dailyHabits) {
                 let consecutiveDays = 0;
                 const sortedCompletions = habit.completions
                    .map(c => new Date(c.completion_date).setHours(0,0,0,0))
                    .sort((a,b) => b-a);
                 
                 if (sortedCompletions.length === 0) continue;

                 const uniqueDates = [...new Set(sortedCompletions)];
                 const today = new Date();
                 today.setHours(0,0,0,0);
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 yesterday.setHours(0,0,0,0);

                 if (uniqueDates[0] === today.getTime() || uniqueDates[0] === yesterday.getTime()) {
                    consecutiveDays = 1;
                    for (let i = 0; i < uniqueDates.length - 1; i++) {
                        const day = new Date(uniqueDates[i]);
                        day.setDate(day.getDate() - 1);
                        if (day.getTime() === uniqueDates[i+1]) {
                            consecutiveDays++;
                        } else {
                            break;
                        }
                    }
                 }
                if (consecutiveDays >= 7) return true;
            }
            return false;
        }
    },
     'LEVEL_FIVE': {
        title: 'Comprometido',
        description: 'Alcance o Nível 5.',
        condition: (user) => user.level >= 5
    }
};

export const checkForAchievements = (user: User, goals: Goal[], habits: Habit[]): string[] => {
    const newAchievements: string[] = [];
    for (const key in ACHIEVEMENTS) {
        if (!user.achievements.includes(key) && ACHIEVEMENTS[key].condition(user, goals, habits)) {
            newAchievements.push(key);
        }
    }
    return newAchievements;
};
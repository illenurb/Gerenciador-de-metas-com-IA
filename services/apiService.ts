import type { Goal, Habit, GoalCreate, HabitCreate, User, JournalEntry } from '../types';
import { checkForAchievements, XP_PER_LEVEL } from '../utils/gamification';

const APP_DATA_KEY = 'goalsAndHabitsApp';

interface AppData {
  goals: Goal[];
  habits: Habit[];
  user: User;
  journalEntries: JournalEntry[];
}

const getDefaultData = (): AppData => ({
  goals: [],
  habits: [],
  user: {
    id: 1,
    xp: 0,
    level: 1,
    achievements: [],
  },
  journalEntries: [],
});

const getData = (): AppData => {
  try {
    const data = localStorage.getItem(APP_DATA_KEY);
    if (data) {
        const parsedData = JSON.parse(data);
        // Ensure all fields exist from default
        return { ...getDefaultData(), ...parsedData };
    }
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  } catch (error) {
    console.error("Falha ao analisar os dados do localStorage", error);
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
};

const saveData = (data: AppData) => {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
};

// FIX: Add mock authentication functions to satisfy AuthContext and fix compilation errors.
// --- Auth ---
export const login = (email: string, password: string): Promise<{ access_token: string }> => {
    return new Promise((resolve, reject) => {
        // For this mock, we accept any non-empty email/password.
        if (email && password) {
            resolve({ access_token: 'mock-jwt-token-for-' + email });
        } else {
            reject(new Error('Email e senha são obrigatórios.'));
        }
    });
};

export const register = (email: string, password: string): Promise<void> => {
     return new Promise((resolve, reject) => {
        // For this mock, we just check for presence and assume success.
        if (email && password) {
            resolve();
        } else {
            reject(new Error('Email e senha são obrigatórios para o registro.'));
        }
    });
};

export const getCurrentUser = (): Promise<User> => {
    // This is an alias for getUser for the auth context.
    return getUser();
}


// --- User ---
export const getUser = (): Promise<User> => {
    const { user } = getData();
    return Promise.resolve(user);
}

// --- Goals ---
export const getGoals = (): Promise<Goal[]> => {
  const { goals } = getData();
  return Promise.resolve(goals);
};

export const createGoal = (goalData: GoalCreate): Promise<Goal> => {
  const appData = getData();
  const newGoal: Goal = {
    ...goalData,
    id: Date.now(),
    progress_percentage: 0,
    subtasks: [],
  };
  appData.goals.push(newGoal);
  saveData(appData);
  return Promise.resolve(newGoal);
};

export const updateGoal = (updatedGoal: Goal): Promise<Goal> => {
    const appData = getData();
    const goalIndex = appData.goals.findIndex(g => g.id === updatedGoal.id);
    if (goalIndex === -1) {
        return Promise.reject(new Error('Meta não encontrada'));
    }

    const oldGoal = appData.goals[goalIndex];
    const newCompletedCount = updatedGoal.subtasks.filter(t => t.completed).length;
    const oldCompletedCount = oldGoal.subtasks.filter(t => t.completed).length;
    const xpGained = (newCompletedCount - oldCompletedCount) * 5; // 5 XP per subtask

    if (xpGained > 0) {
        appData.user.xp += xpGained;
        if (appData.user.xp >= XP_PER_LEVEL) {
            appData.user.level += 1;
            appData.user.xp -= XP_PER_LEVEL;
        }
    }

    appData.goals[goalIndex] = updatedGoal;
    saveData(appData);
    return Promise.resolve(updatedGoal);
}

// --- Habits ---
export const getHabits = (): Promise<Habit[]> => {
    const { habits } = getData();
    return Promise.resolve(habits);
};

export const createHabit = (habitData: HabitCreate): Promise<Habit> => {
    const appData = getData();
    const newHabit: Habit = {
        ...habitData,
        id: Date.now(),
        completions: [],
    };
    appData.habits.push(newHabit);
    saveData(appData);
    return Promise.resolve(newHabit);
};

export const toggleHabitCompletion = (habitId: number, date: Date): Promise<void> => {
    const appData = getData();
    const habitIndex = appData.habits.findIndex(h => h.id === habitId);

    if (habitIndex > -1) {
        const habit = appData.habits[habitIndex];
        // Normalize date to midnight to avoid timezone issues
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const completionIndex = habit.completions.findIndex(c => {
            const completionDate = new Date(c.completion_date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.getTime() === targetDate.getTime();
        });

        if (completionIndex > -1) {
            // It exists, so remove it
            habit.completions.splice(completionIndex, 1);
            // NOTE: For simplicity, we won't deduct XP on removal. This can be complex.
        } else {
            // It doesn't exist, so add it
            habit.completions.push({ completion_date: targetDate.toISOString() });

            // Gamification
            const user = appData.user;
            user.xp += habit.frequency === 'daily' ? 10 : 25;
            if (user.xp >= XP_PER_LEVEL) {
                user.level += 1;
                user.xp -= XP_PER_LEVEL;
            }
            const newAchievements = checkForAchievements(user, appData.goals, appData.habits);
            user.achievements = [...new Set([...user.achievements, ...newAchievements])];
            appData.user = user;
        }
        saveData(appData);
    }
    return Promise.resolve();
};

// --- Journal ---
export const getJournalEntries = (): Promise<JournalEntry[]> => {
    const { journalEntries } = getData();
    return Promise.resolve(journalEntries);
};

export const createJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    const appData = getData();
    const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now(),
        date: new Date().toISOString(),
    };
    appData.journalEntries.push(newEntry);
    saveData(appData);
    return Promise.resolve(newEntry);
};

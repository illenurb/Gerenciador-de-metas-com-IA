export interface HabitCompletion {
  completion_date: string; // datetime as string
}

export interface Habit {
  id: number;
  title: string;
  frequency: string;
  completions: HabitCompletion[];
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null; // date as string
  category: string;
  progress_percentage: number;
  subtasks: Subtask[];
}

export interface JournalEntry {
    id: number;
    date: string; // ISO string
    content: string;
    relatedGoalId?: number;
    relatedHabitId?: number;
}

export interface User {
  id: number;
  xp: number;
  level: number;
  achievements: string[];
}

export interface GoalCreate {
  title: string;
  description: string | null;
  due_date: string | null;
  category: string;
}

export interface HabitCreate {
  title: string;
  frequency: string;
}
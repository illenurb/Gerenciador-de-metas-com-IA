import React from 'react';
import { Habit } from '../../types';

interface HabitItemProps {
  habit: Habit;
  onToggleComplete: (habitId: number, date: Date) => void;
}

const frequencyMap: { [key: string]: string } = {
    daily: 'Diário',
    weekly: 'Semanal'
};

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggleComplete }) => {
  const { id, title, frequency, completions } = habit;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthlyCompletions = new Set(
    completions
      .map(c => new Date(c.completion_date))
      .filter(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear)
      .map(d => d.getDate())
  );
  
  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const now = new Date();
    if (clickedDate > now) return;
    
    onToggleComplete(id, clickedDate);
  };
  
  return (
    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400 capitalize">{frequencyMap[frequency] || frequency}</p>
        </div>
         <p className="text-sm text-slate-300 font-medium">
            {monthlyCompletions.size} / {daysInMonth} dias
         </p>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5 justify-center">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const isCompleted = monthlyCompletions.has(day);
          const isToday = day === today.getDate();
          const dateForDay = new Date(currentYear, currentMonth, day);
          const now = new Date();
          const isFuture = dateForDay.setHours(0,0,0,0) > today.getTime();

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200
                ${isFuture ? 'text-slate-600 bg-slate-800/50 cursor-not-allowed' : 'hover:bg-slate-600'}
                ${isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-800 text-slate-300'}
                ${isToday && !isCompleted ? 'ring-2 ring-sky-400' : ''}
                ${isToday && isCompleted ? 'ring-2 ring-green-400' : ''}
              `}
              aria-label={`Marcar dia ${day} como ${isCompleted ? 'não concluído' : 'concluído'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HabitItem;

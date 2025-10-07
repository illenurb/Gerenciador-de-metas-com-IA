import React, { useState } from 'react';
import { Goal, Subtask } from '../../types';
import { getAIGoalSuggestions } from '../../utils/ai';
import { generateICS } from '../../utils/calendar';
import Spinner from '../ui/Spinner';

interface GoalItemProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
}

const IconButton: React.FC<{onClick?: () => void, disabled?: boolean, children: React.ReactNode, tooltip: string}> = ({ onClick, disabled, children, tooltip }) => (
    <div className="relative group">
        <button 
            onClick={onClick}
            disabled={disabled}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {children}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
        </div>
    </div>
);


const GoalItem: React.FC<GoalItemProps> = ({ goal, onUpdate }) => {
  const { id, title, description, category, due_date, subtasks } = goal;
  const [isDecomposing, setIsDecomposing] = useState(false);

  const handleSubtaskToggle = (subtaskId: number) => {
    const updatedSubtasks = subtasks.map(task => 
      task.id === subtaskId ? { ...task, completed: !task.completed } : task
    );
    const completedCount = updatedSubtasks.filter(t => t.completed).length;
    const newProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;
    
    onUpdate({ ...goal, subtasks: updatedSubtasks, progress_percentage: newProgress });
  };

  const handleDecompose = async () => {
    setIsDecomposing(true);
    try {
        const suggestions = await getAIGoalSuggestions(title, description);
        const newSubtasks: Subtask[] = suggestions.map((taskTitle, index) => ({
            id: Date.now() + index,
            title: taskTitle,
            completed: false
        }));
        onUpdate({ ...goal, subtasks: newSubtasks, progress_percentage: 0 });
    } catch (error) {
        console.error("Falha ao decompor meta com IA", error);
    } finally {
        setIsDecomposing(false);
    }
  };

  const handleDownloadICS = () => {
    if (due_date) {
        generateICS(title, description || '', new Date(due_date));
    }
  }

  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = hasSubtasks ? Math.round((completedSubtasks / subtasks.length) * 100) : goal.progress_percentage;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSubtasks) {
      const newProgress = parseInt(e.target.value, 10);
      onUpdate({ ...goal, progress_percentage: newProgress });
    }
  };
  
  const progressStyle = {
      background: `linear-gradient(to right, #0ea5e9 ${progress}%, #475569 ${progress}%)` // sky-500, slate-600
  };

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-900/20">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <span className="text-xs font-medium bg-sky-900 text-sky-300 px-2 py-1 rounded-full whitespace-nowrap">{category}</span>
      </div>
      
      {subtasks.length > 0 && (
          <div className="mt-4 space-y-2">
              {subtasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3">
                      <input 
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onChange={() => handleSubtaskToggle(task.id)}
                          className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-sky-500 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor={`task-${task.id}`} className={`text-sm cursor-pointer ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.title}</label>
                  </div>
              ))}
          </div>
      )}

      <div className="mt-4">
        {due_date && <p className="text-xs text-slate-400">Prazo: {new Date(due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
        <div className="mt-2">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-300">Progresso</span>
                <span className="text-sm font-medium text-slate-300">{progress}%</span>
            </div>
             <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={handleProgressChange}
              disabled={hasSubtasks}
              aria-label="Ajustar progresso da meta"
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              style={progressStyle}
          />
          {hasSubtasks && <p className="text-xs text-slate-500 mt-1">O progresso é calculado com base nas subtarefas.</p>}
        </div>
      </div>
       <div className="mt-4 flex items-center justify-end gap-1">
            {subtasks.length === 0 && (
                 <IconButton onClick={handleDecompose} disabled={isDecomposing} tooltip={isDecomposing ? 'Analisando...' : 'Dividir com IA'}>
                    {isDecomposing ? <Spinner size="sm" /> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h1.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v1.5a1.5 1.5 0 01-3 0V10a1 1 0 00-1-1H7.5a1.5 1.5 0 010-3H9a1 1 0 001-1V3.5zM7.5 11a1.5 1.5 0 00-3 0V12a1 1 0 01-1 1H2a1.5 1.5 0 000 3h1.5a1 1 0 011 1v1.5a1.5 1.5 0 003 0V16a1 1 0 011-1h1.5a1.5 1.5 0 000-3H10a1 1 0 01-1-1v-1.5z" /></svg>
                    }
                </IconButton>
            )}
            {due_date && (
                <IconButton onClick={handleDownloadICS} tooltip="Adicionar ao Calendário">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                </IconButton>
            )}
        </div>
    </div>
  );
};

export default GoalItem;

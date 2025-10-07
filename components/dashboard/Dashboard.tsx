import React, { useState, useEffect, useCallback } from 'react';
import { getGoals, getHabits, toggleHabitCompletion, updateGoal } from '../../services/apiService';
import { Goal, Habit, Subtask } from '../../types';
import { useUser } from '../../context/UserContext';
import GoalItem from './GoalItem';
import HabitItem from './HabitItem';
import Button from '../ui/Button';
import AddGoalModal from './AddGoalModal';
import AddHabitModal from './AddHabitModal';
import Spinner from '../ui/Spinner';
import PerformanceDashboard from './PerformanceDashboard';
import Journal from './Journal';

type Tab = 'overview' | 'analytics' | 'journal';

const Dashboard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setHabitModalOpen] = useState(false);
  const { refreshUser } = useUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalsData, habitsData] = await Promise.all([
        getGoals(),
        getHabits()
      ]);
      setGoals(goalsData);
      setHabits(habitsData);
    } catch (err) {
      setError('Falha ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHabitCompletionToggle = async (habitId: number, date: Date) => {
    try {
      await toggleHabitCompletion(habitId, date);
      await Promise.all([fetchData(), refreshUser()]);
    } catch (err) {
      console.error("Falha ao atualizar hábito", err);
    }
  };

  const handleGoalUpdate = async (updatedGoal: Goal) => {
    try {
        await updateGoal(updatedGoal);
        await Promise.all([fetchData(), refreshUser()]);
    } catch (err) {
        console.error("Falha ao atualizar meta", err);
    }
  };

  const onDataAdded = () => {
    fetchData();
  }
  
  const EmptyState: React.FC<{ message: string, callToAction: string }> = ({ message, callToAction }) => (
    <div className="text-center py-10 px-4">
        <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-300">{message}</h3>
        <p className="mt-1 text-sm text-slate-400">{callToAction}</p>
    </div>
  );


  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
  
    if (error) {
      return <div className="text-center text-red-400 mt-10">{error}</div>;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Goals Section */}
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Minhas Metas
                      </h2>
                      <Button onClick={() => setGoalModalOpen(true)} disabled={goals.length >= 5}>
                          + Nova Meta
                      </Button>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 min-h-[300px]">
                      {goals.length > 0 ? (
                          goals.map(goal => <GoalItem key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />)
                      ) : (
                          <EmptyState message="Você ainda não tem metas." callToAction="Adicione uma para começar!" />
                      )}
                  </div>
              </div>

              {/* Habits Section */}
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 9a1 1 0 01-2 0 1 1 0 012 0zM16 9a1 1 0 01-2 0 1 1 0 012 0zM9 4a1 1 0 010-2 1 1 0 010 2zM9 16a1 1 0 010-2 1 1 0 010 2zM2 10a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm16 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm-7 1a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Meus Hábitos
                      </h2>
                      <Button onClick={() => setHabitModalOpen(true)} disabled={habits.length >= 5}>
                          + Novo Hábito
                      </Button>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 min-h-[300px]">
                      {habits.length > 0 ? (
                          habits.map(habit => <HabitItem key={habit.id} habit={habit} onToggleComplete={handleHabitCompletionToggle}/>)
                      ) : (
                          <EmptyState message="Você ainda não tem hábitos." callToAction="Que tal criar um novo?" />
                      )}
                  </div>
              </div>
          </div>
        );
      case 'analytics':
        return <PerformanceDashboard goals={goals} habits={habits} />;
      case 'journal':
        return <Journal goals={goals} habits={habits} />;
      default:
        return null;
    }
  }

  const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
        <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} onGoalAdded={onDataAdded} goalCount={goals.length} />
        <AddHabitModal isOpen={isHabitModalOpen} onClose={() => setHabitModalOpen(false)} onHabitAdded={onDataAdded} habitCount={habits.length}/>

        <div className="mb-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <TabButton tabName="overview" label="Visão Geral" />
            <TabButton tabName="analytics" label="Análise de Desempenho" />
            <TabButton tabName="journal" label="Diário" />
          </div>
        </div>

        {renderContent()}
    </div>
  );
};

export default Dashboard;

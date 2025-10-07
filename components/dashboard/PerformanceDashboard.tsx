import React, { useMemo, useState } from 'react';
import { Goal, Habit } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { getAIPerformanceInsights } from '../../utils/ai';

interface PerformanceDashboardProps {
    goals: Goal[];
    habits: Habit[];
}

const COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#ec4899', '#f97316'];

const GoalCategoryChart: React.FC<{ data: { name: string, percentage: number }[] }> = ({ data }) => {
    if (data.length === 0) {
        return <p className="text-slate-400 text-sm">Nenhuma meta para analisar.</p>;
    }
    
    let cumulativePercentage = 0;
    const gradientParts = data.map((item, index) => {
        const color = COLORS[index % COLORS.length];
        const start = cumulativePercentage;
        const end = cumulativePercentage + item.percentage;
        cumulativePercentage = end;
        return `${color} ${start}% ${end}%`;
    }).join(', ');

    const conicGradient = `conic-gradient(${gradientParts})`;

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div 
                className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{ background: conicGradient }}
            >
                <div className="w-24 h-24 bg-slate-800 rounded-full"></div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-300 text-sm">{item.name} <span className="text-slate-400">({item.percentage.toFixed(0)}%)</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}


const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ goals, habits }) => {
    const [aiInsight, setAiInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    const goalCategoryDistribution = useMemo(() => {
        const distribution: { [key: string]: number } = {};
        goals.forEach(goal => {
            distribution[goal.category] = (distribution[goal.category] || 0) + 1;
        });
        const total = goals.length;
        return Object.entries(distribution).map(([name, count]) => ({
            name,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
        })).sort((a, b) => b.count - a.count);
    }, [goals]);
    
    const habitStreaks = useMemo(() => {
        return habits.map(habit => {
            let currentStreak = 0;
            const sortedCompletions = habit.completions
                .map(c => new Date(c.completion_date).setHours(0,0,0,0))
                .sort((a,b) => b-a);
            
            if (sortedCompletions.length > 0) {
                // Fix: Explicitly specify the type for the Set to help TypeScript's type inference.
                const uniqueDates: number[] = [...new Set<number>(sortedCompletions)];
                const today = new Date().setHours(0,0,0,0);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0,0,0,0);

                if (uniqueDates[0] === today || uniqueDates[0] === yesterday.getTime()) {
                    currentStreak = 1;
                    for (let i = 0; i < uniqueDates.length - 1; i++) {
                        const day = new Date(uniqueDates[i]);
                        day.setDate(day.getDate() - 1);
                        if (day.getTime() === uniqueDates[i+1]) {
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                }
            }
            return { name: habit.title, streak: currentStreak };
        }).sort((a,b) => b.streak - a.streak);
    }, [habits]);
    
    const handleGetInsights = async () => {
        setIsInsightLoading(true);
        setAiInsight('');
        try {
            const insight = await getAIPerformanceInsights(goals, habits);
            setAiInsight(insight);
        } catch (error) {
            console.error(error);
            setAiInsight("Não foi possível gerar insights no momento. Por favor, tente novamente mais tarde.");
        } finally {
            setIsInsightLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Habit Streaks */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">Consistência de Hábitos</h3>
                    <div className="space-y-4">
                        {habits.length > 0 ? habitStreaks.map(h => (
                            <div key={h.name}>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm font-medium text-slate-300">{h.name}</p>
                                    <span className="text-sm font-bold text-white">{h.streak} dias</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (h.streak / 30) * 100)}%` }}></div>
                                </div>
                            </div>
                        )) : <p className="text-slate-400 text-sm">Nenhum hábito para analisar.</p>}
                    </div>
                </div>

                {/* Goal Categories */}
                 <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">Distribuição de Metas</h3>
                     <GoalCategoryChart data={goalCategoryDistribution} />
                </div>
            </div>
            
            {/* AI Insights */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                 <h3 className="text-xl font-bold text-white mb-4">Insights com IA</h3>
                 <div className="flex flex-col items-start gap-4">
                     {aiInsight && (
                        <p className="text-slate-300 italic bg-slate-900/50 p-4 rounded-md border border-slate-700">"{aiInsight}"</p>
                     )}
                     <Button onClick={handleGetInsights} isLoading={isInsightLoading} variant="secondary">
                         {aiInsight ? 'Gerar Novos Insights' : 'Obter Insights sobre meu Progresso'}
                     </Button>
                 </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
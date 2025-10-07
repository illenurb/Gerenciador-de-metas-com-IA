import React, { useState, useEffect, useCallback } from 'react';
import { getJournalEntries, createJournalEntry } from '../../services/apiService';
import { JournalEntry, Goal, Habit } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { getAIJournalPrompt } from '../../utils/ai';

interface JournalProps {
    goals: Goal[];
    habits: Habit[];
}

const Journal: React.FC<JournalProps> = ({ goals, habits }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newEntryContent, setNewEntryContent] = useState('');
    const [relatedTo, setRelatedTo] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isPromptLoading, setIsPromptLoading] = useState(false);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getJournalEntries();
            setEntries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Failed to fetch journal entries", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);
    
    const handleGeneratePrompt = async () => {
        setIsPromptLoading(true);
        try {
            const prompt = await getAIJournalPrompt();
            setAiPrompt(prompt);
        } catch (error) {
            console.error(error);
            setAiPrompt("Qual foi um obstáculo que você enfrentou hoje e como você lidou com ele?");
        } finally {
            setIsPromptLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntryContent.trim()) return;

        setIsCreating(true);
        const [type, idStr] = relatedTo.split('-');
        const id = idStr ? parseInt(idStr, 10) : undefined;

        try {
            await createJournalEntry({
                content: newEntryContent,
                relatedGoalId: type === 'goal' ? id : undefined,
                relatedHabitId: type === 'habit' ? id : undefined,
            });
            setNewEntryContent('');
            setRelatedTo('');
            setAiPrompt('');
            await fetchEntries();
        } catch (error) {
            console.error("Failed to create journal entry", error);
        } finally {
            setIsCreating(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* New Entry Form */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Nova Entrada no Diário</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-slate-900 rounded-md border border-slate-700 min-h-[4rem]">
                        <button type="button" onClick={handleGeneratePrompt} className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-2" disabled={isPromptLoading}>
                            {isPromptLoading ? <Spinner size="sm"/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>}
                            Sugerir um Tópico com IA
                        </button>
                        {aiPrompt && <p className="text-slate-400 text-sm italic">"{aiPrompt}"</p>}
                    </div>

                    <textarea
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                        placeholder="Como foi o seu dia? Quais progressos você fez?"
                        className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-md placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                    />
                    <div>
                        <label htmlFor="relatedTo" className="block text-sm font-medium text-slate-300 mb-1">Relacionar a:</label>
                        <select
                            id="relatedTo"
                            value={relatedTo}
                            onChange={(e) => setRelatedTo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Nenhum</option>
                            <optgroup label="Metas">
                                {goals.map(g => <option key={`goal-${g.id}`} value={`goal-${g.id}`}>{g.title}</option>)}
                            </optgroup>
                             <optgroup label="Hábitos">
                                {habits.map(h => <option key={`habit-${h.id}`} value={`habit-${h.id}`}>{h.title}</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <div className="text-right">
                        <Button type="submit" isLoading={isCreating}>Salvar Entrada</Button>
                    </div>
                </form>
            </div>
            {/* Entry List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                 {entries.length > 0 ? (
                    entries.map(entry => (
                        <div key={entry.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                            <p className="text-xs text-slate-500 mt-3">{new Date(entry.date).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 pt-16">
                        <p>Seu diário está vazio.</p>
                        <p>Escreva sua primeira entrada para começar a refletir sobre sua jornada!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Journal;

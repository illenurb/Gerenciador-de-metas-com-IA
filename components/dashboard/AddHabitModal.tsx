
import React, { useState } from 'react';
import { createHabit } from '../../services/apiService';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
  habitCount: number;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onHabitAdded, habitCount }) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (habitCount >= 5) {
        setError("Você atingiu o limite de 5 hábitos.");
        return;
    }

    setLoading(true);
    setError('');
    try {
      await createHabit({ title, frequency });
      onHabitAdded();
      onClose();
      // Reset form
      setTitle('');
      setFrequency('daily');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar hábito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Hábito">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
        <Input id="title" label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-slate-300 mb-1">Frequência</label>
          <select 
            id="frequency" 
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Salvar Hábito</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHabitModal;

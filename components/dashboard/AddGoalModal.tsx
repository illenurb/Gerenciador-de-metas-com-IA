
import React, { useState } from 'react';
import { createGoal } from '../../services/apiService';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
  goalCount: number;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onGoalAdded, goalCount }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goalCount >= 5) {
      setError("Você atingiu o limite de 5 metas.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createGoal({ title, description: description || null, category, due_date: dueDate || null });
      onGoalAdded();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate('');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar meta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Meta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
        <Input id="title" label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input id="description" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input id="category" label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <Input id="dueDate" label="Prazo Final" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Salvar Meta</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGoalModal;


import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar. Tente outro email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Criar Nova Conta">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
        />
        <Input
          id="password"
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Mínimo 8 caracteres"
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Registrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Já possui uma conta?{' '}
        <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
          Faça login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;

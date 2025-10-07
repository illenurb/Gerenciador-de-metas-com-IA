
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Gerenciador de Metas</h1>
            <p className="text-slate-400 mt-2">Seu assistente pessoal para o sucesso.</p>
        </div>
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-center text-white mb-6">{title}</h2>
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

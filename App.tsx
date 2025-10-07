
import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export default App;

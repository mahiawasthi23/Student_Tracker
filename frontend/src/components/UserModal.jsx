import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { User } from 'lucide-react';

export function UserModal() {
  const { user, setUser } = useProgress();
  const [nameInput, setNameInput] = useState('');

  if (user?.name) return null; // Don't show if already set

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUser({ name: nameInput.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-4 mx-auto text-indigo-500">
          <User size={24} />
        </div>
        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Welcome!</h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          What should we call you?
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 transition-shadow mb-4 placeholder:text-slate-400"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}

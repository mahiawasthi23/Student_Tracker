import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { User } from 'lucide-react';

export function UserModal() {
  const { user, setUser } = useProgress();
  const [nameInput, setNameInput] = useState('');

  if (user?.name) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUser({ name: nameInput.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-gradient-to-br from-white to-pink-50/20 rounded-3xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 border border-pink-200/60 backdrop-blur-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4 mx-auto text-pink-600">
          <User size={24} />
        </div>
        <h2 className="text-xl font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">Welcome!</h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          What should we call you?
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-400 text-slate-800 transition-all mb-4 placeholder:text-slate-400 bg-white/70"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-200/50 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}

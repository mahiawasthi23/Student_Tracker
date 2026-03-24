import React, { useMemo, useState } from 'react';

const CAMPUS_OPTIONS = ['Pune', 'Jashpur', 'Dharamshala', 'Dantewada', 'Sarjapur', 'Kishanganj', 'Raipur'];
const ROLE_OPTIONS = ['Student', 'Mentor'];

export function ProfileSetupModal({ open, onSubmit, isSaving }) {
  const [role, setRole] = useState('');
  const [campus, setCampus] = useState('');

  const canSubmit = useMemo(() => Boolean(role && campus && !isSaving), [role, campus, isSaving]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <section className="relative w-full max-w-md rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white to-pink-50/20 p-6 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Complete Your Signup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Role aur campus select karo. Ye bas first-time signup par ek hi baar aayega.
        </p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-pink-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-400 transition-all"
            >
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Campus</span>
            <select
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
              className="w-full rounded-xl border border-pink-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-400 transition-all"
            >
              <option value="">Select campus</option>
              {CAMPUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit({ role, campus })}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-pink-200/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </button>
      </section>
    </div>
  );
}

import React, { useMemo, useState } from 'react';

const CAMPUS_OPTIONS = ['Pune', 'Jashpur', 'Bangalore', 'Dharamshala', 'Delhi', 'Sarjapura'];
const ROLE_OPTIONS = ['Student', 'Mentor'];

export function ProfileSetupModal({ open, onSubmit, isSaving }) {
  const [role, setRole] = useState('');
  const [campus, setCampus] = useState('');

  const canSubmit = useMemo(() => Boolean(role && campus && !isSaving), [role, campus, isSaving]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <section className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-extrabold text-slate-900">Complete Your Signup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Role aur campus select karo. Ye bas first-time signup par ek hi baar aayega.
        </p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1777cf]/30"
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
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campus</span>
            <select
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1777cf]/30"
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
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1777cf] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#126ab9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </button>
      </section>
    </div>
  );
}

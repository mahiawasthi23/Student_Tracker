import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Lock, User, X, LogIn, Eye, EyeOff, KeyRound } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '180949238001-e0nk7gc27nrfesumiohd6a3nhb5ej2f2.apps.googleusercontent.com';

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script.'));
    document.body.appendChild(script);
  });
}

export function AuthModal({ open, onClose, onSignup, onLogin, onForgotPassword, onGoogleAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const modeRef = useRef(mode);

  const submitLabel = mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset Password' : 'Login';
  const googleLabel = mode === 'signup' ? 'Sign up with Google' : 'Login with Google';

  const canSubmit = useMemo(() => {
    if (mode === 'signup') {
      return name.trim().length >= 2 && email.trim() && password.length >= 6;
    }
    if (mode === 'forgot') {
      return email.trim() && password.length >= 6 && confirmPassword.length >= 6;
    }
    return email.trim() && password.length >= 6;
  }, [mode, name, email, password, confirmPassword]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    setError('');
    setSuccess('');
    setIsBusy(false);

    loadGoogleScript()
      .then(() => {
        if (!googleButtonRef.current || !window.google?.accounts?.id) return;

        if (!googleInitializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              try {
                setError('');
                setIsBusy(true);
                await onGoogleAuth({ credential: response.credential, mode: modeRef.current });
              } catch (err) {
                setError(err.message || 'Google authentication failed.');
              } finally {
                setIsBusy(false);
              }
            },
          });
          googleInitializedRef.current = true;
        }

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          width: 320,
        });
      })
      .catch((err) => {
        setError(err.message || 'Unable to initialize Google sign-in.');
      });
  }, [open, mode, onGoogleAuth]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsBusy(true);

    try {
      if (mode === 'signup') {
        await onSignup({ name: name.trim(), email: email.trim(), password });
      } else if (mode === 'forgot') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        await onForgotPassword({ email: email.trim(), newPassword: password });
        setSuccess('Password reset successful. Please login with your new password.');
        setPassword('');
        setConfirmPassword('');
        setMode('login');
      } else {
        await onLogin({ email: email.trim(), password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      <section className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6">
        <div className="relative mb-5">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {mode === 'signup' ? 'Signup' : mode === 'forgot' ? 'Reset Password' : 'Login'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'signup'
                ? 'First-time users need to sign up before login.'
                : mode === 'forgot'
                ? 'Enter your account email and set a new password.'
                : 'Login with your existing account to continue.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Student Name</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <User size={16} className="text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Mail size={16} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Lock size={16} className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 transition-colors hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {mode === 'forgot' && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <KeyRound size={16} className="text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setSuccess('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-[#1777cf]"
              >
                Forgot password?
              </button>
            </div>
          )}

          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{success}</p>
          )}

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1777cf] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#126ab9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={16} />
            {isBusy ? 'Please wait...' : submitLabel}
          </button>

          <p className="text-center text-sm text-slate-600">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccess('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded-full border border-[#1777cf]/20 bg-[#1777cf]/10 px-3 py-1 font-semibold text-[#1777cf] transition-colors hover:bg-[#1777cf]/20"
                >
                  Signup
                </button>
              </>
            ) : mode === 'forgot' ? (
              <>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded-full border border-[#1777cf]/20 bg-[#1777cf]/10 px-3 py-1 font-semibold text-[#1777cf] transition-colors hover:bg-[#1777cf]/20"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded-full border border-[#1777cf]/20 bg-[#1777cf]/10 px-3 py-1 font-semibold text-[#1777cf] transition-colors hover:bg-[#1777cf]/20"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              OR
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div ref={googleButtonRef} className="min-h-[40px]" />
              <p className="text-xs text-slate-500">{googleLabel}</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

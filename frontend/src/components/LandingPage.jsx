import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Timer,
  Target,
  BarChart3,
  Shield,
  CheckCircle2,
  Clock3,
  BookOpen,
  Quote,
  Brain,
} from 'lucide-react';

export function LandingPage({ onGetStarted }) {
  const [focusMode, setFocusMode] = useState('deep');

  const focusCard = useMemo(() => {
    if (focusMode === 'plan') {
      return {
        title: 'Smart Planning',
        value: '6 tasks scheduled',
        hint: 'Auto-priority for today',
        tone: 'bg-slate-100 text-slate-700',
      };
    }

    if (focusMode === 'review') {
      return {
        title: 'Weekly Review',
        value: '14.2 focus hours',
        hint: 'Consistency: +18%',
        tone: 'bg-cyan-100 text-cyan-900',
      };
    }

    return {
      title: 'Deep Focus',
      value: 'Session running: 45 min',
      hint: 'Distraction score: low',
      tone: 'bg-[#5965a8] text-white',
    };
  }, [focusMode]);

  return (
    <main className="landing-shell min-h-screen text-slate-900">
      <section className="w-full px-0 py-0">
        <header className="flex items-center justify-between rounded-none border-x-0 border-t-0 border-b border-[#d7def8] bg-white/80 px-4 py-3 md:px-6">
          <div className="flex items-center">
            <img src="/navgurukul-logo.svg" alt="Navgurukul" className="h-8 w-auto md:h-9" />
          </div>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-500 md:flex">
            <a href="#focus" className="transition-colors hover:text-slate-800">Focus</a>
            <a href="#reviews" className="transition-colors hover:text-slate-800">Reviews</a>
          </nav>

          <button
            onClick={onGetStarted}
            className="rounded-full border border-[#ced6fa] bg-white px-4 py-1.5 text-xs font-bold text-[#5965a8] transition-colors hover:bg-[#eef1ff]"
          >
            Get started
          </button>
        </header>

        <section className="soft-card grid gap-5 rounded-none border-x-0 border-t-0 p-5 md:grid-cols-2 md:p-7">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6c78b2]">Student Tracker</p>
            <h1 className="text-4xl font-black leading-tight text-[#2f3a75] md:text-5xl">
              Turn Your
              <br />
              Ambitions Into
              <br />
              Reality
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              A calm, simple system to plan your day, stay in focus, and measure your growth every week.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-[#5965a8] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight size={15} />
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e9edff] px-4 py-2 text-xs font-semibold text-[#5664a8]">
                <Sparkles size={14} />
                Focus friendly
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d6def8] bg-[#e8ecff] p-4 md:p-5">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live Preview</p>
                <span className="rounded-full bg-[#e8f7ef] px-2 py-1 text-[10px] font-bold text-emerald-700">ACTIVE</span>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-[11px] font-semibold">
                <button
                  onClick={() => setFocusMode('deep')}
                  className={`rounded-md px-2 py-1.5 ${focusMode === 'deep' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Deep
                </button>
                <button
                  onClick={() => setFocusMode('plan')}
                  className={`rounded-md px-2 py-1.5 ${focusMode === 'plan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Plan
                </button>
                <button
                  onClick={() => setFocusMode('review')}
                  className={`rounded-md px-2 py-1.5 ${focusMode === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Review
                </button>
              </div>

              <div className={`rounded-xl p-4 ${focusCard.tone}`}>
                <p className="text-sm font-bold">{focusCard.title}</p>
                <p className="mt-1 text-xs opacity-90">{focusCard.value}</p>
                <p className="mt-2 text-[11px] opacity-80">{focusCard.hint}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="focus" className="border-x-0 border-t-0 border-b border-[#d6def8] bg-white p-5 md:p-6">
          <h2 className="text-center text-2xl font-black text-[#2f3a75] md:text-3xl">Escaping the Digital Chaos</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-[#dde3fa] bg-[#f8f9ff] p-4">
              <div className="mb-2 inline-flex rounded-lg bg-[#e9edff] p-2 text-[#5965a8]">
                <Timer size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No-Priority Tasks</h3>
              <p className="mt-1 text-xs text-slate-600">Stop juggling random to-dos. Put your energy where it matters first.</p>
            </article>

            <article className="rounded-xl border border-[#dde3fa] bg-[#f8f9ff] p-4">
              <div className="mb-2 inline-flex rounded-lg bg-[#e9edff] p-2 text-[#5965a8]">
                <Shield size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Your Focused Space</h3>
              <p className="mt-1 text-xs text-slate-600">Daily planning, focused sessions, and review in one peaceful interface.</p>
            </article>
          </div>
        </section>

        <section className="border-x-0 border-t-0 border-b border-[#d6def8] bg-white p-5 md:p-6">
          <h2 className="text-2xl font-black text-[#2f3a75] md:text-3xl">Designed for Deep Work</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl bg-[#eef1ff] p-4">
              <p className="text-xs font-semibold text-[#5f6aad]">Intelligent Calendar</p>
              <p className="mt-2 text-xs text-slate-600">See your study plan clearly day by day.</p>
            </article>

            <article className="rounded-xl bg-[#5965a8] p-4 text-white md:row-span-2">
              <div className="inline-flex rounded-lg bg-white/20 p-2">
                <Brain size={16} />
              </div>
              <h3 className="mt-3 text-lg font-bold">Deep Focus</h3>
              <p className="mt-1 text-xs text-slate-200">Track live study sessions and build concentration streaks.</p>
            </article>

            <article className="rounded-xl bg-[#eef1ff] p-4">
              <p className="text-xs font-semibold text-[#5f6aad]">Daily Reflections</p>
              <p className="mt-2 text-xs text-slate-600">Capture what worked and what to improve tomorrow.</p>
            </article>

            <article className="rounded-xl bg-[#eef1ff] p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-[#5f6aad]">
                <BarChart3 size={14} />
                <span className="text-xs font-semibold">Seamless Clarity</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">Your study metrics stay visible without noisy dashboards.</p>
            </article>
          </div>
        </section>

        <section id="reviews" className="border-b border-[#d6def8] bg-[#f4f6ff] p-5 md:p-6">
          <h2 className="text-center text-lg font-bold text-[#2f3a75]">Loved by high-achievers</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-[#d6def8] bg-white p-4">
              <Quote size={14} className="text-[#7b88c5]" />
              <p className="mt-2 text-xs text-slate-600">I finally know where my time goes every day. Super clean and useful.</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Priya
              </div>
            </article>

            <article className="rounded-xl border border-[#d6def8] bg-white p-4">
              <Quote size={14} className="text-[#7b88c5]" />
              <p className="mt-2 text-xs text-slate-600">The deep focus and review combo helped me stay consistent for exams.</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Arjun
              </div>
            </article>

            <article className="rounded-xl border border-[#d6def8] bg-white p-4">
              <Quote size={14} className="text-[#7b88c5]" />
              <p className="mt-2 text-xs text-slate-600">Simple UI, strong structure. Exactly what I needed before test season.</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Neha
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-none bg-[#505b99] px-5 py-9 text-center text-white md:px-8">
          <h3 className="text-3xl font-black">Ready to find your focus?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-200">Join students who plan smart, track better, and improve every day.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#4a5593] transition-colors hover:bg-slate-100"
            >
              Get Your Tracker
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold">
              <BookOpen size={14} />
              Built for students
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Clock3,
  BookOpen,
  Brain,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Users,
  GraduationCap,
} from 'lucide-react';

export function LandingPage({ onGetStarted }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(to_right,_#fbc2eb1f,_#a6c1ee24)] text-slate-800 [font-family:'Poppins','Inter',sans-serif]">
      <header className="sticky top-0 z-50 border-b border-pink-100/70 bg-white/80 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/navgurukul-logo.svg" alt="NavGurukul" className="h-8 w-auto md:h-9" />
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">Students Tracker</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-300 hover:shadow"
            >
              Login
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(to_right,_#f58fcb,_#9ea9ef)] px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-14 pt-10 md:grid-cols-2 md:px-8 md:pt-14">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-pink-700">
            <Sparkles size={14} />
            Calm Productivity for Students
          </p>

          <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
            Plan Better. Learn Smarter. Improve Daily.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Students Tracker helps you plan your day, track your progress, reflect on your learning, and grow consistently with AI-powered insights.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(to_right,_#f58fcb,_#9ea9ef)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
            <button className="rounded-full border border-pink-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-300 hover:shadow">
              Try Demo
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-[linear-gradient(to_right,_#fbc2eb55,_#a6c1ee55)] blur-2xl" />
          <div className="relative rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Dashboard Preview</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Live</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-pink-50 p-3">
                <p className="text-xs font-semibold text-pink-700">Today&apos;s Goal</p>
                <p className="text-sm text-slate-700">3 Topics + 2 Practice Sets</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-indigo-50 p-3">
                  <p className="text-xs text-slate-500">Study Time</p>
                  <p className="text-lg font-bold text-slate-800">4.5h</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3">
                  <p className="text-xs text-slate-500">Consistency</p>
                  <p className="text-lg font-bold text-slate-800">87%</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-3">
                <p className="mb-2 text-xs text-slate-500">Weekly Progress</p>
                <div className="flex items-end gap-1.5">
                  {[35, 48, 62, 58, 76, 85, 91].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-full rounded-t-md bg-[linear-gradient(to_top,_#f58fcb,_#9ea9ef)]"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-8 text-center text-3xl font-black text-slate-900">Why Students Tracker?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: CheckCircle2, text: 'Stay consistent with daily planning' },
            { icon: Clock3, text: 'Track your study hours easily' },
            { icon: BookOpen, text: 'Reflect and learn from your day' },
            { icon: Brain, text: 'Get AI-powered improvement suggestions' },
            { icon: MessageSquare, text: 'Receive meaningful mentor feedback' },
          ].map((item) => (
            <article
              key={item.text}
              className="rounded-2xl border border-pink-100 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <item.icon className="mb-3 text-pink-600" size={20} />
              <p className="text-sm leading-relaxed text-slate-700">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-8 text-center text-3xl font-black text-slate-900">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { icon: Calendar, title: 'Plan your daily goals' },
            { icon: Clock3, title: 'Track your time and progress' },
            { icon: BookOpen, title: 'Write reflections and challenges' },
            { icon: Sparkles, title: 'Get AI insights for improvement' },
            { icon: Users, title: 'Receive feedback from mentors' },
          ].map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-2xl border border-purple-100 bg-white/85 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(to_right,_#f58fcb,_#9ea9ef)] text-xs font-bold text-white">
                {index + 1}
              </span>
              <step.icon className="mb-2 text-purple-600" size={18} />
              <p className="text-sm font-medium text-slate-700">{step.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-8 text-center text-3xl font-black text-slate-900">Powerful Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Calendar,
              title: 'Daily Planning',
              desc: 'Plan and organize your goals with a simple calendar',
            },
            {
              icon: Clock3,
              title: 'Time Tracking',
              desc: 'Track your study hours with timer and logs',
            },
            {
              icon: Brain,
              title: 'AI Feedback',
              desc: 'Get smart suggestions to improve consistency',
            },
            {
              icon: BarChart3,
              title: 'Dashboard',
              desc: 'Visualize your progress with charts and insights',
            },
            {
              icon: GraduationCap,
              title: 'Mentor Support',
              desc: 'Get personalized feedback from mentors',
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-pink-100 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <feature.icon className="mb-3 text-pink-600" size={22} />
              <h3 className="mb-1 text-base font-bold text-slate-800">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-4 rounded-3xl border border-purple-100 bg-white/85 p-6 shadow-sm md:grid-cols-2 md:p-8">
          <div>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Built for Students and Mentors</h2>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pink-700">Students</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-pink-600" />Plan daily learning</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-pink-600" />Track progress</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-pink-600" />Improve with AI</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-700">Mentors</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-600" />Monitor student progress</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-600" />Give targeted feedback</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-600" />Support better outcomes</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 w-full bg-[linear-gradient(to_right,_#fbc2eb,_#a6c1ee)] px-4 py-14 text-center md:px-8">
        <h2 className="mx-auto max-w-3xl text-2xl font-black text-slate-900 md:text-3xl">
          Start your journey towards better learning and consistency today.
        </h2>
        <button
          onClick={onGetStarted}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-800 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Get Started Now 🚀
          <ArrowRight size={16} />
        </button>
      </section>

      <footer className="px-4 py-6 text-center text-sm text-slate-600 md:px-8">
        Built to make learning simple, structured, and effective.
      </footer>
    </main>
  );
}

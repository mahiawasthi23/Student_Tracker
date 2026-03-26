import React, { useEffect, useState } from 'react';
import { Mail, Calendar, User, MessageCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export function FeedbackPage({ onBack, mentorStudentId = '' }) {
  const {
    getStudentFeedback,
    markFeedbackAsSeen,
    getAiFeedback,
    getMentorStudentFeedback,
    getMentorStudentAiFeedback,
    isAuthenticated,
  } = useProgress();
  const [mentorFeedback, setMentorFeedback] = useState([]);
  const [aiFeedback, setAiFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mentorPage, setMentorPage] = useState(1);
  const [aiPage, setAiPage] = useState(1);
  const mentorItemsPerPage = 6;
  const aiItemsPerPage = 1;
  const isMentorViewingStudent = Boolean(mentorStudentId);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError('');
        const [mentorData, aiData] = await Promise.all([
          isMentorViewingStudent ? getMentorStudentFeedback(mentorStudentId) : getStudentFeedback(),
          isMentorViewingStudent ? getMentorStudentAiFeedback(mentorStudentId) : getAiFeedback(),
        ]);

        setMentorFeedback(mentorData);

        const now = Date.now();
        const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
        const filteredAiFeedback = (Array.isArray(aiData) ? aiData : []).filter((item) => {
          const createdAt = item?.createdAt || `${item?.dateKey || ''}T00:00:00.000Z`;
          const itemTime = new Date(createdAt).getTime();
          if (Number.isNaN(itemTime)) return false;
          return now - itemTime <= tenDaysInMs;
        });

        setAiFeedback(filteredAiFeedback);
        setMentorPage(1);
        setAiPage(1);

        if (!isMentorViewingStudent) {
          for (const item of mentorData) {
            if (!item.seen) {
              try {
                await markFeedbackAsSeen(item._id);
              } catch (err) {
                console.error('Failed to mark feedback as seen:', err);
              }
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [
    isAuthenticated,
    mentorStudentId,
    isMentorViewingStudent,
    getStudentFeedback,
    getAiFeedback,
    getMentorStudentFeedback,
    getMentorStudentAiFeedback,
    markFeedbackAsSeen,
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAiCategory = (key) => {
    return String(key || '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  const mentorStartIndex = (mentorPage - 1) * mentorItemsPerPage;
  const paginatedMentorFeedback = mentorFeedback.slice(mentorStartIndex, mentorStartIndex + mentorItemsPerPage);
  const totalMentorPages = Math.ceil(mentorFeedback.length / mentorItemsPerPage);

  const aiStartIndex = (aiPage - 1) * aiItemsPerPage;
  const paginatedAiFeedback = aiFeedback.slice(aiStartIndex, aiStartIndex + aiItemsPerPage);
  const totalAiPages = Math.ceil(aiFeedback.length / aiItemsPerPage);
  const currentAiItem = paginatedAiFeedback[0] || null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10 px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100">
            <MessageCircle size={20} className="text-pink-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Mentor Feedback</h1>
        </div>
        <p className="text-sm text-slate-600 ml-13">
          Personalized feedback from your mentor to help you grow
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200/60 bg-gradient-to-r from-rose-50 to-pink-50/30 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-pink-200/60 bg-gradient-to-br from-white to-pink-50/20 p-8 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 animate-pulse mb-3">
            <Mail size={20} className="text-pink-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Loading your feedback...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">Mentor Feedback</h2>
            </div>

            {mentorFeedback.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No Mentor Feedback Yet</h3>
                <p className="text-sm text-slate-600">Your mentor will send personalized feedback here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMentorFeedback.map((item) => (
                    <div
                      key={item._id}
                      className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/30 to-sky-100/50 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-300 hover:-translate-y-1 sm:p-6 h-fit"
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors flex-shrink-0">
                            <User size={18} className="text-amber-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.mentorName}</p>
                            {item.campus && <p className="text-xs text-slate-500">{item.campus}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar size={13} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-sky-200/60 bg-white/80 p-4 backdrop-blur-sm">
                        <p className="text-sm leading-relaxed text-slate-700 break-words">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {totalMentorPages > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-6">
                    <button
                      onClick={() => setMentorPage((prev) => Math.max(prev - 1, 1))}
                      disabled={mentorPage === 1}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalMentorPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setMentorPage(page)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            mentorPage === page
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setMentorPage((prev) => Math.min(prev + 1, totalMentorPages))}
                      disabled={mentorPage === totalMentorPages}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">AI Feedback</h2>
            </div>

            {aiFeedback.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No AI Feedback In Last 10 Days</h3>
                <p className="text-sm text-slate-600">Generate AI feedback from the AI page to see it here.</p>
              </div>
            ) : (
              <>
                <div
                  key={currentAiItem?._id || currentAiItem?.dateKey || aiPage}
                  className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-blue-100/50 p-5 shadow-md ring-1 ring-indigo-100/70 transition-all duration-500 animate-in fade-in slide-in-from-right-4 sm:p-6"
                >
                  {paginatedAiFeedback.map((item) => (
                    <div key={item._id || item.dateKey} className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                          <Sparkles size={14} />
                          Daily AI Review
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          <Calendar size={13} />
                          <span>{formatDate(item.createdAt || `${item.dateKey}T00:00:00.000Z`)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(item.feedback || {}).map(([category, points]) => (
                          <div
                            key={category}
                            className="rounded-2xl border border-indigo-200/70 bg-white/85 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                          >
                            <p className="text-sm font-bold text-slate-800 mb-2">{formatAiCategory(category)}</p>
                            {Array.isArray(points) && points.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-700">
                                {points.map((point, idx) => (
                                  <li key={`${category}-${idx}`}>{String(point)}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-600">No details available.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {totalAiPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-3 border-t border-indigo-100 pt-6">
                    <button
                      onClick={() => setAiPage((prev) => Math.max(prev - 1, 1))}
                      disabled={aiPage === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-700 transition-all hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-2 py-1">
                      {Array.from({ length: totalAiPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setAiPage(page)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            aiPage === page
                              ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setAiPage((prev) => Math.min(prev + 1, totalAiPages))}
                      disabled={aiPage === totalAiPages}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-700 transition-all hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

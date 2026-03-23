import React, { useEffect, useState } from 'react';
import { Mail, Calendar, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export function FeedbackPage({ onBack }) {
  const { getStudentFeedback, markFeedbackAsSeen, isAuthenticated } = useProgress();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // Only load if authenticated
    if (!isAuthenticated) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getStudentFeedback();
        setFeedback(data);

        // Mark all feedback as seen
        for (const item of data) {
          if (!item.seen) {
            try {
              await markFeedbackAsSeen(item._id);
            } catch (err) {
              console.error('Failed to mark feedback as seen:', err);
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
  }, [isAuthenticated, getStudentFeedback, markFeedbackAsSeen]);

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

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = feedback.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(feedback.length / itemsPerPage);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10 px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
            <MessageCircle size={20} className="text-amber-700" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Mentor Feedback</h1>
        </div>
        <p className="text-sm text-slate-600 ml-13">
          Personalized feedback from your mentor to help you grow
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 animate-pulse mb-3">
            <Mail size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Loading your feedback...</p>
        </div>
      ) : feedback.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Mail size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Feedback Yet</h3>
          <p className="text-sm text-slate-600">Your mentor will send personalized feedback here. Keep up the great work!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFeedback.map((item, index) => (
              <div
                key={item._id}
                className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/30 to-sky-100/50 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-300 hover:-translate-y-1 sm:p-6 h-fit"
              >
                {/* Header */}
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

                {/* Feedback Content */}
                <div className="rounded-xl border border-sky-200/60 bg-white/80 p-4 backdrop-blur-sm">
                  <p className="text-sm leading-relaxed text-slate-700 break-words">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {feedback.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-6 border-t border-slate-200 pt-8">
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export function FeedbackModal({ student, onClose, onSuccess }) {
  const { sendFeedbackToStudent } = useProgress();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Feedback cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await sendFeedbackToStudent(student.id, text.trim());
      setText('');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white to-pink-50/20 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Send Feedback</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-pink-200/50 bg-pink-50/50 p-1 text-pink-600 transition hover:bg-pink-100/50"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          To: <span className="font-semibold text-slate-800">{student.name}</span> ({student.email})
        </p>

        {error && (
          <p className="mb-3 rounded-lg border border-rose-200/60 bg-gradient-to-r from-rose-50 to-red-50/30 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your feedback here..."
            maxLength={2000}
            rows={6}
            className="w-full rounded-lg border border-pink-200/60 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-pink-200/50 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{text.length}/2000</p>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-pink-200/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={14} /> {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

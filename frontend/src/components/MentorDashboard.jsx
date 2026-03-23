import React, { useEffect, useState } from 'react';
import { Eye, MessageSquare, RefreshCw, Search, User2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { FeedbackModal } from './FeedbackModal';

const STUDENTS_PER_PAGE = 5;

export function MentorDashboard({ onViewStudent }) {
  const { getMentorStudents, getMentorStudentState, isAuthenticated } = useProgress();
  const [campus, setCampus] = useState('');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStudentId, setLoadingStudentId] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackModalStudent, setFeedbackModalStudent] = useState(null);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setError('');
      const data = await getMentorStudents();
      setCampus(data.campus || '');
      const nextStudents = Array.isArray(data.students) ? data.students : [];
      setStudents(nextStudents);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Unable to load students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadStudents();
  }, [isAuthenticated]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    if (!normalizedSearch) {
      return true;
    }

    const name = (student.name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    return name.includes(normalizedSearch) || email.includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const pagedStudents = filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleViewStudent = async (student) => {
    try {
      setLoadingStudentId(student.id);
      setError('');
      const state = await getMentorStudentState(student.id);
      onViewStudent({ student, state });
    } catch (err) {
      setError(err.message || 'Unable to load student dashboard.');
    } finally {
      setLoadingStudentId('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in space-y-6 pb-10">
      {error && (
        <p className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
          {error}
        </p>
      )}

      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-sky-50/50 p-5 shadow-lg shadow-slate-200/50 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Mentor Dashboard</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {campus ? `Campus: ${campus}` : 'Campus not set'} | Open student workspace in read-only mode.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStudents}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow"
          >
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm">
          <label className="flex items-center gap-2 px-2">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by student name or email"
              className="w-full bg-transparent px-1 py-1.5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {loadingStudents ? (
          <p className="text-sm text-slate-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No students found for this campus yet.
          </p>
        ) : filteredStudents.length === 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No student matched "{searchQuery.trim()}". Try searching with another name or email.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Feedback</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student) => {
                  const isLoadingThisRow = loadingStudentId === student.id;
                  return (
                    <tr key={student.id} className="border-b border-slate-100 transition-colors hover:bg-sky-50/70">
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                          <span className="rounded-full border border-sky-200 bg-sky-100/80 p-1 text-sky-700">
                            <User2 size={12} />
                          </span>
                          {student.name}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{student.email}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setFeedbackModalStudent(student)}
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                        >
                          <MessageSquare size={14} /> Send
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleViewStudent(student)}
                          disabled={Boolean(loadingStudentId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Eye size={14} /> {isLoadingThisRow ? 'Opening...' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredStudents.length > STUDENTS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 px-3 pb-1 pt-4">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <p className="text-xs font-semibold text-slate-600">
                  Page {currentPage} of {totalPages}
                </p>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {feedbackModalStudent && (
        <FeedbackModal
          student={feedbackModalStudent}
          onClose={() => setFeedbackModalStudent(null)}
          onSuccess={() => {
            // Optional: Can reload students or show success message here
          }}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Eye, User2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const STUDENTS_PER_PAGE = 5;

export function MentorDashboard({ onViewStudent }) {
  const { getMentorStudents, getMentorStudentState } = useProgress();
  const [campus, setCampus] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStudentId, setLoadingStudentId] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    loadStudents();
  }, []);

  const totalPages = Math.max(1, Math.ceil(students.length / STUDENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const pagedStudents = students.slice(startIndex, startIndex + STUDENTS_PER_PAGE);

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
    <div className="mx-auto max-w-6xl animate-in fade-in pb-10 space-y-6">
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mentor Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              {campus ? `Campus: ${campus}` : 'Campus not set'} | Open student workspace in read-only mode.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStudents}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh List
          </button>
        </div>

        {loadingStudents ? (
          <p className="text-sm text-slate-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No students found for this campus yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student) => {
                  const isLoadingThisRow = loadingStudentId === student.id;
                  return (
                    <tr key={student.id} className="border-b border-slate-100">
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                          <User2 size={14} /> {student.name}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{student.email}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleViewStudent(student)}
                          disabled={Boolean(loadingStudentId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Eye size={14} /> {isLoadingThisRow ? 'Opening...' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {students.length > STUDENTS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

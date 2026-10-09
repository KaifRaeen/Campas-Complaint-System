import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Search, GraduationCap, Building, Calendar, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface StudentItem {
  id: number;
  uid: string;
  fullName: string;
  email: string;
  studentId?: string | null;
  year?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  departmentName?: string | null;
  joinedAt: string;
  complaintCount: number;
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<StudentItem[]>('/api/students');
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase())) ||
      (s.departmentName && s.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Registered Student Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified campus students with complaint filing privileges ({students.length} enrolled).
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Student ID / Roll</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Year of Study</th>
              <th className="py-3 px-4">Complaints Filed</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  Loading student roster...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No students found matching search.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          s.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            s.fullName
                          )}`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{s.fullName}</p>
                        <p className="text-[11px] text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {s.studentId || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {s.departmentName || 'General'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.year || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{s.complaintCount}</span>
                    <span className="text-[11px] text-slate-400 ml-1">tickets</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(s.joinedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

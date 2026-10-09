import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api-client.ts';
import { Department } from '../../types/index.ts';
import { User, Mail, Building, Calendar, Phone, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [departmentId, setDepartmentId] = useState(user?.departmentId?.toString() || '');
  const [year, setYear] = useState(user?.year || '1st Year');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Department[]>('/api/departments').then(setDepartments).catch(console.error);
    if (user) {
      setFullName(user.fullName || '');
      setStudentId(user.studentId || '');
      setDepartmentId(user.departmentId ? user.departmentId.toString() : '');
      setYear(user.year || '1st Year');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await apiFetch('/api/auth/sync', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          studentId,
          departmentId: departmentId ? Number(departmentId) : null,
          year,
          phone,
        }),
      });
      await refreshProfile();
      setNotice('Profile successfully updated in database!');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Student Profile & Credentials
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified college credentials and contact preferences.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={15} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user?.fullName || 'User'
              )}`
            }
            alt=""
            className="w-14 h-14 rounded-full border object-cover shadow-2xs"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-slate-500 text-[11px]">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role === 'admin' ? 'Administration' : 'Student Account'}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student ID / Roll Number</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Year of Study</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Update Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

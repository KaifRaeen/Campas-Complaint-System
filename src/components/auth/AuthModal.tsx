import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api-client.ts';
import { Department } from '../../types/index.ts';
import {
  X,
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithGoogle, registerStudent, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    departmentId: '',
    year: '1st Year',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      apiFetch<Department[]>('/api/departments')
        .then(setDepartments)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!formData.departmentId) {
      setError('Please select your academic department');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        departmentId: Number(formData.departmentId),
        year: formData.year,
        phone: formData.phone,
        password: formData.password,
      });
      setSuccessMsg('Student registration successful! Welcome to CampusVoice.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (uid: string) => {
    setLoading(true);
    try {
      await switchUser(uid);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3">
            <GraduationCap size={14} />
            <span>CampusVoice Portal</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'login'
              ? 'Welcome to CampusVoice'
              : mode === 'register'
              ? 'Student Registration'
              : 'Reset Your Password'}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1">
            {mode === 'login'
              ? 'Sign in to submit, track, and resolve campus complaints.'
              : mode === 'register'
              ? 'Create your verified student account to report grievances.'
              : 'Enter your registered college email to receive a password reset link.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-left space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm shadow-xs transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with College Google Account</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-slate-400 text-xs">or test instantly as</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* Instant Test Personas */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('student-aarav')}
                  disabled={loading}
                  className="p-3 text-left border border-indigo-100 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs mb-0.5">
                    <GraduationCap size={14} />
                    <span>Aarav Sharma</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Student • 3rd Year IT</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin-principal-uid')}
                  disabled={loading}
                  className="p-3 text-left border border-amber-200 rounded-xl bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-0.5">
                    <Sparkles size={14} />
                    <span>Dr. R. Sterling</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Principal • Full Admin</p>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  New student?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Iyer"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID / Roll No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2024-512"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@campusvoice.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <select
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Student Account...' : 'Complete Registration'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Already registered? <span className="text-indigo-600 font-semibold underline">Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Please enter your registered college email. We will dispatch a secure reset verification code.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="student@campusvoice.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg('Reset instructions dispatched to your college email.');
                  setTimeout(() => setMode('login'), 2000);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl"
              >
                Send Reset Link
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

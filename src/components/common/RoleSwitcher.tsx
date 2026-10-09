import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, GraduationCap, ChevronDown, Check, UserCheck, RefreshCw } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, switchUser, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const demoAccounts = [
    {
      uid: 'student-aarav',
      name: 'Aarav Sharma',
      role: 'student' as const,
      roleLabel: 'Student (3rd Yr IT)',
      badge: 'Student',
    },
    {
      uid: 'student-priya',
      name: 'Priya Patel',
      role: 'student' as const,
      roleLabel: 'Student (2nd Yr Academics)',
      badge: 'Student',
    },
    {
      uid: 'admin-principal-uid',
      name: 'Dr. Robert Sterling',
      role: 'admin' as const,
      roleLabel: 'Principal & Chief Grievance Officer',
      badge: 'Principal/Admin',
    },
  ];

  const handleSelect = async (uid: string) => {
    setIsOpen(false);
    if (user?.uid !== uid) {
      await switchUser(uid);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all ${
          isAdmin
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
        }`}
        title="Quick Role & Persona Switcher"
      >
        {isAdmin ? (
          <Shield size={14} className="text-amber-600" />
        ) : (
          <GraduationCap size={14} className="text-indigo-600" />
        )}
        <span className="font-semibold max-w-[120px] truncate sm:max-w-none">
          {user?.fullName || 'Switch Persona'}
        </span>
        <span
          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
            isAdmin ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900'
          }`}
        >
          {user?.role}
        </span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-semibold text-slate-800">Switch Test Persona</p>
              <p className="text-[11px] text-slate-500">
                Experience CampusVoice from Student & Principal perspectives
              </p>
            </div>
            <div className="space-y-1">
              {demoAccounts.map((account) => {
                const isSelected = user?.uid === account.uid;
                return (
                  <button
                    key={account.uid}
                    onClick={() => handleSelect(account.uid)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-100 font-semibold text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          account.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {account.role === 'admin' ? <Shield size={14} /> : <GraduationCap size={14} />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900">{account.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              account.role === 'admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {account.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{account.roleLabel}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-emerald-600" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <UserCheck size={12} className="text-emerald-600" /> Live DB Sync
              </span>
              <span className="font-mono text-[10px] text-slate-400">PostgreSQL</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

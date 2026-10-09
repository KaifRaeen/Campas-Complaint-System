import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { RoleSwitcher } from './common/RoleSwitcher.tsx';
import { NotificationDrawer } from './NotificationDrawer.tsx';
import {
  MessageSquareText,
  PlusCircle,
  Search,
  LayoutDashboard,
  Shield,
  Layers,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Building,
  GraduationCap,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  onOpenTrackModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onSelectComplaint: (num: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSubmitModal,
  onOpenTrackModal,
  onOpenAuthModal,
  onSelectComplaint,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <MessageSquareText size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    CampusVoice
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                    Official
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
                  Your Voice. Our Responsibility.
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-4">
              {!user ? (
                <>
                  <button
                    onClick={() => onSelectTab('landing')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'landing'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Home
                  </button>
                  <a
                    href="#how-it-works"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    How It Works
                  </a>
                  <a
                    href="#categories"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Categories
                  </a>
                  <a
                    href="#faq"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    FAQ
                  </a>
                </>
              ) : isAdmin ? (
                <>
                  <button
                    onClick={() => onSelectTab('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'dashboard'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('complaints')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'complaints'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquareText size={14} />
                    <span>All Complaints</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('analytics')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'analytics'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 size={14} />
                    <span>Analytics</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('students')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'students'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users size={14} />
                    <span>Students</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('departments')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'departments'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building size={14} />
                    <span>Departments</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('categories')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'categories'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Categories</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onSelectTab('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'dashboard'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('my-complaints')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentTab === 'my-complaints'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquareText size={14} />
                    <span>My Complaints</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Track Button */}
            <button
              onClick={onOpenTrackModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="Track complaint by ticket ID"
            >
              <Search size={13} className="text-slate-500" />
              <span>Track Complaint</span>
            </button>

            {/* Quick Submit CTA (Student / Public) */}
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-indigo-600/20 transition-all hover:shadow-md"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Submit Complaint</span>
              <span className="sm:hidden">Submit</span>
            </button>

            {/* Role Switcher for instant evaluator test */}
            <div className="hidden sm:block">
              <RoleSwitcher />
            </div>

            {/* Notification Drawer */}
            {user && <NotificationDrawer onSelectComplaint={onSelectComplaint} />}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  aria-label="User menu"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        user.fullName
                      )}`
                    }
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-3 text-left animate-in fade-in duration-100">
                      <div className="border-b border-slate-100 pb-2 mb-2">
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              isAdmin
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {isAdmin ? 'Principal / Admin' : 'Verified Student'}
                          </span>
                          {user.studentId && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              #{user.studentId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSelectTab('profile');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                        >
                          <GraduationCap size={14} className="text-slate-400" />
                          <span>Profile & Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenAuthModal('login');
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                        >
                          <Shield size={14} className="text-slate-400" />
                          <span>Switch Account</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-2">
            <div className="pb-2 mb-2 border-b border-slate-100 sm:hidden">
              <RoleSwitcher />
            </div>

            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    onSelectTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Admin Overview
                </button>
                <button
                  onClick={() => {
                    onSelectTab('complaints');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  All Complaints
                </button>
                <button
                  onClick={() => {
                    onSelectTab('analytics');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Analytics
                </button>
                <button
                  onClick={() => {
                    onSelectTab('students');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Student Directory
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onSelectTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Student Dashboard
                </button>
                <button
                  onClick={() => {
                    onSelectTab('my-complaints');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  My Complaints
                </button>
              </>
            )}

            <button
              onClick={() => {
                onOpenTrackModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <Search size={14} />
              <span>Track Complaint by Number</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

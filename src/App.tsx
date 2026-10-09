import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { SubmitComplaintModal } from './components/student/SubmitComplaintModal.tsx';
import { ComplaintDetailModal } from './components/student/ComplaintDetailModal.tsx';
import { StudentProfileView } from './components/student/StudentProfileView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminComplaintManagement } from './components/admin/AdminComplaintManagement.tsx';
import { AdminComplaintDetailModal } from './components/admin/AdminComplaintDetailModal.tsx';
import { DepartmentManagement } from './components/admin/DepartmentManagement.tsx';
import { CategoryManagement } from './components/admin/CategoryManagement.tsx';
import { StudentManagement } from './components/admin/StudentManagement.tsx';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { TrackComplaintModal } from './components/TrackComplaintModal.tsx';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Complaint detail modal state
  const [selectedComplaintNumber, setSelectedComplaintNumber] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenComplaint = (complaintNumber: string) => {
    setSelectedComplaintNumber(complaintNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600 mt-4 tracking-tight">
          Connecting to CampusVoice Secure Gateway...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Central Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSubmitModal={() => setSubmitModalOpen(true)}
        onOpenTrackModal={() => setTrackModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onSelectComplaint={handleOpenComplaint}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {/* If user is not signed in and chooses landing */}
        {!user || currentTab === 'landing' ? (
          <LandingPage
            onOpenSubmit={() => {
              if (!user) {
                // If guest, open login or submission
                setSubmitModalOpen(true);
              } else {
                setSubmitModalOpen(true);
              }
            }}
            onOpenTrack={() => setTrackModalOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        ) : isAdmin ? (
          /* ADMIN PORTAL */
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                onOpenComplaint={handleOpenComplaint}
                onNavigateToTab={setCurrentTab}
              />
            )}
            {currentTab === 'complaints' && (
              <AdminComplaintManagement onOpenComplaint={handleOpenComplaint} />
            )}
            {currentTab === 'analytics' && <AnalyticsDashboard />}
            {currentTab === 'students' && <StudentManagement />}
            {currentTab === 'departments' && <DepartmentManagement />}
            {currentTab === 'categories' && <CategoryManagement />}
            {currentTab === 'profile' && <StudentProfileView />}
          </>
        ) : (
          /* STUDENT PORTAL */
          <>
            {(currentTab === 'dashboard' || currentTab === 'my-complaints') && (
              <StudentDashboard
                onOpenSubmit={() => setSubmitModalOpen(true)}
                onSelectComplaint={handleOpenComplaint}
              />
            )}
            {currentTab === 'profile' && <StudentProfileView />}
          </>
        )}
      </main>

      {/* Modals & Dialogs */}
      <SubmitComplaintModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSuccess={(num) => {
          setSelectedComplaintNumber(num);
        }}
      />

      <TrackComplaintModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        onOpenDetails={handleOpenComplaint}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* View / Manage Complaint Modals */}
      {isAdmin ? (
        <AdminComplaintDetailModal
          complaintNumber={selectedComplaintNumber}
          onClose={() => setSelectedComplaintNumber(null)}
          onUpdated={() => {
            // refresh data if needed
          }}
        />
      ) : (
        <ComplaintDetailModal
          complaintNumber={selectedComplaintNumber}
          onClose={() => setSelectedComplaintNumber(null)}
          onUpdated={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

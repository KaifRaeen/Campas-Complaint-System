import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api-client.ts';
import { Complaint, Status } from '../../types/index.ts';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge.tsx';
import { CategoryIcon } from '../common/CategoryIcon.tsx';
import {
  PlusCircle,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  Search,
  Calendar,
  MapPin,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenSubmit: () => void;
  onSelectComplaint: (complaintNumber: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenSubmit,
  onSelectComplaint,
}) => {
  const { user } = useAuth();
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ complaints: Complaint[] }>('/api/complaints?limit=50');
      setComplaintsList(res.complaints || []);
    } catch (err) {
      console.error('Failed to load student complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Metrics computation from real database records
  const total = complaintsList.length;
  const pending = complaintsList.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = complaintsList.filter(
    (c) => c.status === 'In Progress' || c.status === 'Reopened'
  ).length;
  const resolved = complaintsList.filter((c) => c.status === 'Resolved').length;

  // Filtered complaints
  const filtered = complaintsList.filter((c) => {
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'pending' &&
        (c.status === 'Submitted' || c.status === 'Under Review')) ||
      (selectedStatus === 'inprogress' &&
        (c.status === 'In Progress' || c.status === 'Reopened')) ||
      (selectedStatus === 'resolved' && c.status === 'Resolved');

    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your complaints and help us improve your campus experience.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>+ Submit Complaint</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Filed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1">All time campus grievances</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{pending}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting department routing</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{inProgress}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active technician dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolved}</p>
          <p className="text-[11px] text-slate-400 mt-1">Successfully addressed issues</p>
        </div>
      </div>

      {/* Main Complaints Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl max-w-fit text-xs font-medium">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pending})
            </button>
            <button
              onClick={() => setSelectedStatus('inprogress')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'inprogress'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({inProgress})
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'resolved'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolved})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search my complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3">Loading your campus grievances...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No complaints yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Have an issue on campus? Let us know and we’ll work on it. Every submission is
              personally routed to the respective college department.
            </p>
            <button
              onClick={onOpenSubmit}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle size={15} />
              <span>Submit Your First Complaint</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item.complaintNumber)}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {item.complaintNumber}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                      <PriorityBadge priority={item.priority} size="sm" />
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CategoryIcon iconName={item.categoryIcon} size={13} className="text-indigo-500" />
                        <span>{item.categoryName}</span>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <MapPin size={12} className="text-slate-400" />
                        {item.location}
                      </span>
                      <span>
                        Created:{' '}
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>
                        Last updated:{' '}
                        {new Date(item.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.assignedTo && (
                        <span className="text-indigo-600 font-medium">
                          Assigned: {item.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>View Progress</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

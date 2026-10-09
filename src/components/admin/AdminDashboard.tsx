import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Complaint, AnalyticsData } from '../../types/index.ts';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge.tsx';
import {
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  RefreshCw,
  Bell,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenComplaint: (complaintNumber: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenComplaint,
  onNavigateToTab,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, complaintsRes] = await Promise.all([
        apiFetch<AnalyticsData>('/api/analytics'),
        apiFetch<{ complaints: Complaint[] }>('/api/complaints?limit=8&sortBy=newest'),
      ]);

      setAnalytics(analyticsRes);
      setRecentComplaints(complaintsRes.complaints || []);

      const urgent = (complaintsRes.complaints || []).filter(
        (c) =>
          (c.priority === 'Urgent' || c.status === 'Reopened') && c.status !== 'Resolved'
      );
      setUrgentComplaints(urgent);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = analytics?.metrics || {
    total: 0,
    resolved: 0,
    newComplaints: 0,
    underReview: 0,
    inProgress: 0,
    urgent: 0,
    resolutionRate: 0,
    averageResolutionHours: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Good Morning, Principal Sterling
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Admin Cell
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here’s what’s happening with campus complaints today across all departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('analytics')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <TrendingUp size={14} className="text-indigo-600" />
            <span>Deep Analytics</span>
          </button>
          <button
            onClick={() => onNavigateToTab('complaints')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            Manage All ({metrics.total})
          </button>
        </div>
      </div>

      {/* 6 Core Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total}</p>
          <span className="text-[10px] text-slate-400">All Grievances</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700">New Submitted</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{metrics.newComplaints}</p>
          <span className="text-[10px] text-blue-500">Awaiting Action</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700">Under Review</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{metrics.underReview}</p>
          <span className="text-[10px] text-purple-500">In Verification</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700">In Progress</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{metrics.inProgress}</p>
          <span className="text-[10px] text-amber-500">Active Work</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics.resolved}</p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {metrics.resolutionRate}% Rate
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-2xs ${
            metrics.urgent > 0
              ? 'bg-red-50/50 border-red-300 ring-2 ring-red-100'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-700">Urgent</span>
            {metrics.urgent > 0 && <Flame size={14} className="text-red-600 animate-pulse" />}
          </div>
          <p className="text-2xl font-extrabold text-red-700 mt-1">{metrics.urgent}</p>
          <span className="text-[10px] text-red-600 font-semibold">Immediate Priority</span>
        </div>
      </div>

      {/* Urgent Grievance Alerts Banner */}
      {urgentComplaints.length > 0 && (
        <div className="p-5 rounded-2xl bg-linear-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Flame size={15} />
              </div>
              <h4 className="font-bold text-red-900 text-sm">
                Attention Required: {urgentComplaints.length} Urgent / Reopened Grievances
              </h4>
            </div>
            <span className="text-xs font-semibold text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded-full">
              Escalated to Principal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {urgentComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenComplaint(c.complaintNumber)}
                className="p-3.5 bg-white rounded-xl border border-red-200 hover:border-red-400 cursor-pointer shadow-2xs transition-colors flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-red-700">
                      {c.complaintNumber}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.location}</p>
                </div>
                <ArrowRight size={14} className="text-red-500 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Complaints</h3>
            <p className="text-xs text-slate-500">Latest issues submitted by campus students</p>
          </div>
          <button
            onClick={() => onNavigateToTab('complaints')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Complaints</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No complaints filed yet.</div>
          ) : (
            recentComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenComplaint(c.complaintNumber)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                      {c.complaintNumber}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium">{c.studentName}</span>
                    {c.studentRoll && (
                      <span className="text-slate-400 font-mono">({c.studentRoll})</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Location: <span className="text-slate-600 font-medium">{c.location}</span> • Dept:{' '}
                    <span className="text-slate-600 font-medium">
                      {c.departmentName || 'Not Assigned'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1">
                    <span>Manage</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

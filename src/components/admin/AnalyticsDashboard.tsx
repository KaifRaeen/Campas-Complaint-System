import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { AnalyticsData } from '../../types/index.ts';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Building,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<AnalyticsData>('/api/analytics')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    Submitted: '#3b82f6',
    'Under Review': '#a855f7',
    'In Progress': '#f59e0b',
    Resolved: '#10b981',
    Rejected: '#ef4444',
    Reopened: '#f97316',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    Urgent: '#ef4444',
    High: '#f97316',
    Medium: '#3b82f6',
    Low: '#64748b',
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Generating analytics from PostgreSQL database...</p>
      </div>
    );
  }

  const { metrics, statusBreakdown, priorityBreakdown, categoryBreakdown, departmentBreakdown, trends } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Campus Grievance Analytics & Insights
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics, resolution efficiency, and department performance across college infrastructure.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.resolutionRate}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {metrics.resolved} of {metrics.total} grievances resolved
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Avg. Resolution Time</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {metrics.averageResolutionHours}{' '}
            <span className="text-base font-normal text-slate-400">hours</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">From submission to resolution</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Workload</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">
            {metrics.inProgress + metrics.underReview}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">In review or technical execution</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Urgent Grievances</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-red-600">{metrics.urgent}</p>
          <p className="text-[11px] text-red-500 font-medium mt-1">Requires emergency priority</p>
        </div>
      </div>

      {/* Row 1: Complaint Trends & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Over Time (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Grievance Inflow Over Time</h3>
              <p className="text-xs text-slate-400">Daily complaints reported past 14 days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.length > 0 ? trends : [{ date: 'Today', count: metrics.total }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Status Distribution</h3>
            <p className="text-xs text-slate-400">Current workflow breakdown</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[11px]">
            {statusBreakdown.map((s) => (
              <span key={s.status} className="flex items-center gap-1 font-medium text-slate-600">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }}
                />
                <span>
                  {s.status}: {s.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Complaints by Category</h3>
            <p className="text-xs text-slate-400">Distribution across campus operational domains</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="categoryName"
                  type="category"
                  width={110}
                  tick={{ fontSize: 10, fill: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Department Performance</h3>
            <p className="text-xs text-slate-400">Total assigned vs. successfully resolved</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="departmentName"
                  tick={{ fontSize: 9, fill: '#475569' }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="total" name="Total Assigned" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

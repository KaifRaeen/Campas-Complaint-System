import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Complaint, Category, Department, Status, Priority } from '../../types/index.ts';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge.tsx';
import { CategoryIcon } from '../common/CategoryIcon.tsx';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

interface AdminComplaintManagementProps {
  onOpenComplaint: (complaintNumber: string) => void;
}

export const AdminComplaintManagement: React.FC<AdminComplaintManagementProps> = ({
  onOpenComplaint,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        sortBy,
      });

      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (categoryFilter !== 'all') params.set('categoryId', categoryFilter);
      if (departmentFilter !== 'all') params.set('departmentId', departmentFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await apiFetch<{
        complaints: Complaint[];
        pagination: { page: number; totalPages: number; total: number };
      }>(`/api/complaints?${params.toString()}`);

      setComplaints(res.complaints || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalCount(res.pagination.total || 0);
    } catch (err) {
      console.error('Failed to fetch admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiFetch<Category[]>('/api/categories').then(setCategories).catch(console.error);
    apiFetch<Department[]>('/api/departments').then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, priorityFilter, categoryFilter, departmentFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Complaint Central Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, assign departments, and track student grievances across campus ({totalCount} total).
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Complaint ID, Title, Student Name, or Roll No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 truncate"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Complaint Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Dept / Staff</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  Loading complaints...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No complaints found matching the active filters.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onOpenComplaint(c.complaintNumber)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {c.complaintNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          c.studentAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            c.studentName || 'Student'
                          )}`
                        }
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate max-w-[120px]">
                          {c.studentName}
                        </p>
                        {c.studentRoll && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {c.studentRoll}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.location}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CategoryIcon iconName={c.categoryIcon} size={14} className="text-indigo-600" />
                      <span>{c.categoryName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">
                      {c.departmentName || <span className="text-slate-400 italic">Unassigned</span>}
                    </p>
                    {c.assignedTo && (
                      <p className="text-[10px] text-indigo-600 truncate">{c.assignedTo}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComplaint(c.complaintNumber);
                      }}
                      className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Transforms Table on Small Screens) */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-6 h-6 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No complaints found matching filters.
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onOpenComplaint(c.complaintNumber)}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 cursor-pointer text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {c.complaintNumber}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={c.status} size="sm" />
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</h4>
                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-800">{c.studentName}</span>
                <span>{c.departmentName || 'Unassigned'}</span>
                <span>
                  {new Date(c.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500">
            Page {page} of {totalPages} ({totalCount} total)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

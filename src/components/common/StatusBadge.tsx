import React from 'react';
import { Status, Priority } from '../../types/index.ts';
import {
  Clock,
  Search,
  Wrench,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Flame,
} from 'lucide-react';

export const StatusBadge: React.FC<{ status: Status; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  switch (status) {
    case 'Submitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        >
          <Clock size={iconSize} className="text-blue-600" />
          <span>Submitted</span>
        </span>
      );
    case 'Under Review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${sizeClasses}`}
        >
          <Search size={iconSize} className="text-purple-600" />
          <span>Under Review</span>
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
        >
          <Wrench size={iconSize} className="text-amber-600" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 size={iconSize} className="text-emerald-600" />
          <span>Resolved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <XCircle size={iconSize} className="text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    case 'Reopened':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-200/80 ${sizeClasses}`}
        >
          <RefreshCw size={iconSize} className="text-orange-600" />
          <span>Reopened</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 13;

  switch (priority) {
    case 'Urgent':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-red-100/80 text-red-700 border border-red-300/60 ${sizeClasses}`}
        >
          <Flame size={iconSize} className="text-red-600 animate-pulse" />
          <span>Urgent</span>
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}
        >
          <ArrowUp size={iconSize} className="text-orange-600" />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <AlertTriangle size={iconSize} className="text-blue-500" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <ArrowDown size={iconSize} className="text-slate-500" />
          <span>Low</span>
        </span>
      );
    default:
      return <span className={`rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>{priority}</span>;
  }
};

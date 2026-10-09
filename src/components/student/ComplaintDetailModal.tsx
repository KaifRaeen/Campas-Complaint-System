import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api-client.ts';
import { Complaint } from '../../types/index.ts';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge.tsx';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  MessageSquare,
  Building,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintNumber: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintNumber,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reopen flow state
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    if (!complaintNumber) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Complaint>(`/api/complaints/${complaintNumber}`);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintNumber) {
      setShowReopenForm(false);
      setReopenReason('');
      fetchComplaintDetails();
    }
  }, [complaintNumber]);

  if (!complaintNumber) return null;

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim() || !complaint) return;

    setReopenLoading(true);
    try {
      await apiFetch(`/api/complaints/${complaint.id}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ reason: reopenReason.trim() }),
      });
      setShowReopenForm(false);
      setReopenReason('');
      await fetchComplaintDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to reopen complaint');
    } finally {
      setReopenLoading(false);
    }
  };

  const isResolvedOrRejected =
    complaint?.status === 'Resolved' || complaint?.status === 'Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col text-left">
        {/* Header Bar */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative flex items-start justify-between">
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                {complaint?.complaintNumber || complaintNumber}
              </span>
              {complaint && <StatusBadge status={complaint.status} size="sm" />}
              {complaint && <PriorityBadge priority={complaint.priority} size="sm" />}
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              {complaint?.title || 'Loading Complaint...'}
            </h3>
            {complaint && (
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-indigo-400" />
                  {complaint.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building size={12} className="text-indigo-400" />
                  {complaint.departmentName || 'Department Pending'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-indigo-400" />
                  Filed{' '}
                  {new Date(complaint.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3">Fetching complaint tracking details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          ) : complaint ? (
            <>
              {/* Description & Metadata Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Issue Description
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>

                {complaint.assignedTo && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Assigned Staff / Officer:</span>
                    <span className="text-indigo-700 font-medium">{complaint.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                    Attached Evidence ({complaint.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {complaint.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {att.fileType.startsWith('image/') ? (
                            <img
                              src={att.fileUrl}
                              alt={att.fileName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {att.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {att.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>

                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-1 transition-colors shrink-0"
                        >
                          <span>View</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Official Progress Timeline
                </h4>
                <div className="space-y-4 pl-4 border-l-2 border-indigo-200 ml-2">
                  {complaint.updates && complaint.updates.length > 0 ? (
                    complaint.updates.map((update, idx) => (
                      <div key={update.id} className="relative group text-xs">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-2xs ${
                            update.newStatus === 'Resolved'
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : update.newStatus === 'Reopened'
                              ? 'bg-orange-500 ring-2 ring-orange-200'
                              : update.newStatus === 'In Progress'
                              ? 'bg-amber-500 ring-2 ring-amber-200'
                              : 'bg-indigo-600 ring-2 ring-indigo-200'
                          }`}
                        />

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={update.newStatus} size="sm" />
                              <span className="font-semibold text-slate-800">
                                {update.userName}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                ({update.userRole})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(update.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="text-slate-600 mt-1 leading-relaxed">
                            {update.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No timeline updates recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Reopen Complaint Banner (if Resolved) */}
              {isResolvedOrRejected && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Is the issue still not resolved?
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        If the physical issue is persisting or unsatisfactory, you can reopen it for
                        immediate Principal review.
                      </p>
                    </div>

                    {!showReopenForm && (
                      <button
                        onClick={() => setShowReopenForm(true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                      >
                        <RefreshCw size={13} />
                        <span>Reopen Complaint</span>
                      </button>
                    )}
                  </div>

                  {showReopenForm && (
                    <form onSubmit={handleReopen} className="pt-2 border-t border-amber-200 space-y-2">
                      <label className="block text-xs font-semibold text-amber-900">
                        Explain why the issue is not fixed <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        placeholder="e.g. The plumber visited but the ceiling is still dripping water..."
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReopenForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={reopenLoading}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg"
                        >
                          {reopenLoading ? 'Reopening...' : 'Confirm Reopen'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>CampusVoice Redressal Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

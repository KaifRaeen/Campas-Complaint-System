import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Complaint, Department, Priority, Status } from '../../types/index.ts';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge.tsx';
import {
  X,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  MessageSquare,
  Lock,
  AlertTriangle,
  RefreshCw,
  Send,
} from 'lucide-react';

interface AdminComplaintDetailModalProps {
  complaintNumber: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const AdminComplaintDetailModal: React.FC<AdminComplaintDetailModalProps> = ({
  complaintNumber,
  onClose,
  onUpdated,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form management controls
  const [status, setStatus] = useState<Status>('Submitted');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Modals for Reject & Resolve with note
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveNote, setResolveNote] = useState('');

  // Internal Notes
  const [newInternalNote, setNewInternalNote] = useState('');
  const [internalNoteLoading, setInternalNoteLoading] = useState(false);

  const fetchDetails = async () => {
    if (!complaintNumber) return;
    setLoading(true);
    setError(null);
    try {
      const [complaintData, deptsData] = await Promise.all([
        apiFetch<Complaint>(`/api/complaints/${complaintNumber}`),
        apiFetch<Department[]>('/api/departments'),
      ]);

      setComplaint(complaintData);
      setDepartments(deptsData);

      setStatus(complaintData.status);
      setPriority(complaintData.priority);
      setDepartmentId(complaintData.departmentId ? complaintData.departmentId.toString() : '');
      setAssignedTo(complaintData.assignedTo || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintNumber) {
      fetchDetails();
    }
  }, [complaintNumber]);

  if (!complaintNumber) return null;

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/complaints/${complaint.id}/manage`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          priority,
          departmentId: departmentId ? Number(departmentId) : null,
          assignedTo: assignedTo.trim() || null,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      setSuccessNotice('Complaint parameters updated and student notified.');
      setAdminNote('');
      setTimeout(() => setSuccessNotice(null), 3000);
      await fetchDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!complaint || !rejectReason.trim()) {
      setError('A rejection reason is strictly required.');
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/api/complaints/${complaint.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setSuccessNotice('Complaint was officially rejected and student notified.');
      setTimeout(() => setSuccessNotice(null), 3000);
      await fetchDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to reject complaint');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!complaint) return;
    setSaving(true);
    try {
      await apiFetch(`/api/complaints/${complaint.id}/manage`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Resolved',
          adminNote: resolveNote.trim() || 'Complaint confirmed resolved by administration.',
        }),
      });
      setShowResolveDialog(false);
      setResolveNote('');
      setSuccessNotice('Complaint successfully marked as Resolved!');
      setTimeout(() => setSuccessNotice(null), 3000);
      await fetchDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve complaint');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newInternalNote.trim()) return;

    setInternalNoteLoading(true);
    try {
      await apiFetch(`/api/complaints/${complaint.id}/internal-notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newInternalNote.trim() }),
      });
      setNewInternalNote('');
      await fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to add internal note');
    } finally {
      setInternalNoteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[94vh] flex flex-col text-left">
        {/* Header Bar */}
        <div className="p-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-400/30">
              {complaint?.complaintNumber || complaintNumber}
            </span>
            {complaint && <StatusBadge status={complaint.status} size="sm" />}
            {complaint && <PriorityBadge priority={complaint.priority} size="sm" />}
            <span className="text-xs text-slate-300 hidden sm:inline">
              Principal Grievance Cell Management
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success or Error Banner */}
        {successNotice && (
          <div className="bg-emerald-600 text-white px-5 py-2 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{successNotice}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-600 text-white px-5 py-2 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-3 py-20 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-2">Loading administrative dossier...</p>
            </div>
          ) : complaint ? (
            <>
              {/* Left 2 Cols: Complaint Dossier, Student Info, Timeline, Internal Notes */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Description */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">{complaint.title}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-indigo-600" />
                      {complaint.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building size={12} className="text-indigo-600" />
                      {complaint.categoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-indigo-600" />
                      {new Date(complaint.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pt-2 border-t border-slate-200/60">
                    {complaint.description}
                  </p>
                </div>

                {/* Student Information Card */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-indigo-600" />
                    <span>Student Information</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400">Full Name</span>
                      <p className="font-semibold text-slate-900">{complaint.studentName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Student ID</span>
                      <p className="font-mono font-semibold text-indigo-700">
                        {complaint.studentRoll || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">College Email</span>
                      <p className="text-slate-700 truncate">{complaint.studentEmail}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Phone / Year</span>
                      <p className="text-slate-700">
                        {complaint.studentPhone || complaint.studentYear || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Evidence Uploads ({complaint.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {complaint.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {att.fileType.startsWith('image/') ? (
                              <img
                                src={att.fileUrl}
                                alt=""
                                className="w-8 h-8 rounded object-cover border"
                              />
                            ) : (
                              <FileText size={18} className="text-indigo-600" />
                            )}
                            <span className="font-medium truncate">{att.fileName}</span>
                          </div>
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                          >
                            <span>Open</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Complaint Timeline Audit Trail
                  </h4>
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 ml-2">
                    {complaint.updates &&
                      complaint.updates.map((up) => (
                        <div key={up.id} className="relative text-xs">
                          <div className="absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-2xs" />
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={up.newStatus} size="sm" />
                                <span className="font-semibold text-slate-800">{up.userName}</span>
                                <span className="text-[10px] text-slate-400">({up.userRole})</span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(up.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600">{up.message}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Internal Notes Section (Admin Only) */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} className="text-amber-700" />
                      <span>Internal Staff Notes (Private)</span>
                    </h4>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Not visible to student
                    </span>
                  </div>

                  {complaint.internalNotes && complaint.internalNotes.length > 0 ? (
                    <div className="space-y-2">
                      {complaint.internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-2.5 bg-white rounded-lg border border-amber-200/80 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-semibold text-amber-900">{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No internal notes added yet.</p>
                  )}

                  <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add private note for admin staff..."
                      value={newInternalNote}
                      onChange={(e) => setNewInternalNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={internalNoteLoading || !newInternalNote.trim()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>Add</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Col: Admin Management Controls */}
              <div className="space-y-4">
                <form
                  onSubmit={handleSaveChanges}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
                >
                  <h4 className="font-bold text-slate-900 text-sm border-b pb-2">
                    Grievance Management Panel
                  </h4>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Department Assignment */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Staff Assignment */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assigned Staff / Officer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar (Network Eng)"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Official Response Note */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Timeline Message / Response
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add note for student timeline (e.g. Electrician scheduled for 3 PM)..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    <span>{saving ? 'Updating...' : 'Save & Notify Student'}</span>
                  </button>
                </form>

                {/* Quick Action Buttons: Resolve & Reject */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h5 className="font-bold text-slate-800 text-xs">Quick Action Workflows</h5>

                  <button
                    type="button"
                    onClick={() => setShowResolveDialog(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark as Resolved</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectDialog(true)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} />
                    <span>Reject Complaint</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Confirmation Dialog: Reject Complaint (Mandatory Reason) */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left border">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Reject Complaint #{complaint?.complaintNumber}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rejecting a grievance requires a clear justification that will be permanently
                logged into the student's timeline and audit trail.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Duplicate issue already tracked in CMP-2026-00001 or Not under college jurisdiction."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {saving ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog: Resolve Complaint (With Resolution Note) */}
        {showResolveDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left border">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Resolve Complaint #{complaint?.complaintNumber}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Marking this grievance as resolved will close the ticket and notify the student. The
                student retains the right to reopen if the issue persists.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Summary Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Technician replaced water filter cartridge. Water quality verified."
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveDialog(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmResolve}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {saving ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

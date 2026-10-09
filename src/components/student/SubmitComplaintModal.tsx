import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api-client.ts';
import { Category, Department, Priority } from '../../types/index.ts';
import confetti from 'canvas-confetti';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon.tsx';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaintNumber: string) => void;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // File upload state
  const [attachment, setAttachment] = useState<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    preview?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiFetch<Category[]>('/api/categories').then(setCategories).catch(console.error);
      apiFetch<Department[]>('/api/departments').then(setDepartments).catch(console.error);
      setSubmittedComplaint(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, PNG, PDF
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are permitted for complaint evidence.');
      return;
    }

    // Validate size: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachment({
        fileName: file.name,
        fileUrl: dataUrl,
        fileType: file.type,
        fileSize: file.size,
        preview: file.type.startsWith('image/') ? dataUrl : undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !location.trim() || !description.trim()) {
      setError('Please fill in all required fields (Title, Category, Location, and Description).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        title: title.trim(),
        categoryId: Number(categoryId),
        priority,
        location: location.trim(),
        description: description.trim(),
      };

      if (departmentId) {
        payload.departmentId = Number(departmentId);
      }

      if (attachment) {
        payload.attachmentData = {
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
        };
      }

      const created = await apiFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSubmittedComplaint(created);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setCategoryId('');
    setDepartmentId('');
    setPriority('Medium');
    setLocation('');
    setDescription('');
    setAttachment(null);
    setSubmittedComplaint(null);
    onClose();
  };

  const presetLocations = [
    'Main Building',
    'Block A',
    'Block B',
    'Central Library',
    'Hostel Block 1',
    'Hostel Block 2',
    'Science Lab',
    'Campus Cafeteria',
    'Sports Complex',
    'North Parking',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col text-left">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {submittedComplaint ? (
          /* SUCCESS SCREEN */
          <div className="p-8 sm:p-12 text-center my-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Acknowledged by System
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                Complaint Submitted Successfully
              </h3>
              <div className="mt-3 inline-block px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                <p className="text-xs text-indigo-700 font-medium">Tracking Identifier</p>
                <p className="text-xl font-mono font-bold text-indigo-900">
                  {submittedComplaint.complaintNumber}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-4 leading-relaxed">
                Your complaint has been safely recorded in the central database. The administration
                has been alerted and will update the timeline as work progresses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSuccess(submittedComplaint.complaintNumber);
                  handleResetAndClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Track Complaint</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <>
            <div className="p-6 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
                <span>CampusVoice Redressal</span>
                <span>•</span>
                <span>Verified Submission</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Submit New Complaint</h3>
              <p className="text-xs text-indigo-200/80 mt-1">
                Provide clear details to assist the college maintenance & administrative staff.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water cooler not working in Block A 2nd floor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Choose Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => {
                      const isSelected = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                            isSelected
                              ? p === 'Urgent'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : p === 'High'
                                ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                : p === 'Medium'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Location with Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Specific Room <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block A, Room 204 or North Bicycle Stand"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 self-center">Presets:</span>
                  {presetLocations.slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLocation(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain the issue clearly: what happened, when did you first notice it, and how does it affect students?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Evidence (Optional - JPG, PNG, PDF max 10MB)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                    <Upload size={14} className="text-slate-500" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {attachment && (
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {attachment.preview ? (
                        <img
                          src={attachment.preview}
                          alt="preview"
                          className="w-5 h-5 rounded object-cover"
                        />
                      ) : (
                        <FileText size={14} className="text-indigo-600" />
                      )}
                      <span className="font-medium truncate max-w-[150px]">
                        {attachment.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {loading ? 'Submitting to Database...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

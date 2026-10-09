import React, { useState } from 'react';
import { apiFetch } from '../lib/api-client.ts';
import { Complaint } from '../types/index.ts';
import { StatusBadge, PriorityBadge } from './common/StatusBadge.tsx';
import { Search, X, ArrowRight, AlertCircle, Clock, MapPin } from 'lucide-react';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetails: (complaintNumber: string) => void;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  onOpenDetails,
}) => {
  const [complaintNum, setComplaintNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Complaint | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintNum.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetch<Complaint>(`/api/complaints/${complaintNum.trim()}`);
      setResult(data);
    } catch (err: any) {
      setError(
        'No complaint found with this number. Please check the ticket format (e.g. CMP-2026-00001).'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
            <Search size={14} />
            <span>Public Tracking Portal</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">Track Complaint Progress</h3>
          <p className="text-xs text-indigo-200/80 mt-1">
            Enter your 14-character complaint reference code to view live resolution updates.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. CMP-2026-00001"
              value={complaintNum}
              onChange={(e) => setComplaintNum(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs shrink-0"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => setComplaintNum('CMP-2026-00001')}
              className="font-mono text-indigo-600 hover:underline"
            >
              CMP-2026-00001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setComplaintNum('CMP-2026-00002')}
              className="font-mono text-indigo-600 hover:underline"
            >
              CMP-2026-00002
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-800">
                  {result.complaintNumber}
                </span>
                <StatusBadge status={result.status} size="sm" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{result.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {result.location}
                  </span>
                  <span>•</span>
                  <span>{result.categoryName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Last updated:{' '}
                  {new Date(result.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenDetails(result.complaintNumber);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <span>Full Timeline</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

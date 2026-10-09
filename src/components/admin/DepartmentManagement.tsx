import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Department } from '../../types/index.ts';
import { Building, Plus, Check, X, Edit2, Power } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Department[]>('/api/departments');
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingDept) {
        await apiFetch(`/api/departments/${editingDept.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      } else {
        await apiFetch('/api/departments', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      }
      setShowAddModal(false);
      setEditingDept(null);
      setName('');
      setDescription('');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (dept: Department) => {
    try {
      await apiFetch(`/api/departments/${dept.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !dept.isActive }),
      });
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            College Departments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative units and complaint resolution authorities.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDept(null);
            setName('');
            setDescription('');
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Building size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    dept.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {dept.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {dept.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEdit(dept)}
                className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => toggleStatus(dept)}
                className={`font-medium flex items-center gap-1 ${
                  dept.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600'
                }`}
              >
                <Power size={13} />
                <span>{dept.isActive ? 'Disable' : 'Enable'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Gymnasium Authority"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly state jurisdiction and contact responsibility..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

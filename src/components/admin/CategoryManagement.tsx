import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api-client.ts';
import { Category } from '../../types/index.ts';
import { CategoryIcon } from '../common/CategoryIcon.tsx';
import { Plus, Edit2, Power, X } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('AlertCircle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableIcons = [
    'GraduationCap',
    'Building2',
    'Home',
    'BookOpen',
    'FlaskConical',
    'UtensilsCrossed',
    'Bus',
    'Zap',
    'Droplets',
    'Wifi',
    'ShieldCheck',
    'FileText',
    'AlertCircle',
    'HelpCircle',
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Category[]>('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await apiFetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim(), description: description.trim(), icon }),
        });
      } else {
        await apiFetch('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: description.trim(), icon }),
        });
      }
      setShowAddModal(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (cat: Category) => {
    try {
      await apiFetch(`/api/categories/${cat.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon);
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Complaint Categories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure grievance classifications and icons available to students.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setName('');
            setDescription('');
            setIcon('AlertCircle');
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <CategoryIcon iconName={cat.icon} size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    cat.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEdit(cat)}
                className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => toggleStatus(cat)}
                className={`font-medium flex items-center gap-1 ${
                  cat.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600'
                }`}
              >
                <Power size={13} />
                <span>{cat.isActive ? 'Disable' : 'Enable'}</span>
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
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Gymnasium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Icon Representation</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {availableIcons.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize issues falling under this category..."
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
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

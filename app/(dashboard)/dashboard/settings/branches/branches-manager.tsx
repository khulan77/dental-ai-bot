'use client';

import { useState } from 'react';
import { addBranch, updateBranch, deleteBranch } from '@/lib/db/clinic-actions';
import type { BusinessHoursData, BranchRow } from '@/lib/db/clinic-actions';
import BranchForm, { type BranchFormData } from './branch-form';

export default function BranchesManager({
  clinicHours,
  initialBranches,
}: {
  clinicHours: BusinessHoursData;
  initialBranches: BranchRow[];
}) {
  const [branches, setBranches] = useState<BranchRow[]>(initialBranches);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(data: BranchFormData) {
    setLoading(true);
    const result = await addBranch(data);
    if (result.success && result.branch) {
      setBranches([...branches, result.branch]);
      setShowAddForm(false);
      showMessage('success', 'Салбар нэмэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleUpdate(branchId: string, data: BranchFormData) {
    setLoading(true);
    const result = await updateBranch(branchId, data);
    if (result.success) {
      setBranches(branches.map(b => (b.id === branchId ? { ...b, ...data } : b)));
      setEditingId(null);
      showMessage('success', 'Амжилттай шинэчлэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleDelete(branchId: string, name: string) {
    if (!confirm(`${name}-г устгах уу? Энэ салбарын эмч холбоос устана.`)) return;
    setLoading(true);
    const result = await deleteBranch(branchId);
    if (result.success) {
      setBranches(branches.filter(b => b.id !== branchId));
      showMessage('success', 'Салбар устгагдлаа');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          Олон хаягтай бол салбар бүрээ нэмнэ үү. Дараа нь эмч бүрийг аль салбарт
          ажилладгийг нь "Эмч нар" хэсгээс тохируулна. Салбаргүй бол цаг захиалга
          хуучинчлан нэг хаягаар ажиллана.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition font-medium"
        >
          + Шинэ салбар нэмэх
        </button>
      )}

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-4">Шинэ салбар</h3>
          <BranchForm
            clinicHours={clinicHours}
            onCancel={() => setShowAddForm(false)}
            onSubmit={handleAdd}
            loading={loading}
            submitLabel="Нэмэх"
          />
        </div>
      )}

      <div className="space-y-3">
        {branches.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">🏢</p>
            <p>Салбар хараахан байхгүй</p>
            <p className="text-sm mt-1">Дээрх товчийг дарж салбараа нэмнэ үү</p>
          </div>
        )}

        {branches.map(branch => (
          <div key={branch.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {editingId === branch.id ? (
              <div className="p-5 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-4">Засах: {branch.name}</h4>
                <BranchForm
                  initialData={branch}
                  clinicHours={clinicHours}
                  onCancel={() => setEditingId(null)}
                  onSubmit={data => handleUpdate(branch.id, data)}
                  loading={loading}
                  submitLabel="Хадгалах"
                />
              </div>
            ) : (
              <div className="p-5 hover:bg-slate-50 transition flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">{branch.name}</h4>
                  {branch.address && (
                    <p className="text-sm text-slate-600 mt-1">{branch.address}</p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-slate-500 mt-0.5">{branch.phone}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">
                    {branch.business_hours ? '🕐 Өөрийн цагтай' : '🕐 Клиникийн цагаар'}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingId(branch.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Засах"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id, branch.name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Устгах"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

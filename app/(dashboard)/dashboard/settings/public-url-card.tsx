'use client';

import { useEffect, useState } from 'react';
import { updateClinicSlug } from '@/lib/db/clinic-actions';
import { CopyLinkButton } from './copy-link-button';

export function PublicUrlCard({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState('');
  const [editing, setEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(slug);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullUrl = `${origin}/c/${currentSlug}`;

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleSave() {
    if (newSlug === currentSlug) {
      setEditing(false);
      return;
    }

    setSaving(true);
    const result = await updateClinicSlug(newSlug);

    if (result.success && result.slug) {
      setCurrentSlug(result.slug);
      setEditing(false);
      showMessage('success', 'URL амжилттай өөрчлөгдлөө!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  function handleCancel() {
    setNewSlug(currentSlug);
    setEditing(false);
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔗</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-blue-900">Танай клиникийн линк</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                ✏️ Өөрчлөх
              </button>
            )}
          </div>
          <p className="text-xs text-blue-700 mb-3">
            Энэ линкийг Instagram, Facebook bio-д тавиад үйлчлүүлэгчид рүү илгээнэ үү
          </p>

          {!editing && (
            <div className="bg-white rounded-xl border border-blue-200 p-3 flex items-center gap-2">
              <code className="flex-1 text-sm text-blue-900 font-mono truncate">
                {fullUrl}
              </code>
              <CopyLinkButton slug={currentSlug} />
            </div>
          )}

          {editing && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-blue-300 bg-white text-sm">
                <span className="text-slate-500 select-none font-mono">{origin}/c/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={e =>
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  minLength={3}
                  maxLength={30}
                  placeholder="my-clinic"
                  className="flex-1 outline-none bg-transparent text-blue-900 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || newSlug.length < 3}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Хадгалж байна...' : '✓ Хадгалах'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Болих
                </button>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                ⚠️ URL өөрчилбөл хуучин линк ажиллахаа болино. Instagram bio-гоо шинэчилнэ үү!
              </p>
            </div>
          )}

          {message && (
            <div
              className={`mt-2 p-2 rounded text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? '✓' : '⚠️'} {message.text}
            </div>
          )}

          <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-100">
            <p className="text-[11px] text-blue-800 font-medium mb-1">💡 Хэрхэн ашиглах вэ?</p>
            <ul className="text-[11px] text-blue-700 space-y-0.5 ml-4 list-disc">
              <li>Instagram bio-д тавих</li>
              <li>Facebook page-ийн "Book now" товчинд холбох</li>
              <li>SMS, Storage-аас линк илгээх</li>
              <li>Visit card дээр QR код болгох</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

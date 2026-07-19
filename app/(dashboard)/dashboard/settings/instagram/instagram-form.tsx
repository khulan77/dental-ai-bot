'use client';

import { useState } from 'react';
import { updateClinic } from '@/lib/db/clinic-actions';

type Props = {
  pageId: string | null;
  hasToken: boolean;
  webhookUrl: string;
};

export default function InstagramForm({ pageId, hasToken, webhookUrl }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const newPageId = (formData.get('instagram_page_id') as string).trim();
    const newToken = (formData.get('meta_page_access_token') as string).trim();

    const data: Record<string, string | null> = {
      instagram_page_id: newPageId || null,
    };
    // Token хоосон бол хуучныг хэвээр үлдээнэ; зөвхөн шинээр бичсэн үед шинэчилнэ
    if (newToken) {
      data.meta_page_access_token = newToken;
    }

    const result = await updateClinic(data);

    if (result.success) {
      setMessage({ type: 'success', text: 'Амжилттай хадгалагдлаа!' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Алдаа гарлаа' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  async function copyWebhookUrl() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const connected = Boolean(pageId) && hasToken;

  return (
    <div className="space-y-6">
      {/* Холболтын төлөв */}
      <div
        className={`rounded-2xl border p-4 flex items-center gap-3 ${
          connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}
      >
        <span className="text-xl">{connected ? '✅' : '⚠️'}</span>
        <span className="text-sm font-medium">
          {connected
            ? 'Instagram/Messenger холбогдсон. Бот DM-д хариулна.'
            : 'Хараахан холбогдоогүй. Доорх мэдээллийг бөглөнө үү.'}
        </span>
      </div>

      {/* Webhook URL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-1">Webhook URL</h3>
        <p className="text-sm text-slate-500 mb-3">
          Meta Developer app → Webhooks → Callback URL хэсэгт энэ хаягийг тавина.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm overflow-x-auto whitespace-nowrap">
            {webhookUrl}
          </code>
          <button
            type="button"
            onClick={copyWebhookUrl}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 whitespace-nowrap"
          >
            {copied ? '✓ Хуулсан' : 'Хуулах'}
          </button>
        </div>
      </div>

      {/* Форм */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="mb-1">
          <h3 className="font-semibold text-slate-900">Хуудасны холболт</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Meta Developer app-аас авсан утгуудыг оруулна.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Page ID (хуудасны ID)
          </label>
          <input
            name="instagram_page_id"
            defaultValue={pageId ?? ''}
            placeholder="Жнь: 17841400000000000"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Page Access Token
          </label>
          <input
            name="meta_page_access_token"
            type="password"
            placeholder={hasToken ? '•••••••• (тохируулсан — солихгүй бол хоосон орхи)' : 'EAAG...'}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">
            Нууц түлхүүр — хэн нэгэнтэй бүү хуваалц. Хоосон орхивол одоогийн утга хэвээр үлдэнэ.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md disabled:opacity-50 transition-all"
          >
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
          {message && (
            <div
              className={`text-sm font-medium ${
                message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {message.type === 'success' ? '✓' : '⚠️'} {message.text}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

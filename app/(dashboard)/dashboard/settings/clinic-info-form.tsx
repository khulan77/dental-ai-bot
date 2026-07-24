'use client';

import { useState } from 'react';
import { updateClinic } from '@/lib/db/clinic-actions';

export default function ClinicInfoForm({ clinic }: { clinic: any }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      about: formData.get('about') as string,
      owner_phone: formData.get('owner_phone') as string,
      owner_email: formData.get('owner_email') as string,
      website: formData.get('website') as string,
      facebook_url: formData.get('facebook_url') as string,
      instagram_url: formData.get('instagram_url') as string,
    };

    const result = await updateClinic(data);

    if (result.success) {
      setMessage({ type: 'success', text: 'Амжилттай хадгалагдлаа!' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Алдаа гарлаа' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Section title="Үндсэн мэдээлэл" description="Клиникийн нэр, тухай">
        <Field
          label="Клиникийн нэр"
          name="name"
          defaultValue={clinic.name}
          required
        />
        <Field
          label="Тухай (богино тайлбар)"
          name="about"
          defaultValue={clinic.about ?? ''}
          textarea
          placeholder="Жнь: 10 жилийн туршлагатай мэргэжлийн шүдний эмнэлэг"
        />
        <p className="text-xs text-slate-400">
          Хаягийг «Салбар» хэсэгт салбар бүрээр нь оруулна.
        </p>
      </Section>

      {/* Contact */}
      <Section title="Холбоо барих" description="Үйлчлүүлэгчтэй холбогдох мэдээлэл">
        <Field
          label="Утас"
          name="owner_phone"
          defaultValue={clinic.owner_phone ?? ''}
          placeholder="99119911"
        />
        <Field
          label="Имэйл"
          name="owner_email"
          defaultValue={clinic.owner_email ?? ''}
          type="email"
        />
      </Section>

      {/* Social */}
      <Section title="Сошиал медиа" description="Линкүүд (заавал биш)">
        <Field
          label="Веб сайт"
          name="website"
          defaultValue={clinic.website ?? ''}
          placeholder="https://..."
        />
        <Field
          label="Facebook хуудас"
          name="facebook_url"
          defaultValue={clinic.facebook_url ?? ''}
          placeholder="https://facebook.com/..."
        />
        <Field
          label="Instagram"
          name="instagram_url"
          defaultValue={clinic.instagram_url ?? ''}
          placeholder="https://instagram.com/..."
        />
      </Section>

      {/* Submit */}
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
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
  textarea = false,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const inputClasses =
    'w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm';

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
        />
      )}
    </div>
  );
}
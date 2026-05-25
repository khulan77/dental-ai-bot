'use client';

import { useState } from 'react';
import { addService, updateService, deleteService } from '@/lib/db/clinic-actions';

type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
  description?: string;
};

export default function ServicesManager({
  clinicId,
  initialServices,
}: {
  clinicId: string;
  initialServices: Service[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(formData: FormData) {
    setLoading(true);
    const result = await addService(clinicId, {
      name: formData.get('name') as string,
      price_mnt: parseInt(formData.get('price_mnt') as string, 10),
      duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
      description: (formData.get('description') as string) || undefined,
    });

    if (result.success) {
      // Шинэ үйлчилгээг local state-д нэмэх (UI шууд шинэчлэхэд)
      const newService: Service = {
        id: crypto.randomUUID(),
        name: formData.get('name') as string,
        price_mnt: parseInt(formData.get('price_mnt') as string, 10),
        duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
        description: (formData.get('description') as string) || undefined,
      };
      setServices([...services, newService]);
      setShowAddForm(false);
      showMessage('success', 'Үйлчилгээ амжилттай нэмэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleUpdate(serviceId: string, formData: FormData) {
    setLoading(true);
    const updates = {
      name: formData.get('name') as string,
      price_mnt: parseInt(formData.get('price_mnt') as string, 10),
      duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
      description: (formData.get('description') as string) || undefined,
    };

    const result = await updateService(clinicId, serviceId, updates);

    if (result.success) {
      setServices(services.map(s => (s.id === serviceId ? { ...s, ...updates } : s)));
      setEditingId(null);
      showMessage('success', 'Амжилттай шинэчлэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleDelete(serviceId: string, serviceName: string) {
    if (!confirm(`"${serviceName}" үйлчилгээг устгах уу?`)) return;

    setLoading(true);
    const result = await deleteService(clinicId, serviceId);

    if (result.success) {
      setServices(services.filter(s => s.id !== serviceId));
      showMessage('success', 'Үйлчилгээ устгагдлаа');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Message */}
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

      {/* Add button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition font-medium"
        >
          + Шинэ үйлчилгээ нэмэх
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-4">Шинэ үйлчилгээ</h3>
          <ServiceForm
            onCancel={() => setShowAddForm(false)}
            onSubmit={handleAdd}
            loading={loading}
            submitLabel="Нэмэх"
          />
        </div>
      )}

      {/* Services list */}
      <div className="space-y-2">
        {services.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">📋</p>
            <p>Үйлчилгээ хараахан байхгүй</p>
            <p className="text-sm mt-1">Дээрх товчийг дарж эхний үйлчилгээгээ нэмнэ үү</p>
          </div>
        )}

        {services.map(service => (
          <div
            key={service.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            {editingId === service.id ? (
              <div className="p-5 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-4">Засах</h4>
                <ServiceForm
                  initialData={service}
                  onCancel={() => setEditingId(null)}
                  onSubmit={fd => handleUpdate(service.id, fd)}
                  loading={loading}
                  submitLabel="Хадгалах"
                />
              </div>
            ) : (
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-slate-900">{service.name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {service.duration_minutes} минут
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-bold text-blue-600 text-lg">
                    {service.price_mnt.toLocaleString()}₮
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(service.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Засах"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(service.id, service.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Устгах"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({
  initialData,
  onCancel,
  onSubmit,
  loading,
  submitLabel,
}: {
  initialData?: Service;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  submitLabel: string;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Үйлчилгээний нэр
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialData?.name ?? ''}
          placeholder="Жнь: Шүд цайруулах"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Үнэ (₮)
          </label>
          <input
            type="number"
            name="price_mnt"
            required
            min={0}
            defaultValue={initialData?.price_mnt ?? ''}
            placeholder="350000"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Үргэлжлэх (минут)
          </label>
          <input
            type="number"
            name="duration_minutes"
            required
            min={5}
            step={5}
            defaultValue={initialData?.duration_minutes ?? 30}
            placeholder="60"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Тайлбар (заавал биш)
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description ?? ''}
          placeholder="Үйлчилгээний дэлгэрэнгүй..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Хадгалж байна...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
        >
          Болих
        </button>
      </div>
    </form>
  );
}
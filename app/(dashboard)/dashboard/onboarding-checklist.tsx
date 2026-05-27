import Link from 'next/link';
import type { OnboardingStep } from '@/lib/dashboard/onboarding';

export default function OnboardingChecklist({
  steps,
  progress,
  completedCount,
  totalCount,
  userEmail,
  clinicName,
}: {
  steps: OnboardingStep[];
  progress: number;
  completedCount: number;
  totalCount: number;
  userEmail: string;
  clinicName: string;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Welcome header */}
      <div className="text-center py-6">
        <div className="text-5xl mb-3">👋</div>
        <h1 className="text-3xl font-bold text-slate-900">
          Тавтай морил, {clinicName}!
        </h1>
        <p className="text-slate-500 mt-2">
          Эхэлэхийн тулд эдгээрийг хийнэ үү
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {completedCount} / {totalCount} алхам
            </p>
            <p className="text-xs text-slate-500">
              {progress === 100 ? '🎉 Бүгд бэлэн!' : 'Үргэлжлүүлэх'}
            </p>
          </div>
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <Link
            key={step.id}
            href={step.completed ? '#' : step.href}
            className={`block p-4 rounded-2xl border transition-all ${
              step.completed
                ? 'bg-emerald-50 border-emerald-200 cursor-default'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Status circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.completed ? '✓' : idx + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <h3
                    className={`font-semibold ${
                      step.completed
                        ? 'text-emerald-900 line-through opacity-60'
                        : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    step.completed ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Action */}
              {!step.completed && (
                <div className="flex-shrink-0">
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition">
                    Очих →
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Tip card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-bold text-purple-900 mb-1">
              Анхны клиент авах хүртэл ~5 минут
            </h4>
            <p className="text-sm text-purple-700">
              Алхамууд дууссаны дараа өөрийн линкийг Instagram bio-д тавиад
              үйлчлүүлэгчид рүүгээ илгээж эхэлж болно!
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="text-center text-xs text-slate-400">
        Нэвтэрсэн: {userEmail}
      </div>
    </div>
  );
}
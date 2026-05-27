import type { Clinic } from './types';

export default function Footer({ clinic }: { clinic: Clinic }) {
  return (
    <footer className="py-12 border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/50 flex items-center justify-center">
            <span className="text-lg">🦷</span>
          </div>
          <span className="font-bold text-slate-900">
            {clinic.name}
          </span>
        </div>

        <p className="text-xs tracking-wide text-slate-400">
          Powered by Dental AI · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
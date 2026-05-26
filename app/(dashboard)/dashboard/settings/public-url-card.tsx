'use client';

import { useEffect, useState } from 'react';
import { CopyLinkButton } from './copy-link-button';

export function PublicUrlCard({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullUrl = `${origin}/c/${slug}`;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔗</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-blue-900">Танай клиникийн линк</h3>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Энэ линкийг Instagram, Facebook bio-д тавиад үйлчлүүлэгчид рүү илгээнэ үү
          </p>

          <div className="bg-white rounded-xl border border-blue-200 p-3 flex items-center gap-2">
            <code className="flex-1 text-sm text-blue-900 font-mono truncate">
              {fullUrl}
            </code>
            <CopyLinkButton slug={slug} />
          </div>

          <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-100">
            <p className="text-[11px] text-blue-800 font-medium mb-1">💡 Хэрхэн ашиглах вэ?</p>
            <ul className="text-[11px] text-blue-700 space-y-0.5 ml-4 list-disc">
              <li>Instagram bio-д тавих</li>
              <li>Facebook page-ийн "Book now" товчинд холбох</li>
              <li>Storage-аас линк илгээх</li>
              <li>Visit card дээр QR код болгох</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
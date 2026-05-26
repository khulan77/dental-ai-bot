import type { TopCustomer } from '@/lib/dashboard/stats';

export default function TopCustomersList({
  customers,
}: {
  customers: TopCustomer[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900">🏆 Шилдэг үйлчлүүлэгчид</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Хамгийн их ирдэг хүмүүс
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-sm">Үйлчлүүлэгч хараахан байхгүй</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer, idx) => {
            const ranks = ['🥇', '🥈', '🥉', '4', '5'];
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="text-xl w-8 text-center">
                  {ranks[idx] ?? idx + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-semibold text-blue-700">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {customer.visitCount} удаа • ₮{customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
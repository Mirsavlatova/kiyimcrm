import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { dashboardApi } from "../api";
import { formatCurrency } from "../utils";
import { StatCard, LoadingSpinner } from "../components/ui";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bugungi savdo" value={formatCurrency(data.today_sales)} icon="📅" color="blue" />
        <StatCard label="Haftalik savdo" value={formatCurrency(data.weekly_sales)} icon="📆" color="teal" />
        <StatCard label="Oylik savdo" value={formatCurrency(data.monthly_sales)} icon="📊" color="green" />
        <StatCard label="Yillik savdo" value={formatCurrency(data.yearly_sales)} icon="🏆" color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faol mijozlar" value={data.active_customers?.toLocaleString()} icon="👥" color="blue" />
        <StatCard label="Mahsulotlar" value={data.total_products?.toLocaleString()} icon="📦" color="orange" />
        <StatCard label="Buyurtmalar" value={data.total_orders?.toLocaleString()} icon="🛒" color="teal" />
        <StatCard label="Qarzdor mijozlar" value={data.debt_customers?.toLocaleString()} icon="⚠️" color="red"
          sub={`Kam qolgan: ${data.low_stock_count} ta mahsulot`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly sales chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm text-gray-800 mb-4">Oylik savdo (so'm)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthly_chart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip formatter={(v) => [formatCurrency(v), "Savdo"]} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top products pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-gray-800 mb-4">Top mahsulotlar</h3>
          {data.top_products?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.top_products.slice(0, 6)} dataKey="revenue" nameKey="name"
                    cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {data.top_products.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {data.top_products.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-gray-600 truncate flex-1">{p.name}</span>
                    <span className="text-xs font-medium text-gray-800">{p.sold} ta</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Ma'lumot yo'q</p>
          )}
        </div>
      </div>

      {/* Top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top customers */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">Top 10 mijozlar</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {data.top_customers?.slice(0, 10).map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  {c.debt > 0 && (
                    <p className="text-xs text-red-500">Qarz: {formatCurrency(c.debt)}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">{formatCurrency(c.total_purchases)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products table */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">Top 10 mahsulotlar</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {data.top_products?.slice(0, 10).map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sold} ta sotilgan</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

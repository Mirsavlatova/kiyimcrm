// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reportsApi, authApi, auditApi } from "../api";
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ROLE_LABELS, ROLE_COLORS } from "../utils";
import { EmptyState, LoadingSpinner, Badge, Modal, Pagination } from "../components/ui";
import { useAuthStore } from "../store/authStore";

export function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sales-report", startDate, endDate],
    queryFn: () => reportsApi.sales({
      start_date: startDate || undefined,
      end_date: endDate || undefined
    }).then(r => r.data),
    enabled: submitted,
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    setSubmitted(true);
    refetch();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Hisobotlar</h1>

      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-800 mb-4">Savdo hisoboti</h3>
        <form onSubmit={handleGenerate} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="form-label">Boshlanish sanasi</label>
            <input type="date" className="form-input" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tugash sanasi</label>
            <input type="date" className="form-input" value={endDate}
              onChange={e => setEndDate(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">📊 Hisobot chiqarish</button>
        </form>
      </div>

      {isLoading && <LoadingSpinner />}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Jami buyurtmalar", value: data.total_orders, icon: "🛒" },
              { label: "Umumiy summa", value: formatCurrency(data.total_amount), icon: "💰" },
              { label: "To'langan", value: formatCurrency(data.paid_amount), icon: "✅" },
              { label: "Qarzdorlik", value: formatCurrency(data.debt_amount), icon: "⚠️" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-800">Buyurtmalar ro'yxati</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Raqam</th>
                    <th className="text-left px-4 py-3">Mijoz</th>
                    <th className="text-left px-4 py-3">Summa</th>
                    <th className="text-left px-4 py-3">To'langan</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders?.slice(0, 50).map(o => (
                    <tr key={o.id} className="table-row">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{o.order_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.customer?.company_name || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(o.total_amount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(o.paid_amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={ORDER_STATUS_COLORS[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── USERS PAGE ───────────────────────────────────────────────────────────────
const emptyUserForm = { username: "", full_name: "", email: "", role: "sotuv_menejeri", password: "", is_active: true };

export function UsersPage() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => authApi.getUsers().then(r => r.data),
  });

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyUserForm);

  const createMut = useMutation({
    mutationFn: (d) => authApi.createUser(d),
    onSuccess: () => { qc.invalidateQueries(["users"]); setShowModal(false); toast.success("Foydalanuvchi qo'shildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => authApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries(["users"]); setShowModal(false); setEditItem(null); toast.success("Yangilandi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const openCreate = () => { setForm(emptyUserForm); setEditItem(null); setShowModal(true); };
  const openEdit = (u) => { setEditItem(u); setForm({ ...emptyUserForm, ...u, password: "" }); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editItem) updateMut.mutate({ id: editItem.id, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Foydalanuvchilar</h1>
        <button onClick={openCreate} className="btn-primary">+ Yangi foydalanuvchi</button>
      </div>

      <div className="card">
        {isLoading ? <LoadingSpinner /> : !users?.length ? (
          <EmptyState icon="👤" title="Foydalanuvchilar yo'q" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Ism</th>
                <th className="text-left px-4 py-3">Login</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Amal</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="table-row">
                  <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                        {u.full_name?.[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.username}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                      {u.is_active ? "Faol" : "Nofaol"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Tahrir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Login *</label>
              <input className="form-input" required value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                disabled={!!editItem} />
            </div>
            <div>
              <label className="form-label">To'liq ism *</label>
              <input className="form-input" required value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Rol</label>
              <select className="form-input" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">{editItem ? "Yangi parol (ixtiyoriy)" : "Parol *"}</label>
              <input className="form-input" type="password" value={form.password}
                required={!editItem}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.value === "true" })}>
                <option value="true">Faol</option>
                <option value="false">Nofaol</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Bekor</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── AUDIT LOG PAGE ───────────────────────────────────────────────────────────
export function AuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audit", page],
    queryFn: () => auditApi.list({ page, size: 30 }).then(r => r.data),
  });

  const actionColors = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Audit Log</h1>

      <div className="card">
        {isLoading ? <LoadingSpinner /> : !data?.items?.length ? (
          <EmptyState icon="🔍" title="Loglar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Foydalanuvchi</th>
                    <th className="text-left px-4 py-3">Amal</th>
                    <th className="text-left px-4 py-3">Jadval</th>
                    <th className="text-left px-4 py-3">Tafsilot</th>
                    <th className="text-left px-4 py-3">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(log => (
                    <tr key={log.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {log.user?.username || "tizim"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-600"}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{log.table_name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{log.details || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={data.pages} total={data.total} size={30} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

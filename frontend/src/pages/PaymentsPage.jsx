import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsApi, customersApi, ordersApi } from "../api";
import { formatCurrency, formatDateTime, PAYMENT_TYPE_LABELS, PAYMENT_TYPE_COLORS } from "../utils";
import { Modal, Pagination, EmptyState, LoadingSpinner, Badge } from "../components/ui";

function PaymentForm({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    customer_id: "", order_id: "", amount: "", payment_type: "naqd", note: ""
  });
  const [customerSearch, setCustomerSearch] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers-pay-search", customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch, size: 8 }).then(r => r.data),
    enabled: customerSearch.length > 1,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders-for-customer", form.customer_id],
    queryFn: () => ordersApi.list({ customer_id: form.customer_id, size: 20 }).then(r => r.data),
    enabled: !!form.customer_id,
  });

  const createMut = useMutation({
    mutationFn: (d) => paymentsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries(["payments"]);
      qc.invalidateQueries(["customers"]);
      onClose();
      toast.success("To'lov qabul qilindi!");
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer_id) return toast.error("Mijozni tanlang");
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Summani kiriting");
    createMut.mutate({
      customer_id: Number(form.customer_id),
      order_id: form.order_id ? Number(form.order_id) : null,
      amount: Number(form.amount),
      payment_type: form.payment_type,
      note: form.note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Mijoz *</label>
        <input className="form-input" placeholder="Mijoz qidiring..."
          value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
        {customers?.items?.length > 0 && customerSearch && !form.customer_id && (
          <div className="border border-gray-200 rounded-lg mt-1 max-h-36 overflow-y-auto bg-white shadow-lg">
            {customers.items.map(c => (
              <button key={c.id} type="button"
                onClick={() => { setForm({ ...form, customer_id: c.id }); setCustomerSearch(c.company_name); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                <span className="font-medium">{c.company_name}</span>
                {c.debt > 0 && <span className="ml-2 text-xs text-red-500">Qarz: {formatCurrency(c.debt)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {form.customer_id && orders?.items?.length > 0 && (
        <div>
          <label className="form-label">Buyurtma (ixtiyoriy)</label>
          <select className="form-input" value={form.order_id}
            onChange={e => setForm({ ...form, order_id: e.target.value })}>
            <option value="">Tanlang (umumiy to'lov)</option>
            {orders.items.filter(o => o.debt_amount > 0).map(o => (
              <option key={o.id} value={o.id}>
                {o.order_number} — {formatCurrency(o.debt_amount)} qarz
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Summa (so'm) *</label>
          <input className="form-input" type="number" required min="1"
            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <label className="form-label">To'lov turi *</label>
          <select className="form-input" value={form.payment_type}
            onChange={e => setForm({ ...form, payment_type: e.target.value })}>
            {Object.entries(PAYMENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Izoh</label>
        <textarea className="form-input" rows={2} value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })} />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor qilish</button>
        <button type="submit" disabled={createMut.isPending} className="btn-primary">
          {createMut.isPending ? "Saqlanmoqda..." : "To'lovni saqlash"}
        </button>
      </div>
    </form>
  );
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page, typeFilter],
    queryFn: () => paymentsApi.list({ page, size: 20, payment_type: typeFilter || undefined }).then(r => r.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">To'lovlar</h1>
          <p className="text-xs text-gray-500">Jami {data?.total || 0} ta to'lov</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <span>+</span> To'lov qabul qilish
        </button>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <button onClick={() => { setTypeFilter(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!typeFilter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            Barchasi
          </button>
          {Object.entries(PAYMENT_TYPE_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => { setTypeFilter(k); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === k ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {v}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : !data?.items?.length ? (
          <EmptyState icon="💳" title="To'lovlar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Mijoz</th>
                    <th className="text-left px-4 py-3">Buyurtma</th>
                    <th className="text-left px-4 py-3">Summa</th>
                    <th className="text-left px-4 py-3">Turi</th>
                    <th className="text-left px-4 py-3">Izoh</th>
                    <th className="text-left px-4 py-3">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p, i) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {p.customer?.company_name || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">
                        {p.order_id ? `ORD #${p.order_id}` : <span className="text-gray-400">Umumiy</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={PAYMENT_TYPE_COLORS[p.payment_type]}>
                          {PAYMENT_TYPE_LABELS[p.payment_type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.note || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={data.pages} total={data.total} size={20} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="To'lov qabul qilish" size="md">
        <PaymentForm onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}

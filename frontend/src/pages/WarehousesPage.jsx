import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { warehousesApi, stockApi, productsApi } from "../api";
import { formatDateTime } from "../utils";
import { Modal, EmptyState, LoadingSpinner, Badge, Pagination } from "../components/ui";

function WarehouseForm({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", location: "", manager: "" });

  const createMut = useMutation({
    mutationFn: (d) => warehousesApi.create(d),
    onSuccess: () => { qc.invalidateQueries(["warehouses"]); onClose(); toast.success("Ombor qo'shildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  return (
    <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="space-y-4">
      <div>
        <label className="form-label">Ombor nomi *</label>
        <input className="form-input" required value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Joylashuv</label>
        <input className="form-input" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Mas'ul shaxs</label>
        <input className="form-input" value={form.manager}
          onChange={e => setForm({ ...form, manager: e.target.value })} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" disabled={createMut.isPending} className="btn-primary">Saqlash</button>
      </div>
    </form>
  );
}

function StockForm({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ product_id: "", warehouse_id: "", movement_type: "kirim", quantity: 1, note: "" });
  const [productSearch, setProductSearch] = useState("");

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesApi.list().then(r => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ["products-stock-search", productSearch],
    queryFn: () => productsApi.list({ search: productSearch, size: 8 }).then(r => r.data),
    enabled: productSearch.length > 1,
  });

  const createMut = useMutation({
    mutationFn: (d) => stockApi.create(d),
    onSuccess: () => { qc.invalidateQueries(["stock"]); qc.invalidateQueries(["products"]); onClose(); toast.success("Harakat qo'shildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      createMut.mutate({ ...form, product_id: Number(form.product_id), warehouse_id: Number(form.warehouse_id), quantity: Number(form.quantity) });
    }} className="space-y-4">
      <div>
        <label className="form-label">Mahsulot *</label>
        <input className="form-input" placeholder="Qidirish..."
          value={productSearch} onChange={e => setProductSearch(e.target.value)} />
        {products?.items?.length > 0 && productSearch && !form.product_id && (
          <div className="border border-gray-200 rounded-lg mt-1 max-h-36 overflow-y-auto bg-white shadow-lg">
            {products.items.map(p => (
              <button key={p.id} type="button"
                onClick={() => { setForm({ ...form, product_id: p.id }); setProductSearch(p.name); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">Ombor: {p.stock_quantity} ta</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="form-label">Ombor *</label>
        <select className="form-input" required value={form.warehouse_id}
          onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
          <option value="">Tanlang</option>
          {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Tur *</label>
          <select className="form-input" value={form.movement_type}
            onChange={e => setForm({ ...form, movement_type: e.target.value })}>
            <option value="kirim">Kirim ↑</option>
            <option value="chiqim">Chiqim ↓</option>
          </select>
        </div>
        <div>
          <label className="form-label">Miqdor *</label>
          <input className="form-input" type="number" min="1" required value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="form-label">Izoh</label>
        <input className="form-input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor</button>
        <button type="submit" disabled={createMut.isPending} className="btn-primary">Saqlash</button>
      </div>
    </form>
  );
}

export default function WarehousesPage() {
  const [showWH, setShowWH] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [page, setPage] = useState(1);

  const { data: warehouses, isLoading: whLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesApi.list().then(r => r.data),
  });

  const { data: movements, isLoading: mvLoading } = useQuery({
    queryKey: ["stock", page],
    queryFn: () => stockApi.list({ page, size: 20 }).then(r => r.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Ombor boshqaruvi</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowStock(true)} className="btn-secondary">📦 Harakat qo'shish</button>
          <button onClick={() => setShowWH(true)} className="btn-primary">+ Yangi ombor</button>
        </div>
      </div>

      {/* Warehouses grid */}
      {whLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {warehouses?.map(w => (
            <div key={w.id} className="card p-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-3">🏭</div>
              <p className="text-sm font-semibold text-gray-800">{w.name}</p>
              {w.location && <p className="text-xs text-gray-400 mt-1 truncate">{w.location}</p>}
              {w.manager && <p className="text-xs text-gray-500 mt-1">{w.manager}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Stock movements */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800">Harakatlar tarixi</h3>
        </div>
        {mvLoading ? <LoadingSpinner /> : !movements?.length ? (
          <EmptyState icon="📋" title="Harakat yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Mahsulot</th>
                    <th className="text-left px-4 py-3">Ombor</th>
                    <th className="text-left px-4 py-3">Tur</th>
                    <th className="text-left px-4 py-3">Miqdor</th>
                    <th className="text-left px-4 py-3">Izoh</th>
                    <th className="text-left px-4 py-3">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(m => (
                    <tr key={m.id} className="table-row">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{m.product?.name || `#${m.product_id}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.warehouse?.name || `#${m.warehouse_id}`}</td>
                      <td className="px-4 py-3">
                        <Badge className={m.movement_type === "kirim" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {m.movement_type === "kirim" ? "↑ Kirim" : "↓ Chiqim"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{m.quantity} ta</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.note || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={Math.ceil((movements?.length || 0) / 20)} total={movements?.length || 0} size={20} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showWH} onClose={() => setShowWH(false)} title="Yangi ombor" size="sm">
        <WarehouseForm onClose={() => setShowWH(false)} />
      </Modal>
      <Modal isOpen={showStock} onClose={() => setShowStock(false)} title="Ombor harakati" size="md">
        <StockForm onClose={() => setShowStock(false)} />
      </Modal>
    </div>
  );
}

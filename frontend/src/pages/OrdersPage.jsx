import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ordersApi, customersApi, productsApi } from "../api";
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../utils";
import { Modal, Pagination, EmptyState, LoadingSpinner, Badge, ConfirmModal } from "../components/ui";

function OrderCreateForm({ onClose }) {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers-search", customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch, size: 10 }).then(r => r.data),
    enabled: customerSearch.length > 1,
  });

  const { data: products } = useQuery({
    queryKey: ["products-search", productSearch],
    queryFn: () => productsApi.list({ search: productSearch, size: 10 }).then(r => r.data),
    enabled: productSearch.length > 1,
  });

  const addItem = (product) => {
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      setItems(items.map(i => i.product_id === product.id
        ? { ...i, quantity: i.quantity + 1 }
        : i
      ));
    } else {
      setItems([...items, {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.sale_price,
        quantity: 1,
        max_stock: product.stock_quantity,
      }]);
    }
    setProductSearch("");
  };

  const removeItem = (productId) => setItems(items.filter(i => i.product_id !== productId));
  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    setItems(items.map(i => i.product_id === productId ? { ...i, quantity: qty } : i));
  };
  const updatePrice = (productId, price) => {
    setItems(items.map(i => i.product_id === productId ? { ...i, unit_price: Number(price) } : i));
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const createMut = useMutation({
    mutationFn: (d) => ordersApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries(["orders"]);
      qc.invalidateQueries(["dashboard"]);
      onClose();
      toast.success("Buyurtma yaratildi!");
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("Mijozni tanlang");
    if (items.length === 0) return toast.error("Kamida 1 ta mahsulot qo'shing");
    createMut.mutate({
      customer_id: Number(customerId),
      items: items.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price })),
      note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer select */}
      <div>
        <label className="form-label">Mijoz *</label>
        <input className="form-input" placeholder="Mijozni qidiring..."
          value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
        {customers?.items?.length > 0 && customerSearch && (
          <div className="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-lg z-10">
            {customers.items.map(c => (
              <button key={c.id} type="button"
                onClick={() => { setCustomerId(c.id); setCustomerSearch(c.company_name); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                <span className="font-medium">{c.company_name}</span>
                <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product add */}
      <div>
        <label className="form-label">Mahsulot qo'shish</label>
        <input className="form-input" placeholder="Mahsulotni qidiring..."
          value={productSearch} onChange={e => setProductSearch(e.target.value)} />
        {products?.items?.length > 0 && productSearch && (
          <div className="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-lg">
            {products.items.map(p => (
              <button key={p.id} type="button" onClick={() => addItem(p)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-400 ml-2 text-xs">{formatCurrency(p.sale_price)} · {p.stock_quantity} ta</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items table */}
      {items.length > 0 && (
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-3 py-2">Mahsulot</th>
                <th className="text-left px-3 py-2">Narx</th>
                <th className="text-left px-3 py-2">Soni</th>
                <th className="text-left px-3 py-2">Jami</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.product_id} className="border-t border-gray-50">
                  <td className="px-3 py-2 text-xs font-medium text-gray-700">{item.product_name}</td>
                  <td className="px-3 py-2">
                    <input type="number" value={item.unit_price}
                      onChange={e => updatePrice(item.product_id, e.target.value)}
                      className="w-28 form-input py-1 text-xs" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm">-</button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm">+</button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-gray-800">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => removeItem(item.product_id)}
                      className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-right text-gray-600">Jami:</td>
                <td colSpan={2} className="px-3 py-2 text-sm font-bold text-gray-900">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div>
        <label className="form-label">Izoh</label>
        <textarea className="form-input" rows={2} value={note}
          onChange={e => setNote(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Bekor qilish</button>
        <button type="submit" disabled={createMut.isPending} className="btn-primary">
          {createMut.isPending ? "Saqlanmoqda..." : `Buyurtma yaratish (${formatCurrency(total)})`}
        </button>
      </div>
    </form>
  );
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, statusFilter],
    queryFn: () => ordersApi.list({ page, size: 20, status: statusFilter || undefined }).then(r => r.data),
  });

  const cancelMut = useMutation({
    mutationFn: (id) => ordersApi.update(id, { status: "bekor_qilingan" }),
    onSuccess: () => { qc.invalidateQueries(["orders"]); setCancelId(null); toast.success("Bekor qilindi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => ordersApi.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries(["orders"]); toast.success("Status yangilandi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const statuses = ["yangi", "tasdiqlangan", "jonatilgan", "yetkazilgan", "bekor_qilingan"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Buyurtmalar</h1>
          <p className="text-xs text-gray-500">Jami {data?.total || 0} ta buyurtma</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <span>+</span> Yangi buyurtma
        </button>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <button onClick={() => { setStatusFilter(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            Barchasi
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : !data?.items?.length ? (
          <EmptyState icon="🛒" title="Buyurtmalar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Raqam</th>
                    <th className="text-left px-4 py-3">Mijoz</th>
                    <th className="text-left px-4 py-3">Summa</th>
                    <th className="text-left px-4 py-3">To'langan</th>
                    <th className="text-left px-4 py-3">Qarz</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Sana</th>
                    <th className="text-right px-4 py-3">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(o => (
                    <tr key={o.id} className="table-row">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600">
                        <button onClick={() => setViewOrder(o)} className="hover:underline">{o.order_number}</button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.customer?.company_name || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(o.total_amount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(o.paid_amount)}</td>
                      <td className="px-4 py-3">
                        {o.debt_amount > 0
                          ? <span className="text-sm text-red-600 font-medium">{formatCurrency(o.debt_amount)}</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.status}
                          onChange={e => updateStatusMut.mutate({ id: o.id, status: e.target.value })}
                          className={`text-xs rounded-full px-2 py-1 font-medium border-0 cursor-pointer ${ORDER_STATUS_COLORS[o.status]}`}>
                          {statuses.map(s => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewOrder(o)} className="text-xs text-blue-600 hover:underline">Ko'rish</button>
                          {o.status !== "bekor_qilingan" && (
                            <button onClick={() => setCancelId(o.id)} className="text-xs text-red-500 hover:underline">Bekor</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={data.pages} total={data.total} size={20} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yangi buyurtma" size="xl">
        <OrderCreateForm onClose={() => setShowCreate(false)} />
      </Modal>

      {/* Order detail modal */}
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Buyurtma: ${viewOrder?.order_number}`} size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Mijoz:</span> <span className="font-medium">{viewOrder.customer?.company_name}</span></div>
              <div><span className="text-gray-500">Status:</span> <Badge className={ORDER_STATUS_COLORS[viewOrder.status]}>{ORDER_STATUS_LABELS[viewOrder.status]}</Badge></div>
              <div><span className="text-gray-500">Jami summa:</span> <span className="font-bold text-gray-900">{formatCurrency(viewOrder.total_amount)}</span></div>
              <div><span className="text-gray-500">To'langan:</span> <span className="font-medium text-green-600">{formatCurrency(viewOrder.paid_amount)}</span></div>
              <div><span className="text-gray-500">Qarz:</span> <span className="font-medium text-red-600">{formatCurrency(viewOrder.debt_amount)}</span></div>
              <div><span className="text-gray-500">Sana:</span> <span>{formatDateTime(viewOrder.created_at)}</span></div>
            </div>
            {viewOrder.note && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                <span className="font-medium">Izoh:</span> {viewOrder.note}
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Mahsulotlar:</h4>
              <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="text-left px-3 py-2">Mahsulot</th>
                    <th className="text-right px-3 py-2">Narx</th>
                    <th className="text-right px-3 py-2">Soni</th>
                    <th className="text-right px-3 py-2">Jami</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.items?.map(item => (
                    <tr key={item.id} className="border-t border-gray-50">
                      <td className="px-3 py-2 text-gray-700">{item.product?.name || `Mahsulot #${item.product_id}`}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-medium">{item.quantity} ta</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={!!cancelId} onClose={() => setCancelId(null)}
        onConfirm={() => cancelMut.mutate(cancelId)}
        title="Buyurtmani bekor qilish" message="Bu buyurtmani bekor qilishni tasdiqlaysizmi?" />
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productsApi, categoriesApi } from "../api";
import { formatCurrency } from "../utils";
import {
  Modal, Pagination, SearchInput, EmptyState,
  LoadingSpinner, Badge, ConfirmModal
} from "../components/ui";

const emptyForm = {
  name: "", sku: "", barcode: "", category_id: "", purchase_price: "",
  sale_price: "", stock_quantity: 0, min_stock: 10, is_active: true
};

function ProductForm({ form, setForm, onSubmit, isLoading, categories, productId, onImageUpload }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="form-label">Mahsulot nomi *</label>
          <input className="form-input" required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="form-label">SKU *</label>
          <input className="form-input" required value={form.sku}
            onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="ABC12345" />
        </div>
        <div>
          <label className="form-label">Barcode</label>
          <input className="form-input" value={form.barcode}
            onChange={e => setForm({ ...form, barcode: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Kategoriya</label>
          <select className="form-input" value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Tanlang</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Holat</label>
          <select className="form-input" value={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.value === "true" })}>
            <option value="true">Faol</option>
            <option value="false">Nofaol</option>
          </select>
        </div>
        <div>
          <label className="form-label">Xarid narxi (so'm) *</label>
          <input className="form-input" type="number" required value={form.purchase_price}
            onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Sotuv narxi (so'm) *</label>
          <input className="form-input" type="number" required value={form.sale_price}
            onChange={e => setForm({ ...form, sale_price: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Ombordagi soni</label>
          <input className="form-input" type="number" value={form.stock_quantity}
            onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
        </div>
        <div>
          <label className="form-label">Minimal qoldiq</label>
          <input className="form-input" type="number" value={form.min_stock}
            onChange={e => setForm({ ...form, min_stock: Number(e.target.value) })} />
        </div>

        {productId && (
          <div className="col-span-2">
            <label className="form-label">Mahsulot rasmi</label>
            <input type="file" accept="image/*" className="form-input py-1.5"
              onChange={e => e.target.files[0] && onImageUpload(e.target.files[0])} />
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, lowStock],
    queryFn: () => productsApi.list({ page, size: 20, search, low_stock: lowStock || undefined }).then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d) => productsApi.create(d),
    onSuccess: () => { qc.invalidateQueries(["products"]); setShowModal(false); toast.success("Mahsulot qo'shildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["products"]); setShowModal(false); setEditItem(null); toast.success("Yangilandi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(["products"]); setDeleteId(null); toast.success("O'chirildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const uploadImageMut = useMutation({
    mutationFn: ({ id, file }) => productsApi.uploadImage(id, file),
    onSuccess: () => { qc.invalidateQueries(["products"]); toast.success("Rasm yuklandi"); },
    onError: () => toast.error("Rasm yuklashda xato"),
  });

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, sku: item.sku, barcode: item.barcode || "",
      category_id: item.category_id || "", purchase_price: item.purchase_price,
      sale_price: item.sale_price, stock_quantity: item.stock_quantity,
      min_stock: item.min_stock, is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      purchase_price: Number(form.purchase_price),
      sale_price: Number(form.sale_price),
    };
    if (editItem) updateMut.mutate({ id: editItem.id, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-xs text-gray-500">Jami {data?.total || 0} ta mahsulot</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <span>+</span> Yangi mahsulot
        </button>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Nomi, SKU..." />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={lowStock} onChange={e => { setLowStock(e.target.checked); setPage(1); }}
              className="rounded border-gray-300" />
            <span className="text-xs">Faqat kam qolganlar</span>
          </label>
        </div>

        {isLoading ? <LoadingSpinner /> : !data?.items?.length ? (
          <EmptyState icon="📦" title="Mahsulotlar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Mahsulot</th>
                    <th className="text-left px-4 py-3">SKU</th>
                    <th className="text-left px-4 py-3">Kategoriya</th>
                    <th className="text-left px-4 py-3">Xarid narxi</th>
                    <th className="text-left px-4 py-3">Sotuv narxi</th>
                    <th className="text-left px-4 py-3">Ombor</th>
                    <th className="text-left px-4 py-3">Holat</th>
                    <th className="text-right px-4 py-3">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p, i) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">📦</div>
                          )}
                          <span className="text-sm font-medium text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.purchase_price)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(p.sale_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${p.stock_quantity <= p.min_stock ? "text-red-600" : "text-green-600"}`}>
                          {p.stock_quantity} ta
                        </span>
                        {p.stock_quantity <= p.min_stock && (
                          <span className="ml-1 text-xs text-red-400">⚠️</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                          {p.is_active ? "Faol" : "Nofaol"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Tahrir</button>
                          <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-500 hover:underline">O'chir</button>
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} size="lg">
        <ProductForm
          form={form} setForm={setForm} onSubmit={handleSubmit}
          isLoading={createMut.isPending || updateMut.isPending}
          categories={categories}
          productId={editItem?.id}
          onImageUpload={(file) => uploadImageMut.mutate({ id: editItem.id, file })}
        />
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        title="Mahsulotni o'chirish" message="Bu mahsulotni o'chirishni tasdiqlaysizmi?" />
    </div>
  );
}

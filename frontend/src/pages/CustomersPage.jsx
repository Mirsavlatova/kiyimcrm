import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { customersApi } from "../api";
import { formatCurrency, formatDate, VIP_LABELS, VIP_COLORS } from "../utils";
import {
  Modal, Pagination, SearchInput, EmptyState,
  LoadingSpinner, Badge, ConfirmModal
} from "../components/ui";

const REGIONS = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan",
  "Qashqadaryo", "Surxondaryo", "Xorazm", "Navoiy", "Jizzax", "Sirdaryo", "Qoraqalpog'iston"];

const emptyForm = {
  company_name: "", phone: "", email: "", stir: "", region: "", district: "",
  address: "", contact_person: "", status: "active", vip_level: 0
};

function CustomerForm({ form, setForm, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="form-label">Kompaniya nomi *</label>
          <input className="form-input" required value={form.company_name}
            onChange={e => setForm({ ...form, company_name: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Telefon *</label>
          <input className="form-input" required value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="form-label">STIR</label>
          <input className="form-input" value={form.stir}
            onChange={e => setForm({ ...form, stir: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Mas'ul shaxs</label>
          <input className="form-input" value={form.contact_person}
            onChange={e => setForm({ ...form, contact_person: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Viloyat</label>
          <select className="form-input" value={form.region}
            onChange={e => setForm({ ...form, region: e.target.value })}>
            <option value="">Tanlang</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Tuman</label>
          <input className="form-input" value={form.district}
            onChange={e => setForm({ ...form, district: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="form-label">Manzil</label>
          <textarea className="form-input" rows={2} value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-input" value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
        <div>
          <label className="form-label">VIP daraja</label>
          <select className="form-input" value={form.vip_level}
            onChange={e => setForm({ ...form, vip_level: Number(e.target.value) })}>
            {VIP_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}

export default function CustomersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => customersApi.list({ page, size: 20, search }).then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d) => customersApi.create(d),
    onSuccess: () => { qc.invalidateQueries(["customers"]); setShowModal(false); toast.success("Mijoz qo'shildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => customersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["customers"]); setShowModal(false); setEditItem(null); toast.success("Yangilandi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => customersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(["customers"]); setDeleteId(null); toast.success("O'chirildi"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Xato"),
  });

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...emptyForm, ...item }); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editItem) updateMut.mutate({ id: editItem.id, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Mijozlar</h1>
          <p className="text-xs text-gray-500">Jami {data?.total || 0} ta mijoz</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <span>+</span> Yangi mijoz
        </button>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Kompaniya, telefon..." />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !data?.items?.length ? (
          <EmptyState icon="👥" title="Mijozlar yo'q" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Kompaniya</th>
                    <th className="text-left px-4 py-3">Telefon</th>
                    <th className="text-left px-4 py-3">Viloyat</th>
                    <th className="text-left px-4 py-3">Jami xarid</th>
                    <th className="text-left px-4 py-3">Qarz</th>
                    <th className="text-left px-4 py-3">VIP</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c, i) => (
                    <tr key={c.id} className="table-row">
                      <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{c.company_name}</p>
                        {c.contact_person && <p className="text-xs text-gray-400">{c.contact_person}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.region || "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(c.total_purchases)}</td>
                      <td className="px-4 py-3">
                        {c.debt > 0 ? (
                          <span className="text-sm font-medium text-red-600">{formatCurrency(c.debt)}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={VIP_COLORS[c.vip_level] || VIP_COLORS[0]}>
                          {VIP_LABELS[c.vip_level] || "Oddiy"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {c.status === "active" ? "Faol" : "Nofaol"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">Tahrir</button>
                          <button onClick={() => setDeleteId(c.id)} className="text-xs text-red-500 hover:underline">O'chir</button>
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
        title={editItem ? "Mijozni tahrirlash" : "Yangi mijoz"} size="lg">
        <CustomerForm form={form} setForm={setForm} onSubmit={handleSubmit}
          isLoading={createMut.isPending || updateMut.isPending} />
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        title="Mijozni o'chirish"
        message="Bu mijozni o'chirishni tasdiqlaysizmi?" />
    </div>
  );
}

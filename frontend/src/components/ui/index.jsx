// Shared UI components

export function Skeleton({ className = "h-4 w-full" }) {
  return <div className={`skeleton ${className}`} />;
}

export function Badge({ children, className = "" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon || "📭"}</div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title || "Ma'lumot yo'q"}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Pagination({ page, pages, total, size, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">
        Jami {total} ta, sahifa {page}/{pages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ← Oldingi
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-xs rounded-lg transition-colors ${p === page ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Keyingi →
        </button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon, color = "blue", sub }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Qidirish..." }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-9 w-64"
      />
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Tasdiqlash"} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message || "Bu amalni bajarishni tasdiqlaysizmi?"}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Bekor qilish</button>
        <button onClick={onConfirm} className="btn-danger">Tasdiqlash</button>
      </div>
    </Modal>
  );
}

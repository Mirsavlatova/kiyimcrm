export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("uz-UZ", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
};

export const ORDER_STATUS_LABELS = {
  yangi: "Yangi",
  tasdiqlangan: "Tasdiqlangan",
  jonatilgan: "Jo'natilgan",
  yetkazilgan: "Yetkazilgan",
  bekor_qilingan: "Bekor qilingan",
};

export const ORDER_STATUS_COLORS = {
  yangi: "bg-blue-100 text-blue-700",
  tasdiqlangan: "bg-yellow-100 text-yellow-700",
  jonatilgan: "bg-purple-100 text-purple-700",
  yetkazilgan: "bg-green-100 text-green-700",
  bekor_qilingan: "bg-red-100 text-red-700",
};

export const PAYMENT_TYPE_LABELS = {
  naqd: "Naqd",
  click: "Click",
  payme: "Payme",
  bank: "Bank o'tkazmasi",
};

export const PAYMENT_TYPE_COLORS = {
  naqd: "bg-green-100 text-green-700",
  click: "bg-blue-100 text-blue-700",
  payme: "bg-teal-100 text-teal-700",
  bank: "bg-gray-100 text-gray-700",
};

export const VIP_LABELS = ["Oddiy", "Bronze", "Silver", "Gold"];
export const VIP_COLORS = [
  "bg-gray-100 text-gray-600",
  "bg-orange-100 text-orange-700",
  "bg-slate-100 text-slate-600",
  "bg-yellow-100 text-yellow-700",
];

export const ROLE_LABELS = {
  direktor: "Direktor",
  sotuv_menejeri: "Sotuv Menejeri",
  ombor_mudiri: "Ombor Mudiri",
  buxgalter: "Buxgalter",
};

export const ROLE_COLORS = {
  direktor: "bg-red-100 text-red-700",
  sotuv_menejeri: "bg-blue-100 text-blue-700",
  ombor_mudiri: "bg-green-100 text-green-700",
  buxgalter: "bg-yellow-100 text-yellow-700",
};
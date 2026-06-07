// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from "../../store/authStore";
// import { Badge } from "../ui";

// const NAV_ITEMS = [
//   { to: "/", label: "Dashboard", icon: "📊", roles: ["direktor", "sotuv_menejeri", "ombor_mudiri", "buxgalter"] },
//   { to: "/customers", label: "Mijozlar", icon: "👥", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
//   { to: "/products", label: "Mahsulotlar", icon: "📦", roles: ["direktor", "sotuv_menejeri", "ombor_mudiri"] },
//   { to: "/orders", label: "Buyurtmalar", icon: "🛒", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
//   { to: "/payments", label: "To'lovlar", icon: "💳", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
//   { to: "/warehouses", label: "Ombor", icon: "🏭", roles: ["direktor", "ombor_mudiri"] },
//   { to: "/reports", label: "Hisobotlar", icon: "📈", roles: ["direktor", "buxgalter"] },
//   { to: "/users", label: "Foydalanuvchilar", icon: "👤", roles: ["direktor"] },
//   { to: "/audit", label: "Audit Log", icon: "🔍", roles: ["direktor"] },
// ];

// export default function Sidebar() {
//   const { user, logout } = useAuthStore();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const visibleItems = NAV_ITEMS.filter(
//     (item) => !user || item.roles.includes(user.role)
//   );

//   return (
//     <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
//       {/* Logo */}
//       <div className="px-5 py-5 border-b border-gray-100">
//         <div className="flex items-center gap-2.5">
//           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-sm">K</span>
//           </div>
//           <div>
//             <h1 className="font-bold text-gray-900 text-sm">KiyimCRM</h1>
//             <p className="text-xs text-gray-400">Savdo tizimi</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
//         {visibleItems.map((item) => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             end={item.to === "/"}
//             className={({ isActive }) =>
//               `sidebar-link ${isActive ? "active" : ""}`
//             }
//           >
//             <span className="text-base">{item.icon}</span>
//             <span>{item.label}</span>
//           </NavLink>
//         ))}
//       </nav>

//       {/* User */}
//       {user && (
//         <div className="px-3 py-4 border-t border-gray-100">
//           <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-gray-50 mb-2">
//             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//               <span className="text-blue-700 font-semibold text-sm">
//                 {user.full_name?.[0] || user.username?.[0]}
//               </span>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-gray-900 truncate">{user.full_name}</p>
//               <Badge className={`mt-0.5 text-xs ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-600"}`}>
//                 {ROLE_LABELS[user.role] || user.role}
//               </Badge>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="w-full sidebar-link text-red-500 hover:bg-red-50 hover:text-red-600"
//           >
//             <span>🚪</span>
//             <span>Chiqish</span>
//           </button>
//         </div>
//       )}
//     </aside>
//   );
// }


// return (
//   <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col h-screen sticky top-0 shadow-xl">
    
//     {/* Logo */}
//     <div className="px-5 py-5 border-b border-slate-800">
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//           <span className="text-white font-bold">K</span>
//         </div>

//         <div>
//           <h1 className="font-bold text-white">KiyimCRM</h1>
//           <p className="text-xs text-slate-400">Savdo tizimi</p>
//         </div>
//       </div>
//     </div>

//     {/* Navigation */}
//     <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
//       {visibleItems.map((item) => (
//         <NavLink
//           key={item.to}
//           to={item.to}
//           end={item.to === "/"}
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//               isActive
//                 ? "bg-blue-600 text-white shadow-md"
//                 : "text-slate-300 hover:bg-slate-800 hover:text-white"
//             }`
//           }
//         >
//           <span className="text-lg">{item.icon}</span>
//           <span className="text-sm font-medium">{item.label}</span>
//         </NavLink>
//       ))}
//     </nav>

//     {/* User */}
//     {user && (
//       <div className="px-3 py-4 border-t border-slate-800">
//         <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-slate-800 mb-3">
//           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
//             <span className="text-white font-semibold">
//               {user.full_name?.[0] || user.username?.[0]}
//             </span>
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-semibold text-white truncate">
//               {user.full_name}
//             </p>

//             <Badge
//               className={`mt-1 text-xs ${
//                 ROLE_COLORS[user.role] || "bg-slate-700 text-slate-300"
//               }`}
//             >
//               {ROLE_LABELS[user.role] || user.role}
//             </Badge>
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
//         >
//           <span>🚪</span>
//           <span>Chiqish</span>
//         </button>
//       </div>
//     )}
//   </aside>
// );


import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from "../../store/authStore";
import { Badge } from "../ui";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", roles: ["direktor", "sotuv_menejeri", "ombor_mudiri", "buxgalter"] },
  { to: "/customers", label: "Mijozlar", icon: "👥", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
  { to: "/products", label: "Mahsulotlar", icon: "📦", roles: ["direktor", "sotuv_menejeri", "ombor_mudiri"] },
  { to: "/orders", label: "Buyurtmalar", icon: "🛒", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
  { to: "/payments", label: "To'lovlar", icon: "💳", roles: ["direktor", "sotuv_menejeri", "buxgalter"] },
  { to: "/warehouses", label: "Ombor", icon: "🏭", roles: ["direktor", "ombor_mudiri"] },
  { to: "/reports", label: "Hisobotlar", icon: "📈", roles: ["direktor", "buxgalter"] },
  { to: "/users", label: "Foydalanuvchilar", icon: "👤", roles: ["direktor"] },
  { to: "/audit", label: "Audit Log", icon: "🔍", roles: ["direktor"] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col h-screen sticky top-0 shadow-xl">
      
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">K</span>
          </div>

          <div>
            <h1 className="font-bold text-white">KiyimCRM</h1>
            <p className="text-xs text-slate-400">Savdo tizimi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-slate-800 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {user.full_name?.[0] || user.username?.[0]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.full_name}
              </p>

              <Badge
                className={`mt-1 text-xs ${
                  ROLE_COLORS[user.role] || "bg-slate-700 text-slate-300"
                }`}
              >
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <span>🚪</span>
            <span>Chiqish</span>
          </button>
        </div>
      )}
    </aside>
  );
}
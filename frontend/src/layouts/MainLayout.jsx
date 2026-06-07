// import { Outlet, useLocation } from "react-router-dom";
// // import Sidebar from "./Sidebar";
// // import Navbar from "./Navbar";
// import Sidebar from "../components/layout/Sidebar.jsx";
// import Navbar from "../components/layout/Navbar.jsx";

// const PAGE_TITLES = {
//   "/": "Dashboard",
//   "/customers": "Mijozlar",
//   "/products": "Mahsulotlar",
//   "/orders": "Buyurtmalar",
//   "/payments": "To'lovlar",
//   "/warehouses": "Ombor",
//   "/reports": "Hisobotlar",
//   "/users": "Foydalanuvchilar",
//   "/audit": "Audit Log",
// };

// export default function MainLayout() {
//   const location = useLocation();
//   const title = PAGE_TITLES[location.pathname] || "KiyimCRM";

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <Navbar title={title} />
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "../components/layout/Sidebar.jsx";
// import Navbar from "../components/layout/Navbar.jsx";

// const PAGE_TITLES = {
//   "/": "Dashboard",
//   "/customers": "Mijozlar",
//   "/products": "Mahsulotlar",
//   "/orders": "Buyurtmalar",
//   "/payments": "To'lovlar",
//   "/warehouses": "Ombor",
//   "/reports": "Hisobotlar",
//   "/users": "Foydalanuvchilar",
//   "/audit": "Audit Log",
// };

// export default function MainLayout() {
//   const location = useLocation();
//   const title = PAGE_TITLES[location.pathname] || "KiyimCRM";

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />

//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <Navbar title={title} />

//         <main className="flex-1 overflow-y-auto p-6 bg-[#eef2f7]">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );

import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/customers": "Mijozlar",
  "/products": "Mahsulotlar",
  "/orders": "Buyurtmalar",
  "/payments": "To'lovlar",
  "/warehouses": "Ombor",
  "/reports": "Hisobotlar",
  "/users": "Foydalanuvchilar",
  "/audit": "Audit Log",
};

export default function MainLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "KiyimCRM";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={title} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
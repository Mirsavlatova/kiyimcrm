import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import WarehousesPage from "./pages/WarehousesPage";
import { ReportsPage, UsersPage, AuditPage } from "./pages/OtherPages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800">Ruxsat yo'q</h2>
          <p className="text-gray-500 mt-2">Bu sahifani ko'rish uchun ruxsat yo'q</p>
        </div>
      </div>
    );
  }
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

          <Route path="/" element={
            <ProtectedRoute><MainLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="warehouses" element={
              <ProtectedRoute roles={["direktor", "ombor_mudiri"]}>
                <WarehousesPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute roles={["direktor", "buxgalter"]}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute roles={["direktor"]}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="audit" element={
              <ProtectedRoute roles={["direktor"]}>
                <AuditPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "13px",
            borderRadius: "10px",
            padding: "12px 16px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#f8fafc" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
        }}
      />
    </QueryClientProvider>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../api";
import { formatDateTime } from "../../utils";

export default function Navbar({ title }) {
  const [showNotif, setShowNotif] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries(["notifications"]),
  });

  const notifIcons = {
    new_order: "🛒",
    low_stock: "⚠️",
    debt_customer: "💰",
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-sm text-gray-800">Bildirishnomalar</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Barchasini o'qi
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">Bildirishnoma yo'q</div>
                  ) : (
                    notifications.slice(0, 20).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-blue-50/50" : ""}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-lg mt-0.5">{notifIcons[n.notification_type] || "📌"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { authApi } from "../api";
// import { useAuthStore } from "../store/authStore";

// export default function LoginPage() {
//   const [form, setForm] = useState({ username: "", password: "" });
//   const { login } = useAuthStore();
//   const navigate = useNavigate();

//   const mutation = useMutation({
//     mutationFn: () => authApi.login(form),
//     onSuccess: (res) => {
//       login(res.data.user, res.data.access_token);
//       toast.success(`Xush kelibsiz, ${res.data.user.full_name}!`);
//       navigate("/");
//     },
//     onError: (err) => {
//       toast.error(err.response?.data?.detail || "Login xatosi");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.username || !form.password) return toast.error("Login va parolni kiriting");
//     mutation.mutate();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-sm">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
//             <span className="text-white font-bold text-2xl">K</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">KiyimCRM</h1>
//           <p className="text-sm text-gray-500 mt-1">Kiyim-Kechak Savdo Tizimi</p>
//         </div>

//         {/* Form */}
//         <div className="card p-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="form-label">Foydalanuvchi nomi</label>
//               <input
//                 type="text"
//                 value={form.username}
//                 onChange={(e) => setForm({ ...form, username: e.target.value })}
//                 placeholder="direktor"
//                 className="form-input"
//                 autoFocus
//               />
//             </div>
//             <div>
//               <label className="form-label">Parol</label>
//               <input
//                 type="password"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 placeholder="••••••••"
//                 className="form-input"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={mutation.isPending}
//               className="btn-primary w-full justify-center py-2.5"
//             >
//               {mutation.isPending ? (
//                 <span className="flex items-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Kirish...
//                 </span>
//               ) : (
//                 "Kirish"
//               )}
//             </button>
//           </form>
//         </div>

//         {/* Demo accounts */}
//         <div className="mt-4 card p-4">
//           <p className="text-xs font-medium text-gray-500 mb-3">Demo hisoblar:</p>
//           <div className="grid grid-cols-2 gap-2">
//             {[
//               { u: "direktor", p: "direktor123", label: "Direktor" },
//               { u: "sotuv", p: "sotuv123", label: "Sotuv" },
//               { u: "ombor", p: "ombor123", label: "Ombor" },
//               { u: "buxgalter", p: "buxgalter123", label: "Buxgalter" },
//             ].map(({ u, p, label }) => (
//               <button
//                 key={u}
//                 onClick={() => setForm({ username: u, password: p })}
//                 className="text-left px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
//               >
//                 <p className="text-xs font-medium text-gray-700">{label}</p>
//                 <p className="text-xs text-gray-400">{u}</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "../api";
import { useAuthStore } from "../store/authStore";

// Floating Stat Card
function StatCard({ icon, value, label, delay }) {
  return (
    <div
      className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
      style={{
        animation: `floatCard 4s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-white font-bold text-base leading-tight">{value}</div>
        <div className="text-blue-200 text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}

// Shield/Lock icon SVG
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block mr-1.5 opacity-70">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="currentColor" opacity="0.3"/>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const mutation = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: (res) => {
      login(res.data.user, res.data.access_token);
      toast.success(`Xush kelibsiz, ${res.data.user.full_name}!`);
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Login xatosi");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error("Login va parolni kiriting");
    mutation.mutate();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #0f172a;
        }

        /* ─── LEFT HERO ─── */
        .hero-side {
          position: relative;
          flex: 1.1;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 1024px) { .hero-side { display: flex; flex-direction: column; } }

        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(160deg, rgba(15,23,42,0.72) 0%, rgba(37,99,235,0.55) 60%, rgba(99,102,241,0.45) 100%),
            url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80&fit=crop') center/cover no-repeat;
        }

        .hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        .hero-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: 48px 52px;
        }

        .brand-badge {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 8px 18px 8px 8px;
          width: fit-content;
        }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 15px; color: #fff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.5);
        }
        .brand-name { color: #fff; font-weight: 700; font-size: 14px; letter-spacing: 0.02em; }

        .hero-headline {
          flex: 1;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 40px 0;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.25);
          border: 1px solid rgba(99,102,241,0.4);
          border-radius: 100px;
          padding: 5px 14px;
          color: #a5b4fc;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          width: fit-content;
          margin-bottom: 24px;
        }
        .hero-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #6366f1; display: inline-block; }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 3.2vw, 46px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
        }
        .hero-title span { color: #93c5fd; }

        .hero-sub {
          font-size: 15px; font-weight: 400;
          color: rgba(203,213,225,0.85);
          line-height: 1.65;
          max-width: 380px;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes subtleShift {
          0%, 100% { transform: scale(1) translate(0,0); }
          33%  { transform: scale(1.015) translate(-8px, 6px); }
          66%  { transform: scale(1.01)  translate(6px, -5px); }
        }

        .hero-bg { animation: subtleShift 18s ease-in-out infinite; }

        /* ─── RIGHT AUTH ─── */
        .auth-side {
          flex: 0 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: #0f172a;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .auth-side {
            width: 480px;
            background: linear-gradient(160deg, #0f172a 0%, #111827 100%);
          }
        }

        /* Decorative glow blobs */
        .glow-blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .glow-blob-1 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          top: -80px; right: -60px;
        }
        .glow-blob-2 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
          bottom: -60px; left: -40px;
        }

        .auth-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 400px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 24px 64px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.08);
          opacity: 0;
          animation: fadeSlideUp 0.7s ease forwards;
          animation-delay: 0.15s;
        }

        .logo-wrap {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, #1d4ed8, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: #fff;
          box-shadow: 0 8px 24px rgba(37,99,235,0.45), 0 2px 8px rgba(0,0,0,0.3);
          margin-bottom: 14px;
        }
        .logo-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .logo-subtitle {
          font-size: 12px; font-weight: 500;
          color: #64748b;
          margin: 4px 0 0;
          letter-spacing: 0.03em;
        }

        .divider-line {
          border: none; border-top: 1px solid rgba(255,255,255,0.07);
          margin: 0 0 28px;
        }

        .welcome-text {
          font-size: 22px; font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .welcome-sub {
          font-size: 13px; font-weight: 400;
          color: #64748b;
          margin: 0 0 28px;
        }

        /* Form fields */
        .field-group { margin-bottom: 16px; }
        .field-label {
          display: block;
          font-size: 12px; font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.04em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .field-wrapper { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #475569; pointer-events: none;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          color: #f1f5f9;
          font-size: 14px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-text-fill-color: #f1f5f9;
        }
        .field-input::placeholder { color: #475569; -webkit-text-fill-color: #475569; }
        .field-input:focus {
          border-color: #2563eb;
          background: rgba(37,99,235,0.08);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18), 0 1px 4px rgba(0,0,0,0.2);
        }
        .field-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #1a2540 inset;
          -webkit-text-fill-color: #f1f5f9 !important;
        }
        .toggle-pw {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 4px;
          transition: color 0.15s;
        }
        .toggle-pw:hover { color: #94a3b8; }

        /* Remember + Forgot */
        .meta-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .remember-label {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer;
          font-size: 13px; font-weight: 500; color: #94a3b8;
        }
        .remember-cb {
          width: 16px; height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }
        .forgot-link {
          font-size: 13px; font-weight: 600;
          color: #3b82f6;
          background: none; border: none;
          cursor: pointer; padding: 0;
          transition: color 0.15s;
          text-decoration: none;
        }
        .forgot-link:hover { color: #60a5fa; }

        /* Submit button */
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
          border: none; border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          box-shadow: 0 6px 24px rgba(37,99,235,0.4), 0 1px 4px rgba(0,0,0,0.2);
        }
        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.15s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(37,99,235,0.5), 0 2px 8px rgba(0,0,0,0.25);
          filter: brightness(1.06);
        }
        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          display: inline-block;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .secure-badge {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 16px;
          font-size: 11.5px; font-weight: 500;
          color: #475569;
        }
        .secure-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.5);
          flex-shrink: 0;
        }

        .auth-footer {
          position: relative; z-index: 1;
          margin-top: 28px;
          text-align: center;
          font-size: 11px; font-weight: 500;
          color: #334155;
        }

        /* Mobile brand header */
        .mobile-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
          z-index: 1; position: relative;
        }
        @media (min-width: 1024px) { .mobile-brand { display: none; } }
        .mobile-brand-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #1d4ed8, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 800; color: #fff;
        }
        .mobile-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 800; color: #f1f5f9;
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT: Hero ── */}
        <div className="hero-side">
          <div className="hero-bg" />
          <div className="hero-noise" />

          <div className="hero-content">
            {/* Top brand */}
            <div className="brand-badge">
              <div className="brand-icon">K</div>
              <span className="brand-name">KiyimCRM</span>
            </div>

            {/* Center headline */}
            <div className="hero-headline">
              <div className="hero-tag">Ulgurji Kiyim Savdosi</div>
              <h1 className="hero-title">
                Zamonaviy Savdo<br />
                <span>Boshqaruv</span><br />
                Tizimi
              </h1>
              <p className="hero-sub">
                KiyimCRM — Ulgurji Kiyim Savdosi uchun yagona, aqlli va zamonaviy boshqaruv platformasi. Mijozlar, zaxira va buyurtmalarni real vaqtda boshqaring.
              </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <StatCard icon="👥" value="1,000+" label="Mijozlar" delay="0s" />
              <StatCard icon="👗" value="500+" label="Mahsulotlar" delay="0.7s" />
              <StatCard icon="📦" value="300+" label="Buyurtmalar" delay="1.4s" />
              <StatCard icon="📊" value="Real-time" label="Savdo Monitoring" delay="2.1s" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Auth ── */}
        <div className="auth-side">
          <div className="glow-blob glow-blob-1" />
          <div className="glow-blob glow-blob-2" />

          {/* Mobile-only brand */}
          <div className="mobile-brand">
            <div className="mobile-brand-icon">K</div>
            <span className="mobile-brand-name">KiyimCRM</span>
          </div>

          <div className="auth-card">
            {/* Logo */}
            <div className="logo-wrap">
              <div className="logo-icon">K</div>
              <h2 className="logo-title">KiyimCRM</h2>
              <p className="logo-subtitle">Kiyim-Kechak Savdo Tizimi</p>
            </div>

            <hr className="divider-line" />

            <h3 className="welcome-text">Xush kelibsiz</h3>
            <p className="welcome-sub">Hisobingizga kiring</p>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="field-group">
                <label className="field-label">Foydalanuvchi nomi</label>
                <div className="field-wrapper">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Foydalanuvchi nomini kiriting"
                    className="field-input"
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Parol</label>
                <div className="field-wrapper">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Parolingizni kiriting"
                    className="field-input"
                    autoComplete="current-password"
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="meta-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="remember-cb"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Eslab qol
                </label>
                <button type="button" className="forgot-link">
                  Parolni unutdingizmi?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <span className="spinner" />
                    Kirish...
                  </>
                ) : (
                  "Tizimga kirish"
                )}
              </button>
            </form>

            {/* Secure badge */}
            <div className="secure-badge">
              <span className="secure-dot" />
              <ShieldIcon />
              256-bit SSL shifrlash bilan himoyalangan
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            © 2026 KiyimCRM. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
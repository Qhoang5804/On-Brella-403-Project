import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const nav = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/users", label: "Users", icon: "group" },
  { to: "/admin/reports", label: "Reports", icon: "description" },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const isActive = (to) =>
    location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

  const headerTitle =
    location.pathname === "/admin/users"
      ? "User Directory"
      : location.pathname === "/admin/reports"
        ? "Issue Reports"
        : "Admin Overview";

  return (
    <div className="min-h-screen min-h-dvh font-display bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      {/* Left sidebar */}
      <div className="fixed top-0 left-0 h-full w-16 bg-background-dark flex flex-col items-center py-8 z-50 border-r border-slate-800">
        <div className="mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic text-lg">
            O
          </div>
        </div>
        <nav className="flex flex-col gap-6 text-slate-400">
          {nav.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive(to) ? "text-primary" : "hover:text-white"
              }`}
              title={label}
            >
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Back to app"
          >
            <span className="material-symbols-outlined text-2xl">exit_to_app</span>
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="ml-16">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                UW Campus Management
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {headerTitle}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center"
              aria-label="Profile"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
              )}
            </button>
          </div>
        </header>

        <main className="px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

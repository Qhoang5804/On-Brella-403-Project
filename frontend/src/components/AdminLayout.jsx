import { Link, Outlet, useLocation } from "react-router-dom";

const nav = [
  { to: "/admin", label: "Dash", icon: "grid_view" },
  { to: "/admin/inventory", label: "Inv", icon: "inventory_2" },
  { to: "/admin/activity", label: "Activity", icon: "history" },
  { to: "/admin/reports", label: "Alerts", icon: "notifications_active" },
];

const headerByPath = {
  "/admin": { subtitle: "Overview", title: "Campus Dashboard" },
  "/admin/inventory": { subtitle: "Stations", title: "Inventory" },
  "/admin/activity": { subtitle: "UW Campus Monitoring", title: "Admin Activity Feed" },
  "/admin/reports": { subtitle: "Maintenance & Alerts", title: "Active Issues" },
};

function getHeader(pathname) {
  if (headerByPath[pathname]) return headerByPath[pathname];
  if (pathname.startsWith("/admin/reports")) return headerByPath["/admin/reports"];
  return { subtitle: "Admin", title: "Overview" };
}

export function AdminLayout() {
  const location = useLocation();

  const isActive = (to) =>
    location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

  const { subtitle, title } = getHeader(location.pathname);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden flex h-screen min-h-dvh">
      {/* Sidebar — inspiration: narrow, icons + labels */}
      <aside className="w-16 flex flex-col items-center py-8 bg-sidebar-bg text-white shrink-0 z-50">
        <Link
          to="/profile"
          className="mb-10 flex flex-col items-center gap-1 transition-opacity opacity-90 hover:opacity-100"
          title="Profile"
        >
          <div className="w-10 h-10 bg-uw-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl font-bold">umbrella</span>
          </div>
        </Link>
        <nav className="flex flex-col gap-8 flex-1">
          {nav.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 transition-opacity ${
                isActive(to) ? "text-uw-secondary opacity-100" : "opacity-40 hover:opacity-100"
              }`}
              title={label === "Dash" ? "Dashboard" : label === "Inv" ? "Inventory" : label === "Alerts" ? "Maintenance & Alerts" : label}
            >
              <span className="material-symbols-outlined text-2xl">{icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
            </Link>
          ))}
        </nav>
        <Link
          to="/"
          className="mt-auto flex flex-col items-center gap-1 transition-opacity opacity-40 hover:opacity-100"
          title="Map view"
        >
          <span className="material-symbols-outlined text-2xl">map</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Map</span>
        </Link>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 ios-blur border-b border-slate-200 dark:border-slate-800 px-4 pt-10 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-uw-primary dark:text-uw-secondary uppercase tracking-widest mb-1">
                {subtitle}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 bg-background-light dark:bg-background-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

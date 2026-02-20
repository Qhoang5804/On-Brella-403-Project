import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainLayout({ children }) {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/scan") || location.pathname === "/active";

  return (
    <div className="min-h-screen bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col">
      <main className="flex-1 overflow-auto">
        {children ?? <Outlet />}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

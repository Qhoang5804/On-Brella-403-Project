import { NavLink, useLocation } from "react-router-dom";
import { useRental } from "../context/RentalContext";

/**
 * Bottom nav: Map, Active, History, Profile (History and Profile are placeholders).
 */
export function BottomNav() {
  const location = useLocation();
  const { activeRental } = useRental();
  const isMap = location.pathname === "/";
  const isActive = location.pathname === "/active";
  const isHistory = location.pathname === "/history";
  const isProfile = location.pathname === "/profile";

  const linkClass = (active) =>
    `flex flex-col items-center gap-1 transition-colors min-w-[56px] ${
      active ? "text-primary" : "text-slate-400 dark:text-slate-500"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 pt-3 pb-8 flex justify-between items-center z-30">
      <NavLink to="/" className={linkClass(isMap)}>
        <span className="material-icons">explore</span>
        <span className="text-[10px] font-bold">Map</span>
      </NavLink>
      <NavLink to="/active" className={`${linkClass(isActive)} relative`}>
        <span className="material-icons">umbrella</span>
        <span className="text-[10px] font-bold">Active</span>
        {activeRental && (
          <span className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </NavLink>
      <NavLink to="/history" className={linkClass(isHistory)}>
        <span className="material-icons">history</span>
        <span className="text-[10px] font-bold">History</span>
      </NavLink>
      <NavLink to="/profile" className={linkClass(isProfile)}>
        <span className="material-icons text-xl">person_outline</span>
        <span className="text-[10px] font-bold">Account</span>
      </NavLink>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </nav>
  );
}

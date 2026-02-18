/**
 * Placeholder for Profile / Account. No behavior yet.
 */
export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <span className="material-icons text-3xl text-slate-400">person_outline</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Account</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
        Profile and settings will appear here.
      </p>
    </div>
  );
}

/**
 * Login page placeholder for Phase 0.
 * Full auth implementation in Phase 1.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
          <span className="text-white text-2xl font-bold">B</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          BrightLoop
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Subscription Management System — Phase 0 Ready
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Database & App Skeleton Operational
        </div>
      </div>
    </main>
  );
}


import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  FileCode2,
  AlertTriangle,
  BarChart3,
  Layers,
  Settings,
  Github,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  currentView?: string;
  activeView?: string;
  onNavigate: (view: string) => void;
  openPrCount?: number;
  newFindingsCount?: number;
  criticalFindingsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeView,
  onNavigate,
  openPrCount = 0,
  newFindingsCount = 0,
  criticalFindingsCount = 0,
}) => {
  const selectedView = currentView || activeView || 'dashboard';
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'repositories',
      label: 'Repositories',
      icon: GitBranch,
      badge: null,
    },
    {
      id: 'pull-requests',
      label: 'Pull Requests',
      icon: GitPullRequest,
      badge: openPrCount > 0 ? `${openPrCount}` : null,
      badgeColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
    },
    {
      id: 'diff-review',
      label: 'Diff Reviewer',
      icon: FileCode2,
      badge: 'Live',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'findings',
      label: 'Findings Triage',
      icon: AlertTriangle,
      badge: criticalFindingsCount > 0 ? `${criticalFindingsCount} Crit` : null,
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
    },
    {
      id: 'analytics',
      label: 'Productivity Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'architecture',
      label: 'Architecture & API',
      icon: Layers,
      badge: 'v2.1',
      badgeColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
    },
    {
      id: 'settings',
      label: 'Settings & Security',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 flex flex-col justify-between shrink-0 hidden md:flex transition-colors">
      <div className="p-3.5 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-950'
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Card */}
      <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800/80 m-2 rounded-xl bg-white dark:bg-zinc-900/70 border text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">
            <Github className="w-3.5 h-3.5" />
            <span>GitHub App Integration</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          HMAC webhook receiver and deterministic AST engine operational.
        </p>
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            AST + Semgrep + Gemini
          </span>
          <span>100% test pass</span>
        </div>
      </div>
    </aside>
  );
};

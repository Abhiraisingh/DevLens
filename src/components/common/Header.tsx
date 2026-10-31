import React, { useState } from 'react';
import {
  ShieldCheck,
  Sun,
  Moon,
  GitPullRequest,
  Plus,
  Terminal,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Repository } from '../../types';

interface HeaderProps {
  repositories: Repository[];
  selectedRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onOpenImportModal: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  repositories,
  selectedRepo,
  onSelectRepo,
  onOpenImportModal,
  onNavigate,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Logo & Repo Selector */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                DevLens
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                v2.1 Pro
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block -mt-0.5 font-medium">
              AI Code Review & Quality Platform
            </p>
          </div>
        </div>

        {/* Repository Switcher */}
        {repositories.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors max-w-[200px] sm:max-w-[260px] truncate"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">
                {selectedRepo ? selectedRepo.fullName : 'Select Repository'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 ml-auto" />
            </button>

            {repoDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1.5 z-50 text-xs"
                onClick={() => setRepoDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 font-semibold text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                  <span>Authorized Repositories</span>
                  <span className="text-zinc-500">{repositories.length}</span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => onSelectRepo(repo)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                        selectedRepo?.id === repo.id
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{repo.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{repo.owner}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {repo.primaryLanguage}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800/60 p-1.5">
                  <button
                    onClick={onOpenImportModal}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Import Repository</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick actions, Live Engine indicator, Theme switch, User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Indicator Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Gemini 3.8 Flash AI</span>
        </div>

        {/* Import Repo Button */}
        <button
          onClick={onOpenImportModal}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Repo</span>
        </button>

        {/* Architecture & API specs button */}
        <button
          onClick={() => onNavigate('architecture')}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Architecture & API Specs"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Role Badge */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.displayName || 'Developer'}
              </div>
              <div className="text-[10px] text-zinc-500 capitalize">
                {user?.role?.replace('_', ' ') || 'Staff Engineer'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-2 z-50 text-xs"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.displayName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                  {user?.role === 'tech_lead' ? 'Tech Lead & Auditor' : 'Senior Full-Stack Engineer'}
                </span>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] text-zinc-400 uppercase font-semibold">
                  Quick Switch Persona
                </div>
                <button
                  onClick={() => demoLogin('developer')}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Alex Morgan (Engineer)</span>
                </button>
                <button
                  onClick={() => demoLogin('tech_lead')}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sarah Chen (Tech Lead)</span>
                </button>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sun,
  Moon,
  Github,
  LogOut,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  FileCode2,
  AlertTriangle,
  BarChart3,
  Layers,
  Settings,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'repositories', label: 'Repositories', icon: GitBranch },
    { id: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest, badge: '3' },
    { id: 'diff-review', label: 'Diff Reviewer', icon: FileCode2, badge: 'Live' },
    { id: 'findings', label: 'Findings Triage', icon: AlertTriangle, badge: '4 New' },
    { id: 'analytics', label: 'Productivity Analytics', icon: BarChart3 },
    { id: 'architecture', label: 'Architecture & API', icon: Layers },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  const handleMobileNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-14 border-b border-[#30363d] bg-[#161b22] px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0 shrink-0">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#21262d] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleMobileNav('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 font-semibold text-white tracking-tight hover:opacity-90 transition-opacity min-w-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="font-bold text-sm sm:text-base leading-none tracking-tight text-white flex items-center gap-1.5">
                DevLens
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1 sm:px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PROD
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal truncate hidden xs:inline sm:inline">
                AI Code Review Platform
              </span>
            </div>
          </button>
        </div>

        {/* Global Status Badges & Quick Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[#0d1117] border border-[#30363d] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Engine v2.1 Ready</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[#0d1117] border border-[#30363d] text-purple-400">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-[#30363d]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Demo Switcher */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#30363d]">
              <div className="flex items-center gap-1.5">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#30363d]"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-medium text-gray-200 leading-tight">{user.displayName}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Switch Role Button - visible on sm and up, moved to drawer on mobile */}
              <button
                onClick={() => demoLogin(user.role === 'developer' ? 'tech_lead' : 'developer')}
                title="Toggle role for demonstration"
                className="hidden sm:inline-flex text-[11px] px-2 py-1 rounded bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d] hover:border-gray-500 transition-colors whitespace-nowrap"
              >
                Switch Role
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#21262d] rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleMobileNav('auth')}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#161b22] border-r border-[#30363d] h-full flex flex-col justify-between z-50 p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-white text-sm">DevLens Navigation</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNav(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-gray-300 hover:bg-[#21262d] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#21262d] text-indigo-300 border border-[#30363d]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer with User & Role Switcher */}
            {user && (
              <div className="pt-3 border-t border-[#30363d] space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-300 bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
                  <div className="flex items-center gap-2 min-w-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {user.displayName.charAt(0)}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{user.displayName}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{user.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    demoLogin(user.role === 'developer' ? 'tech_lead' : 'developer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-[#21262d] text-gray-200 hover:bg-[#30363d] border border-[#30363d] flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch Role ({user.role === 'developer' ? 'Lead' : 'Developer'})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

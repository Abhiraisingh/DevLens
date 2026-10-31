import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  GitPullRequest,
  Cpu,
  Lock,
  ArrowRight,
  Code2,
  CheckCircle2,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingViewProps {
  onGetStarted: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  const { demoLogin } = useAuth();

  const handleQuickDemo = async () => {
    await demoLogin('developer');
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[#30363d] pt-12 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Production-Grade AI Code Review Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Review Pull Requests with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Deterministic Rigor
            </span>{' '}
            & AI Intelligence
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed font-normal">
            DevLens combines static AST analysis (ESLint & Semgrep rules) with Gemini 3.8 Flash
            architectural auditing. Identify critical security vulnerabilities, concurrency bugs, and
            regressions before they hit production.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={handleQuickDemo}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Launch Interactive Demo
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-semibold text-sm transition-all"
            >
              Sign In / Connect GitHub
            </button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Mock Placeholders
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real Diff & Hunk Parsing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini 3.8 Flash Integration
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Asynchronous Worker Queue
            </span>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Modern Engineering Teams
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Deterministic code checks, explainable findings, and automated review workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Static Checks</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Catches OWASP Top 10 vulnerabilities (SQL Injection CWE-89, hardcoded secrets CWE-798,
              missing rate limiting) using verified AST and regex rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI-Assisted Architectural Review</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by Google Gemini 3.8 Flash with structured schema validation. Explains race
              conditions, floating-point currency hazards, and unawaited async routines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Productivity & Defect Analytics</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Track review cycle duration, defect density per 1,000 lines of code, resolution rate,
              and category breakdowns over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

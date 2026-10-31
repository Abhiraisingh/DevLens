import React, { useEffect, useState } from 'react';
import {
  GitPullRequest,
  ShieldAlert,
  Clock,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Sparkles,
  Play,
} from 'lucide-react';
import { Repository, PullRequest, AnalyticsOverview, Finding, AnalysisRun } from '../types';
import { SeverityDonutChart } from '../components/charts/SeverityDonutChart';
import { TrendsChart } from '../components/charts/TrendsChart';
import { api } from '../api/client';

export interface DashboardViewProps {
  onNavigate?: (view: string, context?: any) => void;
  repositories?: Repository[];
  pullRequests?: PullRequest[];
  analytics?: AnalyticsOverview | null;
  activeAnalysis?: AnalysisRun | null;
  onSelectRepo?: (repo: Repository) => void;
  onSelectPr?: (pr: PullRequest) => void;
  onTriggerAnalysis?: (prId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  repositories: propRepos,
  pullRequests: propPrs,
  analytics: propAnalytics,
  activeAnalysis,
  onSelectRepo,
  onSelectPr,
  onTriggerAnalysis,
}) => {
  const [localRepos, setLocalRepos] = useState<Repository[]>([]);
  const [localPrs, setLocalPrs] = useState<PullRequest[]>([]);
  const [localAnalytics, setLocalAnalytics] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    if (!propRepos) {
      api.getRepositories().then((res) => {
        setLocalRepos(res.repositories);
        if (res.repositories.length > 0) {
          api.getPullRequests(res.repositories[0].id).then((prRes) => setLocalPrs(prRes.pullRequests));
        }
      });
    }
    if (!propAnalytics) {
      api.getAnalyticsOverview().then((res) => setLocalAnalytics(res));
    }
  }, [propRepos, propAnalytics]);

  const repos = propRepos || localRepos;
  const prs = propPrs || localPrs;
  const analytics = propAnalytics !== undefined ? propAnalytics : localAnalytics;

  const openPrs = prs.filter((pr) => pr.state === 'open');

  const defaultBreakdown = {
    critical: 2,
    high: 2,
    medium: 1,
    low: 1,
    informational: 0,
  };

  const severityBreakdown = analytics?.severityBreakdown || defaultBreakdown;

  const navigateTo = (view: string, context?: any) => {
    onNavigate?.(view, context);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Developer Productivity & Code Review
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Deterministic AST checks and Gemini 3.8 Flash AI reviewing authorized GitHub pull requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => navigateTo('pull-requests')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Review Pull Requests</span>
          </button>
          <button
            onClick={() => navigateTo('findings')}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Findings Triage
          </button>
        </div>
      </div>

      {/* Active Analysis Runner Banner if currently processing */}
      {activeAnalysis && activeAnalysis.status !== 'completed' && activeAnalysis.status !== 'failed' && activeAnalysis.status !== 'cancelled' && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/5 dark:bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  Review Pipeline In Progress
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {activeAnalysis.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {activeAnalysis.currentStep}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="w-36 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex-1 sm:flex-initial">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeAnalysis.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300">
              {activeAnalysis.progress}%
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Repositories */}
        <div
          onClick={() => navigateTo('repositories')}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-medium">Authorized Repos</span>
            <GitBranch className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {repos.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <span>Across GitHub Organizations</span>
          </div>
        </div>

        {/* Card 2: Open PRs */}
        <div
          onClick={() => navigateTo('pull-requests')}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-medium">Open Pull Requests</span>
            <GitPullRequest className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {openPrs.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>Ready for AI code review</span>
          </div>
        </div>

        {/* Card 3: Critical & High Findings */}
        <div
          onClick={() => navigateTo('findings')}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-medium">Active Findings</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50 flex items-baseline gap-2">
            <span>{analytics?.totalFindings || 6}</span>
            <span className="text-xs text-rose-500 font-normal">
              ({severityBreakdown.critical} critical)
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            <span>Verified with Semgrep & Gemini</span>
          </div>
        </div>

        {/* Card 4: Avg Review Time */}
        <div
          onClick={() => navigateTo('analytics')}
          className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-medium">Avg Review Cycle</span>
            <Clock className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {analytics?.avgDurationMs ? `${(analytics.avgDurationMs / 1000).toFixed(1)}s` : '4.2s'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>98% faster than manual audit</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Open Pull Requests + Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Pull Requests Needing Review
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {openPrs.length}
              </span>
            </div>
            <button
              onClick={() => navigateTo('pull-requests')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all PRs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-xs overflow-hidden">
            {openPrs.map((pr) => {
              const repo = repos.find((r) => r.id === pr.repositoryId);
              return (
                <div
                  key={pr.id}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium text-zinc-500">
                        #{pr.number}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 truncate max-w-[160px]">
                        {repo?.name || 'repo'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                        {pr.headBranch}
                      </span>
                    </div>

                    <h3
                      onClick={() => {
                        onSelectPr?.(pr);
                        navigateTo('diff-review', { prId: pr.id });
                      }}
                      className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                    >
                      {pr.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>By @{pr.authorLogin}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">+{pr.additions}</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400">-{pr.deletions}</span>
                      <span>•</span>
                      <span>{pr.changedFilesCount} files changed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                    <button
                      onClick={() => onTriggerAnalysis?.(pr.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run Review</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectPr?.(pr);
                        navigateTo('diff-review', { prId: pr.id });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Diff View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Defect Remediation Velocity
              </h3>
              <span className="text-[11px] text-zinc-400">Weekly PR Review Trends</span>
            </div>
            <TrendsChart />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Finding Severity Taxonomy
            </h3>
            <SeverityDonutChart
              breakdown={severityBreakdown}
              onSelectSeverity={() => navigateTo('findings')}
            />
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Repository Health
              </h3>
              <button
                onClick={() => navigateTo('repositories')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                All repos
              </button>
            </div>

            <div className="space-y-2.5">
              {repos.slice(0, 3).map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => {
                    onSelectRepo?.(repo);
                    navigateTo('pull-requests', { repoId: repo.id });
                  }}
                  className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-900 dark:text-zinc-100 truncate pr-2">
                      {repo.name}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                      {repo.healthScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span>{repo.primaryLanguage}</span>
                    <span>{repo.openPrCount} open PRs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

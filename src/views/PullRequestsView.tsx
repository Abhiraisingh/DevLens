import React, { useState } from 'react';
import {
  GitPullRequest,
  Play,
  FileCode2,
  GitBranch,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Repository, PullRequest, AnalysisRun } from '../types';

interface PullRequestsViewProps {
  repository: Repository | null;
  pullRequests: PullRequest[];
  analyses: Record<string, AnalysisRun>;
  activeAnalysis: AnalysisRun | null;
  onSelectPr: (pr: PullRequest) => void;
  onTriggerAnalysis: (prId: string) => void;
  onRetryAnalysis: (analysisId: string) => void;
  onCancelAnalysis: (analysisId: string) => void;
}

export const PullRequestsView: React.FC<PullRequestsViewProps> = ({
  repository,
  pullRequests,
  analyses,
  activeAnalysis,
  onSelectPr,
  onTriggerAnalysis,
  onRetryAnalysis,
  onCancelAnalysis,
}) => {
  const [filterState, setFilterState] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!repository) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Please select a repository from the header switcher.
      </div>
    );
  }

  const filteredPrs = pullRequests.filter((pr) => {
    const matchesState = filterState === 'all' || pr.state === filterState;
    const matchesSearch =
      pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.authorLogin.toLowerCase().includes(search.toLowerCase()) ||
      pr.headBranch.toLowerCase().includes(search.toLowerCase()) ||
      String(pr.number).includes(search);
    return matchesState && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Repository Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{repository.owner}</span>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{repository.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-indigo-500" />
            <span>Pull Requests Explorer</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Default branch:</span>
            <span className="font-mono font-medium">{repository.defaultBranch}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
            <span className="text-zinc-500">Language:</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {repository.primaryLanguage}
            </span>
          </div>
        </div>
      </div>

      {/* Active Running Analysis Progress Card */}
      {activeAnalysis && activeAnalysis.status !== 'completed' && activeAnalysis.status !== 'failed' && activeAnalysis.status !== 'cancelled' && (
        <div className="p-5 rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                Running Asynchronous Analysis Pipeline: PR #{pullRequests.find((p) => p.id === activeAnalysis.pullRequestId)?.number}
              </h3>
            </div>
            <button
              onClick={() => onCancelAnalysis(activeAnalysis.id)}
              className="text-[11px] text-rose-600 dark:text-rose-400 font-medium hover:underline"
            >
              Cancel Analysis
            </button>
          </div>

          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${activeAnalysis.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>{activeAnalysis.currentStep}</span>
            <span>{activeAnalysis.progress}% Complete</span>
          </div>

          {/* Real-time mini log terminal */}
          <div className="p-2.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] max-h-24 overflow-y-auto space-y-1 border border-zinc-800">
            {activeAnalysis.logs.slice(-3).map((l, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-zinc-500">[{l.timestamp.split('T')[1]?.substring(0, 8)}]</span>
                <span className={l.level === 'warn' ? 'text-amber-400' : l.level === 'success' ? 'text-emerald-400' : 'text-zinc-300'}>
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pull requests..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'open', 'merged', 'closed'].map((state) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterState === state
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Pull Requests List */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-xs overflow-hidden">
        {filteredPrs.map((pr) => {
          const latestAnalysis = pr.latestAnalysisId ? analyses[pr.latestAnalysisId] : null;

          return (
            <div
              key={pr.id}
              className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      pr.state === 'open'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : pr.state === 'merged'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <GitPullRequest className="w-3 h-3" />
                    <span className="capitalize">{pr.state}</span>
                  </span>

                  <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    #{pr.number}
                  </span>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                    <span>{pr.baseBranch}</span>
                    <span>←</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{pr.headBranch}</span>
                  </div>
                </div>

                <h3
                  onClick={() => onSelectPr(pr)}
                  className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                >
                  {pr.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                  <span>Author: @{pr.authorLogin}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    +{pr.additions}
                  </span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">
                    -{pr.deletions}
                  </span>
                  <span>•</span>
                  <span>{pr.changedFilesCount} changed files</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">Commit: {pr.headSha}</span>
                </div>

                {latestAnalysis?.findingsCount && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400">Latest Scan:</span>
                    {latestAnalysis.findingsCount.critical > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        {latestAnalysis.findingsCount.critical} Critical
                      </span>
                    )}
                    {latestAnalysis.findingsCount.high > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                        {latestAnalysis.findingsCount.high} High
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400">
                      ({latestAnalysis.findingsCount.total} total findings)
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onTriggerAnalysis(pr.id)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{pr.latestAnalysisId ? 'Re-run Analysis' : 'Run AI Review'}</span>
                </button>

                <button
                  onClick={() => onSelectPr(pr)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Inspect Diff</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPrs.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No pull requests match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

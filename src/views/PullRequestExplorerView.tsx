import React, { useEffect, useState } from 'react';
import {
  GitPullRequest,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  FileCode,
  GitBranch,
} from 'lucide-react';
import { Repository, PullRequest } from '../types';
import { api } from '../api/client';
import { AnalysisProgressModal } from '../components/analyses/AnalysisProgressModal';
import { useToast } from '../context/ToastContext';

interface PullRequestExplorerViewProps {
  initialRepoId?: string;
  onNavigate: (view: string, context?: any) => void;
}

export const PullRequestExplorerView: React.FC<PullRequestExplorerViewProps> = ({
  initialRepoId,
  onNavigate,
}) => {
  const { toast } = useToast();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId || '');
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string>('open');

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const res = await api.getRepositories();
        setRepositories(res.repositories);
        if (!selectedRepoId && res.repositories.length > 0) {
          setSelectedRepoId(res.repositories[0].id);
        }
      } catch (e) {
        console.error('Failed loading repos:', e);
      }
    };
    loadRepos();
  }, []);

  const loadPullRequests = async () => {
    if (!selectedRepoId) return;
    try {
      const res = await api.getPullRequests(selectedRepoId, filterState);
      setPullRequests(res.pullRequests);
    } catch (e) {
      console.error('Failed loading PRs:', e);
    }
  };

  useEffect(() => {
    loadPullRequests();
  }, [selectedRepoId, filterState]);

  const handleRunAnalysis = async (prId: string) => {
    try {
      const res = await api.triggerAnalysis(prId);
      setActiveAnalysisId(res.analysisId);
      toast('Analysis queued for worker processing', 'info');
    } catch (err: unknown) {
      toast((err as Error).message || 'Analysis request failed', 'error');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
            <span>Pull Request Explorer</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Inspect pending code modifications, branch targets, and review status
          </p>
        </div>

        {/* Repository Selector Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FolderGit2 className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 w-full sm:w-auto truncate"
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id} className="bg-[#161b22]">
                {repo.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-3 text-xs overflow-x-auto scrollbar-none">
        {['all', 'open', 'closed', 'merged'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterState(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors font-medium shrink-0 ${
              filterState === tab
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pull Requests List */}
      <div className="space-y-3">
        {pullRequests.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center text-gray-400">
            <GitPullRequest className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No pull requests found matching the current filters.</p>
          </div>
        ) : (
          pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-5 hover:border-gray-500/60 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    #{pr.number}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 transition-colors truncate">
                    {pr.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {pr.state}
                  </span>
                </div>

                {pr.description && (
                  <p className="text-xs text-gray-300 line-clamp-2 max-w-2xl leading-relaxed">
                    {pr.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-1.5">
                    {pr.authorAvatar && (
                      <img
                        src={pr.authorAvatar}
                        alt={pr.authorLogin}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span>@{pr.authorLogin}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-gray-500" />
                    <span>{pr.baseBranch} ← {pr.headBranch}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">({pr.headSha})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">+{pr.additions}</span>
                    <span className="text-rose-400 font-semibold">-{pr.deletions}</span>
                    <span>({pr.changedFilesCount} files)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => handleRunAnalysis(pr.id)}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Run AI Review</span>
                </button>

                <button
                  onClick={() => onNavigate('diff-review', { prId: pr.id })}
                  className="px-3.5 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Inspect Diff & Findings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress modal */}
      {activeAnalysisId && (
        <AnalysisProgressModal
          analysisId={activeAnalysisId}
          onClose={() => setActiveAnalysisId(null)}
          onCompleted={() => {
            loadPullRequests();
            toast('Review finished! Click "Inspect Diff & Findings" to explore results.', 'success');
          }}
        />
      )}
    </div>
  );
};

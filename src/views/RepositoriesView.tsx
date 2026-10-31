import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Search,
  Plus,
  Key,
  Globe,
  Star,
  ShieldCheck,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Repository, GitHubInstallation } from '../types';
import { api } from '../api/client';
import { ImportRepoModal } from '../components/modals/ImportRepoModal';
import { ConnectPatModal } from '../components/modals/ConnectPatModal';
import { useToast } from '../context/ToastContext';

export interface RepositoriesViewProps {
  repositories?: Repository[];
  installations?: GitHubInstallation[];
  onSelectRepo?: (repo: Repository) => void;
  onOpenImportModal?: () => void;
  onOpenPatModal?: () => void;
  onDisconnectInstallation?: (installationId: string) => void;
  onNavigate?: (view: string, context?: any) => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({
  repositories: propRepos,
  installations: propInstallations,
  onSelectRepo,
  onOpenImportModal,
  onOpenPatModal,
  onDisconnectInstallation,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [localRepos, setLocalRepos] = useState<Repository[]>([]);
  const [localInstallations, setLocalInstallations] = useState<GitHubInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const [showLocalImportModal, setShowLocalImportModal] = useState(false);
  const [showLocalPatModal, setShowLocalPatModal] = useState(false);

  const fetchLocalData = async () => {
    try {
      setLoading(true);
      const [r, i] = await Promise.all([api.getRepositories(), api.getInstallations()]);
      setLocalRepos(r);
      setLocalInstallations(i);
    } catch (e: any) {
      console.error('Failed to load repositories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propRepos || !propInstallations) {
      fetchLocalData();
    }
  }, [propRepos, propInstallations]);

  const repos = propRepos || localRepos;
  const installations = propInstallations || localInstallations;

  const languages = ['all', ...Array.from(new Set(repos.map((r) => r.primaryLanguage)))];

  const filtered = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    const matchesLang =
      selectedLanguage === 'all' ||
      r.primaryLanguage.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesLang;
  });

  const handleSelectRepo = (repo: Repository) => {
    if (onSelectRepo) {
      onSelectRepo(repo);
    }
    if (onNavigate) {
      onNavigate('pull-requests', { repoId: repo.id });
    }
  };

  const handleOpenImport = () => {
    if (onOpenImportModal) {
      onOpenImportModal();
    } else {
      setShowLocalImportModal(true);
    }
  };

  const handleOpenPat = () => {
    if (onOpenPatModal) {
      onOpenPatModal();
    } else {
      setShowLocalPatModal(true);
    }
  };

  const handleDisconnect = async (instId: string) => {
    if (onDisconnectInstallation) {
      onDisconnectInstallation(instId);
      return;
    }
    try {
      await api.disconnectInstallation(instId);
      showToast('Installation disconnected', 'info');
      fetchLocalData();
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect', 'error');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Connected Repositories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Repositories authorized for automated diff analysis, security scanning, and PR inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenPat}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>Connect Token (PAT)</span>
          </button>
          <button
            onClick={handleOpenImport}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Import Public Repo</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by repo name, owner, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 shrink-0">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 capitalize w-full sm:w-auto"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repositories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleSelectRepo(repo)}
            className="group p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400 transition-colors">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate max-w-[180px]">
                      {repo.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                      {repo.owner}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{repo.healthScore}/100</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed min-h-[36px]">
                {repo.description || 'No description provided for this repository.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{repo.primaryLanguage}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {repo.openPrCount}
                  </span>{' '}
                  PRs
                </span>
                {(repo.starsCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{repo.starsCount}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
          <GitBranch className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            No repositories found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or import an open-source repository from GitHub.
          </p>
          <button
            onClick={handleOpenImport}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 cursor-pointer"
          >
            Import Public Repo
          </button>
        </div>
      )}

      {/* GitHub Installations section */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
          Active GitHub Connections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installations.map((inst) => (
            <div
              key={inst.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      @{inst.accountLogin}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-mono">
                      {inst.authType}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Status: <span className="text-emerald-500 font-medium capitalize">{inst.status}</span> • Scoped Access
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDisconnect(inst.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Disconnect Integration"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showLocalImportModal && (
        <ImportRepoModal
          isOpen={showLocalImportModal}
          onClose={() => setShowLocalImportModal(false)}
          onSuccess={() => {
            setShowLocalImportModal(false);
            fetchLocalData();
          }}
        />
      )}

      {showLocalPatModal && (
        <ConnectPatModal
          isOpen={showLocalPatModal}
          onClose={() => setShowLocalPatModal(false)}
          onSuccess={() => {
            setShowLocalPatModal(false);
            fetchLocalData();
          }}
        />
      )}
    </div>
  );
};

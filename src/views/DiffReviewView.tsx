import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  FileCode2,
  Play,
  Sparkles,
  ChevronLeft,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Download,
  Filter,
} from 'lucide-react';
import { Repository, PullRequest, PullRequestFile, Finding, AnalysisRun, FindingStatus } from '../types';
import { api } from '../api/client';
import { DiffViewer } from '../components/diff/DiffViewer';
import { FindingDrawer } from '../components/diff/FindingDrawer';
import { useToast } from '../context/ToastContext';

export interface DiffReviewViewProps {
  initialPrId?: string | null;
  onNavigate?: (view: string, context?: any) => void;
  repository?: Repository | null;
  pullRequest?: PullRequest | null;
  files?: PullRequestFile[];
  findings?: Finding[];
  activeAnalysis?: AnalysisRun | null;
  onBack?: () => void;
  onTriggerAnalysis?: (prId: string) => void;
  onUpdateFindingStatus?: (
    findingId: string,
    status: FindingStatus,
    dismissalReason?: string,
    notes?: string
  ) => void;
}

export const DiffReviewView: React.FC<DiffReviewViewProps> = ({
  initialPrId,
  onNavigate,
  repository: propRepo,
  pullRequest: propPr,
  files: propFiles,
  findings: propFindings,
  activeAnalysis: propAnalysis,
  onBack,
  onTriggerAnalysis,
  onUpdateFindingStatus,
}) => {
  const { showToast } = useToast();
  const [localRepo, setLocalRepo] = useState<Repository | null>(null);
  const [localPr, setLocalPr] = useState<PullRequest | null>(null);
  const [localFiles, setLocalFiles] = useState<PullRequestFile[]>([]);
  const [localFindings, setLocalFindings] = useState<Finding[]>([]);
  const [localAnalysis, setLocalAnalysis] = useState<AnalysisRun | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const fetchPrData = async (prId: string) => {
    try {
      setLoading(true);
      const prs = await api.getPullRequests();
      const targetPr = prs.find((p) => p.id === prId) || prs[0];
      if (!targetPr) return;

      setLocalPr(targetPr);
      const [repo, files, findingsRes] = await Promise.all([
        api.getRepository(targetPr.repositoryId),
        api.getPullRequestFiles(targetPr.id),
        api.getFindings({ pullRequestId: targetPr.id }),
      ]);
      setLocalRepo(repo);
      setLocalFiles(files);
      setLocalFindings(findingsRes.items);
    } catch (err: any) {
      console.error('Failed to load PR diff data', err);
      showToast('Failed to load pull request details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propPr) {
      // If no PR prop passed, load via initialPrId or default to first PR
      api.getPullRequests().then((prs) => {
        const prToLoad = initialPrId
          ? prs.find((p) => p.id === initialPrId) || prs[0]
          : prs[0];
        if (prToLoad) {
          fetchPrData(prToLoad.id);
        }
      });
    }
  }, [propPr, initialPrId]);

  const repository = propRepo || localRepo;
  const pullRequest = propPr || localPr;
  const files = propFiles || localFiles;
  const findings = propFindings || localFindings;
  const activeAnalysis = propAnalysis || localAnalysis;

  useEffect(() => {
    if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('pull-requests');
    }
  };

  const handleTriggerAnalysis = async (prId: string) => {
    if (onTriggerAnalysis) {
      onTriggerAnalysis(prId);
      return;
    }
    try {
      showToast('Starting automated AST & Gemini AI review...', 'info');
      const analysis = await api.triggerAnalysis(prId);
      setLocalAnalysis(analysis);
      showToast('Review pipeline running in background', 'success');
      // Refresh findings after short delay
      setTimeout(() => {
        api.getFindings({ pullRequestId: prId }).then((res) => setLocalFindings(res.items));
      }, 3000);
    } catch (err: any) {
      showToast(err.message || 'Failed to start analysis', 'error');
    }
  };

  const handleUpdateFindingStatus = async (
    findingId: string,
    status: FindingStatus,
    dismissalReason?: string,
    notes?: string
  ) => {
    if (onUpdateFindingStatus) {
      onUpdateFindingStatus(findingId, status, dismissalReason, notes);
      return;
    }
    try {
      const updated = await api.updateFindingStatus(findingId, {
        status,
        dismissalReason,
        notes,
      });
      setLocalFindings((prev) => prev.map((f) => (f.id === findingId ? updated : f)));
      if (selectedFinding && selectedFinding.id === findingId) {
        setSelectedFinding(updated);
      }
      showToast(`Finding marked as ${status}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update finding status', 'error');
    }
  };

  if (loading && !pullRequest) {
    return (
      <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm">Loading pull request diff and findings...</p>
      </div>
    );
  }

  if (!pullRequest || !repository) {
    return (
      <div className="p-12 text-center text-zinc-500 space-y-3">
        <GitPullRequest className="w-10 h-10 text-zinc-400 mx-auto" />
        <p className="text-sm">Please select a pull request to inspect diffs and findings.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
        >
          Browse Pull Requests
        </button>
      </div>
    );
  }

  // Filter findings for this pull request
  const prFindings = findings.filter((f) => f.pullRequestId === pullRequest.id);

  const displayedFiles = selectedFileId
    ? files.filter((f) => f.id === selectedFileId)
    : files;

  const severityCounts = {
    critical: prFindings.filter((f) => f.severity === 'critical').length,
    high: prFindings.filter((f) => f.severity === 'high').length,
    medium: prFindings.filter((f) => f.severity === 'medium').length,
    low: prFindings.filter((f) => f.severity === 'low').length,
  };

  const handleExportMarkdown = () => {
    let md = `# DevLens Code Review Report: PR #${pullRequest.number} - ${pullRequest.title}\n`;
    md += `**Repository:** ${repository.fullName} | **Branch:** ${pullRequest.baseBranch} <- ${pullRequest.headBranch}\n`;
    md += `**Findings Summary:** ${prFindings.length} Total (${severityCounts.critical} Critical, ${severityCounts.high} High)\n\n`;
    md += `## Review Findings\n\n`;

    prFindings.forEach((f, idx) => {
      md += `### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}\n`;
      md += `- **File:** \`${f.filePath}:${f.startLine}-${f.endLine}\`\n`;
      md += `- **Tool:** ${f.toolIdentifier} | **Rule:** \`${f.ruleId || 'N/A'}\` | **Confidence:** ${Math.round(f.confidence * 100)}%\n`;
      md += `- **Description:** ${f.description}\n`;
      md += `- **Why It Matters:** ${f.whyItMatters}\n`;
      md += `- **Remediation:** ${f.suggestedFix}\n\n`;
      if (f.beforeSnippet && f.afterSnippet) {
        md += `\`\`\`diff\n- ${f.beforeSnippet.replace(/\n/g, '\n- ')}\n+ ${f.afterSnippet.replace(/\n/g, '\n+ ')}\n\`\`\`\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevLens_Review_PR_${pullRequest.number}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] flex-1 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Review Control Bar */}
      <div className="px-3 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            title="Back to PRs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-500 flex-wrap">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] sm:max-w-none">
                {repository.name}
              </span>
              <span>/</span>
              <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                PR #{pullRequest.number}
              </span>
              <span className="font-mono text-[11px] text-zinc-400 hidden sm:inline">
                ({pullRequest.baseBranch} ← {pullRequest.headBranch})
              </span>
            </div>

            <h1 className="font-semibold text-xs sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
              {pullRequest.title}
            </h1>
          </div>
        </div>

        {/* Severity Metrics & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* Findings Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {severityCounts.critical > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-semibold flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                {severityCounts.critical} Crit
              </span>
            )}
            {severityCounts.high > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {severityCounts.high} High
              </span>
            )}
            <span className="text-zinc-400 text-[11px] hidden sm:inline">
              ({prFindings.length} Total Findings)
            </span>
          </div>

          <button
            onClick={handleExportMarkdown}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Markdown Review Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          <button
            onClick={() => handleTriggerAnalysis(pullRequest.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area (2 Columns) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Changed Files Sidebar */}
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Files Changed ({files.length})</span>
            <button
              onClick={() => setSelectedFileId(null)}
              className="text-[10px] text-indigo-500 hover:underline capitalize cursor-pointer"
            >
              Show All
            </button>
          </div>

          <div className="p-2 space-y-1 text-xs">
            {files.map((file) => {
              const fileFindingCount = prFindings.filter(
                (f) => f.filePath.toLowerCase() === file.filename.toLowerCase()
              ).length;
              const isSelected = selectedFileId === file.id;

              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="truncate font-mono text-[11px]">{file.filename}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5 text-zinc-400">
                      <span className="text-emerald-500">+{file.additions}</span>
                      <span className="text-rose-500">-{file.deletions}</span>
                    </div>
                  </div>

                  {fileFindingCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shrink-0">
                      {fileFindingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Diff Viewer Area */}
        <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6">
          {/* Mobile File Selector Dropdown */}
          <div className="md:hidden mb-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileCode2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <select
                value={selectedFileId || ''}
                onChange={(e) => setSelectedFileId(e.target.value || null)}
                className="text-xs bg-transparent text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none w-full truncate"
              >
                <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  Show All Files ({files.length})
                </option>
                {files.map((file) => {
                  const fileFindingCount = prFindings.filter(
                    (f) => f.filePath.toLowerCase() === file.filename.toLowerCase()
                  ).length;
                  return (
                    <option
                      key={file.id}
                      value={file.id}
                      className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      {file.filename} (+{file.additions} -{file.deletions})
                      {fileFindingCount > 0 ? ` [${fileFindingCount} findings]` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedFileId && (
              <button
                onClick={() => setSelectedFileId(null)}
                className="text-[10px] text-indigo-500 font-medium hover:underline shrink-0"
              >
                All Files
              </button>
            )}
          </div>

          {displayedFiles.map((file) => (
            <DiffViewer
              key={file.id}
              file={file}
              findings={prFindings}
              selectedFindingId={selectedFinding?.id || null}
              onSelectFinding={(f) => setSelectedFinding(f)}
            />
          ))}

          {displayedFiles.length === 0 && (
            <div className="text-center py-20 text-zinc-500 text-xs">
              No changed files recorded for this pull request.
            </div>
          )}
        </div>
      </div>

      {/* Right: Slide-out Finding Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={(fId, st, reason, notes) => {
          handleUpdateFindingStatus(fId, st, reason, notes);
          if (selectedFinding && selectedFinding.id === fId) {
            setSelectedFinding({
              ...selectedFinding,
              status: st,
              dismissalReason: reason as any,
              notes,
            });
          }
        }}
      />
    </div>
  );
};

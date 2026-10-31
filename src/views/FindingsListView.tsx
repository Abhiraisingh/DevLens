import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileCode,
  Download,
  Sparkles,
  Cpu,
  Layers,
} from 'lucide-react';
import { Finding, FindingStatus } from '../types';
import { api } from '../api/client';
import { FindingDrawer } from '../components/diff/FindingDrawer';
import { useToast } from '../context/ToastContext';

export interface FindingsListViewProps {
  findings?: Finding[];
  onUpdateFindingStatus?: (
    findingId: string,
    status: FindingStatus,
    dismissalReason?: string,
    notes?: string
  ) => void;
  onNavigateToPr?: (pullRequestId: string) => void;
  onNavigate?: (view: string, context?: any) => void;
}

export const FindingsListView: React.FC<FindingsListViewProps> = ({
  findings: propFindings,
  onUpdateFindingStatus,
  onNavigateToPr,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [localFindings, setLocalFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const res = await api.getFindings({});
      setLocalFindings(res.items);
    } catch (err: any) {
      console.error('Failed to load findings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propFindings) {
      fetchFindings();
    }
  }, [propFindings]);

  const findings = propFindings || localFindings;

  const handleUpdateStatus = async (
    fId: string,
    st: FindingStatus,
    reason?: string,
    notes?: string
  ) => {
    if (onUpdateFindingStatus) {
      onUpdateFindingStatus(fId, st, reason, notes);
      return;
    }
    try {
      const updated = await api.updateFindingStatus(fId, {
        status: st,
        dismissalReason: reason,
        notes,
      });
      setLocalFindings((prev) => prev.map((f) => (f.id === fId ? updated : f)));
      if (selectedFinding && selectedFinding.id === fId) {
        setSelectedFinding(updated);
      }
      showToast(`Finding updated to ${st}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update finding', 'error');
    }
  };

  const handleNavigateToPr = (prId: string) => {
    if (onNavigateToPr) {
      onNavigateToPr(prId);
    } else if (onNavigate) {
      onNavigate('diff-review', { prId });
    }
  };

  const filtered = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.filePath.toLowerCase().includes(search.toLowerCase()) ||
      (f.ruleId && f.ruleId.toLowerCase().includes(search.toLowerCase()));

    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesSev && matchesCat && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertOctagon,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
        };
      case 'medium':
        return {
          icon: Info,
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-zinc-500/15 border-zinc-500/30 text-zinc-600 dark:text-zinc-400',
        };
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Title', 'Severity', 'Category', 'File', 'Line', 'Status', 'Tool'];
    const rows = filtered.map((f) => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      f.severity,
      f.category,
      f.filePath,
      f.startLine,
      f.status,
      f.toolIdentifier,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `devlens_findings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Findings & Vulnerabilities Triage
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Aggregated issues detected via deterministic static analysis (ESLint/Semgrep) and Gemini 3.8 Flash.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-3.5 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, rule ID, file path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
            <span className="text-zinc-400 font-medium shrink-0">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 capitalize text-xs w-full sm:w-auto"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="informational">Informational</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
            <span className="text-zinc-400 font-medium shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 capitalize text-xs w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="security">Security</option>
              <option value="correctness">Correctness</option>
              <option value="performance">Performance</option>
              <option value="maintainability">Maintainability</option>
              <option value="architecture">Architecture</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
            <span className="text-zinc-400 font-medium shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 capitalize text-xs w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto text-zinc-400 text-xs pt-1 sm:pt-0">
            Showing <strong className="text-zinc-700 dark:text-zinc-200">{filtered.length}</strong> of {findings.length} findings
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filtered.map((finding) => {
          const badge = getSeverityBadge(finding.severity);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={finding.id}
              onClick={() => setSelectedFinding(finding)}
              className="group p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    <span className="capitalize">{finding.severity}</span>
                  </span>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                    {finding.category}
                  </span>

                  {finding.toolIdentifier === 'semgrep' || finding.toolIdentifier === 'eslint' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Cpu className="w-3 h-3" />
                      <span>{finding.toolIdentifier}</span>
                      {finding.ruleId && (
                        <span className="text-zinc-400">({finding.ruleId})</span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-500 font-mono">
                      <Sparkles className="w-3 h-3" />
                      <span>gemini-3.8-flash</span>
                    </span>
                  )}

                  <span className="text-[11px] text-zinc-400">
                    Confidence: {Math.round(finding.confidence * 100)}%
                  </span>
                </div>

                <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {finding.title}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {finding.description}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-300 truncate">{finding.filePath}</span>
                  <span>:</span>
                  <span>Lines {finding.startLine}–{finding.endLine}</span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0 border-zinc-100 dark:border-zinc-800">
                <span
                  className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    finding.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : finding.status === 'dismissed'
                      ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      : finding.status === 'reviewed'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {finding.status}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFinding(finding);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Inspect Fix →
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="p-16 text-center text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No findings match your selected filter criteria.
          </div>
        )}
      </div>

      {/* Detail Slideout Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={(fId, st, reason, notes) => {
          handleUpdateStatus(fId, st, reason, notes);
        }}
      />
    </div>
  );
};

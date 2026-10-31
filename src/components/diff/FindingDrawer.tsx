import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  Cpu,
  FileCode,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Finding, FindingStatus } from '../../types';
import { api } from '../../api/client';

interface FindingDrawerProps {
  finding: Finding | null;
  onClose: () => void;
  onUpdateStatus: (findingId: string, status: FindingStatus, dismissalReason?: string, notes?: string) => void;
}

export const FindingDrawer: React.FC<FindingDrawerProps> = ({
  finding,
  onClose,
  onUpdateStatus,
}) => {
  const [copiedFix, setCopiedFix] = useState(false);
  const [notesText, setNotesText] = useState(finding?.notes || '');
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissReason, setDismissReason] = useState<string>('false_positive');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!finding) return null;

  const handleCopyFix = () => {
    if (finding.afterSnippet || finding.suggestedFix) {
      navigator.clipboard.writeText(finding.afterSnippet || finding.suggestedFix);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    onUpdateStatus(finding.id, finding.status, finding.dismissalReason, notesText);
  };

  const handleSendFeedback = async (action: 'accepted_fix' | 'dismissed' | 'marked_helpful' | 'marked_unhelpful') => {
    try {
      await api.updateFindingStatus(finding.id, finding.status);
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch {
      // ignore
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertOctagon,
          label: 'Critical Severity',
          badge: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          label: 'High Severity',
          badge: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          label: 'Medium Severity',
          badge: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
        };
      default:
        return {
          icon: Info,
          label: 'Informational',
          badge: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
        };
    }
  };

  const sev = getSeverityBadge(finding.severity);
  const SevIcon = sev.icon;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] max-w-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sev.badge}`}
            >
              <SevIcon className="w-3.5 h-3.5" />
              {sev.label}
            </span>

            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 capitalize">
              {finding.category}
            </span>

            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center gap-1 border border-indigo-200/50 dark:border-indigo-800/50">
              {finding.sourceType === 'static_analysis' ? (
                <>
                  <Cpu className="w-3 h-3" />
                  Deterministic ({finding.toolIdentifier})
                </>
              ) : finding.sourceType === 'ai_review' ? (
                <>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  AI ({finding.toolIdentifier})
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Hybrid (Static + AI Verified)
                </>
              )}
            </span>

            <span className="text-[10px] text-zinc-400 ml-auto font-mono">
              {Math.round(finding.confidence * 100)}% Confidence
            </span>
          </div>

          <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 leading-snug">
            {finding.title}
          </h3>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            <FileCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{finding.filePath}</span>
            <span className="text-zinc-400">Lines {finding.startLine}–{finding.endLine}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
        {/* Finding Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-500">Current Status:</span>
            <span
              className={`font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
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
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onUpdateStatus(finding.id, 'accepted')}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors text-xs"
            >
              Accept Fix
            </button>
            <button
              onClick={() => onUpdateStatus(finding.id, 'reviewed')}
              className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors text-xs"
            >
              Reviewed
            </button>
            <button
              onClick={() => setShowDismissModal(true)}
              className="px-2 py-1 rounded text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Section: Technical Description */}
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 text-xs uppercase tracking-wider text-[11px]">
            Technical Explanation
          </h4>
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-300 text-xs">
            {finding.description}
          </p>
        </div>

        {/* Section: Evidence */}
        {finding.evidence && (
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 text-xs uppercase tracking-wider text-[11px]">
              Supporting Diff Evidence
            </h4>
            <div className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto border border-zinc-800 leading-relaxed whitespace-pre-wrap">
              {finding.evidence}
            </div>
          </div>
        )}

        {/* Section: Why This Matters */}
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-200">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Why This Matters In Production</span>
          </h4>
          <p className="leading-relaxed text-[11px] text-zinc-700 dark:text-zinc-300">
            {finding.whyItMatters}
          </p>
        </div>

        {/* Section: Suggested Fix with Before / After Diff */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider text-[11px]">
              Remediation & Suggested Fix
            </h4>
            <button
              onClick={handleCopyFix}
              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFix ? 'Copied' : 'Copy Remediation'}</span>
            </button>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
            {finding.suggestedFix}
          </p>

          {/* Before & After comparison boxes */}
          {finding.beforeSnippet && finding.afterSnippet && (
            <div className="space-y-2 mt-2">
              <div className="border border-rose-500/30 rounded-lg overflow-hidden bg-rose-950/10 dark:bg-rose-950/20">
                <div className="px-3 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-semibold flex items-center justify-between">
                  <span>Vulnerable Code (Before)</span>
                  <span>-</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre-wrap">
                  {finding.beforeSnippet}
                </pre>
              </div>

              <div className="border border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-950/10 dark:bg-emerald-950/20">
                <div className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold flex items-center justify-between">
                  <span>Recommended Remediation (After)</span>
                  <span>+</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre-wrap">
                  {finding.afterSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Section: Private Developer Notes */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reviewer Notes & Action Items</span>
          </div>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Add internal notes for your team (e.g., ticket reference, planned sprint fix)..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <div className="flex justify-end mt-1.5">
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1 text-[11px] font-medium rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Save Note
            </button>
          </div>
        </div>

        {/* Section: Finding Utility Feedback */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Was this finding accurate and helpful?</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSendFeedback('marked_helpful')}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
              title="Helpful finding"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSendFeedback('marked_unhelpful')}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 transition-colors"
              title="Unhelpful finding"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {feedbackSent && <span className="text-[10px] text-emerald-500 ml-1">Feedback recorded</span>}
          </div>
        </div>
      </div>

      {/* Dismissal Reason Modal */}
      {showDismissModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Dismiss Finding
            </h4>
            <p className="text-xs text-zinc-500">
              Please choose a reason for dismissing this code review finding:
            </p>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="radio"
                  name="dismiss_reason"
                  value="false_positive"
                  checked={dismissReason === 'false_positive'}
                  onChange={(e) => setDismissReason(e.target.value)}
                />
                <span>False Positive (Not an issue)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="radio"
                  name="dismiss_reason"
                  value="wont_fix"
                  checked={dismissReason === 'wont_fix'}
                  onChange={(e) => setDismissReason(e.target.value)}
                />
                <span>Won't Fix (Acceptable risk)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="radio"
                  name="dismiss_reason"
                  value="intentional_pattern"
                  checked={dismissReason === 'intentional_pattern'}
                  onChange={(e) => setDismissReason(e.target.value)}
                />
                <span>Intentional Pattern / Internal Convention</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDismissModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(finding.id, 'dismissed', dismissReason);
                  setShowDismissModal(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-500"
              >
                Confirm Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

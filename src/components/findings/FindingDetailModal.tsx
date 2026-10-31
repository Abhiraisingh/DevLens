import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Finding } from '../../types';
import { api } from '../../api/client';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: any, dismissalReason?: string, notes?: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(finding?.notes || '');

  if (!finding) return null;

  const handleCopy = () => {
    if (finding.afterSnippet || finding.suggestedFix) {
      navigator.clipboard.writeText(finding.afterSnippet || finding.suggestedFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedback = async (action: string) => {
    try {
      await api.submitFindingFeedback(finding.id, action);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 capitalize">
                {finding.severity} Severity
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize">
                {finding.category}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {finding.toolIdentifier} ({Math.round(finding.confidence * 100)}% Confidence)
              </span>
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
              {finding.title}
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
              <FileCode className="w-3.5 h-3.5" />
              <span>{finding.filePath}</span>
              <span>:</span>
              <span>Lines {finding.startLine}–{finding.endLine}</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Description */}
        <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
            Technical Description
          </h4>
          <p className="leading-relaxed">{finding.description}</p>
        </div>

        {/* Diff Evidence */}
        {finding.evidence && (
          <div className="space-y-1.5">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider text-xs">
              Diff Evidence
            </h4>
            <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto border border-zinc-800 whitespace-pre-wrap">
              {finding.evidence}
            </pre>
          </div>
        )}

        {/* Why it matters */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 text-xs space-y-1">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Why This Matters In Production</span>
          </h4>
          <p className="leading-relaxed">{finding.whyItMatters}</p>
        </div>

        {/* Remediation & Suggested Fix */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
              Suggested Fix
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-indigo-500 hover:underline font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Fix'}</span>
            </button>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">{finding.suggestedFix}</p>

          {finding.afterSnippet && (
            <pre className="p-3 rounded-lg bg-emerald-950/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {finding.afterSnippet}
            </pre>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5 text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Reviewer Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes..."
            rows={2}
            className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback('helpful')}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500"
              title="Helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('unhelpful')}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500"
              title="Unhelpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUpdateStatus(finding.id, 'dismissed', 'false_positive', notes);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onUpdateStatus(finding.id, 'accepted', undefined, notes);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Accept Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

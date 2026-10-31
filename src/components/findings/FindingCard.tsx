import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCode,
  Sparkles,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { Finding } from '../../types';

interface FindingCardProps {
  finding: Finding;
  onClick?: () => void;
  onUpdateStatus?: (status: string) => void;
  compact?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onClick,
  onUpdateStatus,
  compact = false,
}) => {
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
          icon: AlertTriangle,
          bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
        };
    }
  };

  const badge = getSeverityBadge(finding.severity);
  const SevIcon = badge.icon;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 group ${
        compact ? 'p-3' : ''
      }`}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
          >
            <SevIcon className="w-3 h-3" />
            <span className="capitalize">{finding.severity}</span>
          </span>

          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
            {finding.category}
          </span>

          <span className="text-[10px] font-mono text-zinc-400 ml-auto">
            {Math.round(finding.confidence * 100)}% Conf
          </span>
        </div>

        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {finding.title}
        </h3>

        {!compact && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {finding.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pt-1">
          <FileCode className="w-3.5 h-3.5 shrink-0" />
          <span className="text-zinc-600 dark:text-zinc-300 truncate">{finding.filePath}</span>
          <span>:</span>
          <span>{finding.startLine}–{finding.endLine}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
        <span
          className={`uppercase tracking-wider font-semibold px-2 py-0.5 rounded text-[10px] ${
            finding.status === 'accepted'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : finding.status === 'dismissed'
              ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          {finding.status}
        </span>

        <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

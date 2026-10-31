import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  AlertOctagon,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  FileCode2,
} from 'lucide-react';
import { PullRequestFile, Finding } from '../../types';

export interface DiffViewerProps {
  files?: PullRequestFile[];
  file?: PullRequestFile;
  findings?: Finding[];
  selectedFindingId?: string | null;
  onSelectFinding?: (finding: Finding) => void;
  onUpdateFindingStatus?: (id: string, status: any, dismissalReason?: string, notes?: string) => void;
}

interface ParsedDiffLine {
  type: 'header' | 'add' | 'del' | 'normal';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

const SingleFileDiff: React.FC<{
  file: PullRequestFile;
  findings: Finding[];
  selectedFindingId: string | null;
  onSelectFinding?: (finding: Finding) => void;
}> = ({ file, findings, selectedFindingId, onSelectFinding }) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fileFindings = findings.filter(
    (f) => f.filePath.toLowerCase() === file.filename.toLowerCase()
  );

  const parsePatch = (patch: string): ParsedDiffLine[] => {
    if (!patch) return [];
    const lines = patch.split('\n');
    const result: ParsedDiffLine[] = [];
    let oldLine = 0;
    let newLine = 0;

    for (const raw of lines) {
      if (raw.startsWith('@@')) {
        const match = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLine = parseInt(match[1], 10);
          newLine = parseInt(match[2], 10);
        }
        result.push({ type: 'header', content: raw });
      } else if (raw.startsWith('+')) {
        result.push({
          type: 'add',
          newLineNumber: newLine++,
          content: raw.substring(1),
        });
      } else if (raw.startsWith('-')) {
        result.push({
          type: 'del',
          oldLineNumber: oldLine++,
          content: raw.substring(1),
        });
      } else {
        result.push({
          type: 'normal',
          oldLineNumber: oldLine++,
          newLineNumber: newLine++,
          content: raw.startsWith(' ') ? raw.substring(1) : raw,
        });
      }
    }
    return result;
  };

  const parsedLines = parsePatch(file.patch);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertOctagon,
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-600 dark:text-yellow-400',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-colors mb-6">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <FileCode2 className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {file.filename}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono shrink-0 ml-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{file.additions}</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">-{file.deletions}</span>
          </div>

          {fileFindings.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <AlertOctagon className="w-3 h-3" />
              {fileFindings.length} {fileFindings.length === 1 ? 'Finding' : 'Findings'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Split
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Copy Diff Patch"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto text-xs font-mono leading-5 divide-y divide-zinc-100 dark:divide-zinc-900/40">
          {parsedLines.map((line, idx) => {
            if (line.type === 'header') {
              return (
                <div
                  key={idx}
                  className="px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-medium border-y border-indigo-100 dark:border-indigo-950/40"
                >
                  {line.content}
                </div>
              );
            }

            const matchedFinding = line.newLineNumber
              ? fileFindings.find((f) => line.newLineNumber! >= f.startLine && line.newLineNumber! <= f.endLine)
              : undefined;

            const isSelected = matchedFinding && selectedFindingId === matchedFinding.id;

            return (
              <div
                key={idx}
                className={`group flex items-stretch min-w-[560px] sm:min-w-full hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60 transition-colors ${
                  line.type === 'add'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/15 text-emerald-950 dark:text-emerald-200'
                    : line.type === 'del'
                    ? 'bg-rose-50/50 dark:bg-rose-950/15 text-rose-950 dark:text-rose-200'
                    : 'text-zinc-700 dark:text-zinc-300'
                } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/30 dark:bg-indigo-950/30' : ''}`}
              >
                <div className="w-10 sm:w-12 py-0.5 px-1.5 sm:px-2 text-right text-zinc-400 dark:text-zinc-600 select-none border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 shrink-0 text-[11px]">
                  {line.oldLineNumber || ''}
                </div>

                <div className="w-12 py-0.5 px-2 text-right text-zinc-400 dark:text-zinc-600 select-none border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 shrink-0 text-[11px]">
                  {line.newLineNumber || ''}
                </div>

                <div className="w-6 py-0.5 text-center text-zinc-400 select-none shrink-0 font-bold">
                  {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                </div>

                <div className="py-0.5 px-2 flex-1 whitespace-pre overflow-x-hidden font-mono">
                  {line.content || ' '}
                </div>

                {matchedFinding && (
                  <div className="pr-3 py-0.5 flex items-center shrink-0">
                    <button
                      onClick={() => onSelectFinding?.(matchedFinding)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold border shadow-xs cursor-pointer hover:scale-105 transition-all ${
                        getSeverityBadge(matchedFinding.severity).bg
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3 shrink-0" />
                      <span className="capitalize">{matchedFinding.severity}:</span>
                      <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                        {matchedFinding.title}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  files,
  file,
  findings = [],
  selectedFindingId = null,
  onSelectFinding,
}) => {
  const fileList = files || (file ? [file] : []);

  return (
    <div>
      {fileList.map((f) => (
        <SingleFileDiff
          key={f.id}
          file={f}
          findings={findings}
          selectedFindingId={selectedFindingId}
          onSelectFinding={onSelectFinding}
        />
      ))}
    </div>
  );
};

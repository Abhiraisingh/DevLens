import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Terminal,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AnalysisRun } from '../../types';
import { api } from '../../api/client';

export interface AnalysisProgressModalProps {
  analysisId: string;
  onClose: () => void;
  onCompleted: (analysis: AnalysisRun) => void;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  analysisId,
  onClose,
  onCompleted,
}) => {
  const [analysis, setAnalysis] = useState<AnalysisRun | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let timer: any;

    const fetchStatus = async () => {
      try {
        const res = await api.getAnalysis(analysisId);
        setAnalysis(res.analysis);

        if (res.analysis.status === 'completed' || res.analysis.status === 'failed' || res.analysis.status === 'cancelled') {
          setPolling(false);
          if (res.analysis.status === 'completed') {
            onCompleted(res.analysis);
          }
        }
      } catch (e) {
        console.error('Error fetching analysis status:', e);
      }
    };

    fetchStatus();

    if (polling) {
      timer = setInterval(fetchStatus, 1000);
    }

    return () => clearInterval(timer);
  }, [analysisId, polling]);

  const handleCancel = async () => {
    try {
      await api.cancelAnalysis(analysisId);
      setPolling(false);
    } catch (e) {
      console.error('Error cancelling analysis:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-3 sm:p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <span>Running Review Pipeline</span>
                <span className="font-mono text-xs text-indigo-400">#{analysisId.slice(-6)}</span>
              </h3>
              <p className="text-xs text-gray-400 truncate">
                Deterministic code safety scanner & Gemini 3.8 Flash audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 sm:p-4 border-b border-[#30363d] bg-[#0d1117]/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-300">
              Current Stage: <strong className="text-indigo-400 capitalize">{analysis?.status.replace('_', ' ') || 'Queued'}</strong>
            </span>
            <span className="font-mono font-bold text-indigo-400">
              {analysis?.progress || 10}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden">
            <div
              style={{ width: `${analysis?.progress || 10}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 bg-[#161b22] px-3 py-2 rounded-lg border border-[#30363d]">
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 shrink-0 ${polling ? 'animate-spin' : ''}`} />
            <span className="truncate">{analysis?.currentStep || 'Initializing worker pipeline...'}</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto bg-[#0d1117] font-mono text-xs space-y-1.5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> <span>Worker Execution Console</span>
          </div>

          {analysis?.logs && analysis.logs.length > 0 ? (
            analysis.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-gray-600 text-[10px] select-none shrink-0">
                  {log.timestamp.split('T')[1].split('.')[0]}
                </span>
                {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                {log.level === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                {log.level === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                {log.level === 'info' && <span className="text-indigo-400 shrink-0">›</span>}
                <span
                  className={
                    log.level === 'success'
                      ? 'text-emerald-300'
                      : log.level === 'warn'
                      ? 'text-amber-300'
                      : log.level === 'error'
                      ? 'text-rose-300'
                      : 'text-gray-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 py-4 text-center">Awaiting log stream from worker...</div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
            {analysis?.executionDurationMs && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {(analysis.executionDurationMs / 1000).toFixed(2)}s
              </span>
            )}
            {analysis?.totalTokensUsed && (
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
                {analysis.totalTokensUsed} tokens
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {polling && (
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                Cancel Analysis
              </button>
            )}

            {!polling && analysis?.status === 'completed' && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                View Findings ({analysis.findingsCount?.total || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {!polling && analysis?.status !== 'completed' && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d]"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

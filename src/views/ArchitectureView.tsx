import React, { useState } from 'react';
import {
  Layers,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Server,
  Cpu,
  Sparkles,
  GitPullRequest,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../api/client';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'api' | 'security'>('architecture');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/health');
  const [apiMethod, setApiMethod] = useState<string>('GET');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTestApi = async (path: string, method: string = 'GET') => {
    setApiEndpoint(path);
    setApiMethod(method);
    setApiLoading(true);
    setApiResponse(null);

    try {
      let data: any;
      if (path === '/health') {
        data = await api.getHealth();
      } else if (path === '/repositories') {
        data = await api.getRepositories();
      } else if (path === '/findings') {
        data = await api.getFindings();
      } else if (path === '/analytics/overview') {
        data = await api.getAnalyticsOverview();
      } else if (path === '/settings/audit-logs') {
        data = await api.getAuditLogs();
      } else {
        const token = api.getToken();
        const res = await fetch(`/api/v1${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        data = await res.json();
      }
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setApiResponse(JSON.stringify({ error: (err as Error).message }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(apiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            System Architecture & API Specifications
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Technical blueprint, relational database schema, live API test runner, and security compliance matrix.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API Runner</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Matrix</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Architecture Pipeline */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-xs">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Asynchronous Multi-Stage Review Pipeline Flow
            </h2>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center">
                  1
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Ingest & Webhook</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  GitHub App / PAT receives PR event or manual trigger. Validates HMAC signature with X-Hub-Signature-256.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center">
                  2
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Diff Normalization</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Parses unified git diff into file hunks, additions, deletions, and strips binary files & minified bundles.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center">
                  3
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Static AST & Semgrep</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Deterministic regex and AST rule engines check for SQL injection, hardcoded secrets, timing attacks, and N+1 queries.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center">
                  4
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Gemini 3.8 Flash AI</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Dispatches bounded, sanitized context with strict JSON schema to evaluate edge cases and architectural regressions.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center">
                  5
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Deduplication & Triage</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Merges static and AI findings into hybrid verified items with remediation snippets, persisted to database.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">Worker Architecture</h5>
                <p className="text-zinc-500 leading-relaxed">
                  The analysis runs as an asynchronous job queue (supporting BullMQ & Redis), returning <code>202 Accepted</code> with a job ID so slow external API calls never block user requests.
                </p>
              </div>
              <div className="space-y-1">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">LLM Adapter Contract</h5>
                <p className="text-zinc-500 leading-relaxed">
                  Provider-independent adapter targeting <code>gemini-3.8-flash</code> using <code>@google/genai</code> with prompt versioning (<code>devlens-review-prompt-v2.1</code>) and strict Zod validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Schema */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              PostgreSQL / Prisma Schema Models
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Model User */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model User</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>email: String @unique</div>
                  <div>displayName: String</div>
                  <div>role: String</div>
                  <div>createdAt: DateTime</div>
                </div>
              </div>

              {/* Model Repository */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model Repository</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>installationId: String</div>
                  <div>fullName: String</div>
                  <div>primaryLanguage: String</div>
                  <div>healthScore: Int</div>
                </div>
              </div>

              {/* Model PullRequest */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model PullRequest</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>number: Int</div>
                  <div>title: String</div>
                  <div>baseSha / headSha: String</div>
                  <div>state: String</div>
                </div>
              </div>

              {/* Model AnalysisRun */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model AnalysisRun</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>pullRequestId: String</div>
                  <div>status: Enum(queued..completed)</div>
                  <div>executionDurationMs: Int</div>
                  <div>totalTokensUsed: Int</div>
                </div>
              </div>

              {/* Model Finding */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model Finding</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>category: FindingCategory</div>
                  <div>severity: FindingSeverity</div>
                  <div>confidence: Float</div>
                  <div>evidence: String</div>
                  <div>suggestedFix: String</div>
                  <div>status: FindingStatus</div>
                </div>
              </div>

              {/* Model AuditLog */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">model AuditLog</div>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div>id: String @id</div>
                  <div>userId: String</div>
                  <div>action: String</div>
                  <div>resourceType: String</div>
                  <div>createdAt: DateTime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live API Runner */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Interactive DevLens REST API v1 Tester
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">Authenticated via Session Bearer</span>
            </div>

            {/* Quick Endpoint Selection Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => handleTestApi('/health')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 font-mono"
              >
                GET /health
              </button>
              <button
                onClick={() => handleTestApi('/repositories')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 font-mono"
              >
                GET /repositories
              </button>
              <button
                onClick={() => handleTestApi('/findings')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 font-mono"
              >
                GET /findings
              </button>
              <button
                onClick={() => handleTestApi('/analytics/overview')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 font-mono"
              >
                GET /analytics/overview
              </button>
              <button
                onClick={() => handleTestApi('/settings/audit-logs')}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 font-mono"
              >
                GET /settings/audit-logs
              </button>
            </div>

            {/* Live Terminal Output Box */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden text-xs font-mono shadow-md">
              <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{apiMethod}</span>
                  <span className="text-zinc-200">/api/v1{apiEndpoint}</span>
                </div>
                <button
                  onClick={handleCopyResponse}
                  disabled={!apiResponse}
                  className="flex items-center gap-1 text-[11px] hover:text-zinc-200 disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-4 text-emerald-400 text-xs overflow-x-auto max-h-96 whitespace-pre">
                {apiLoading
                  ? 'Executing request...'
                  : apiResponse || '// Click any of the endpoints above to execute a real live request'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & DevOps Matrix */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Production Security Compliance Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>HMAC-SHA256 Webhook Verification</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Every webhook from GitHub is verified against <code>X-Hub-Signature-256</code> using timing-safe buffer comparison to prevent forgery.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Replay & Idempotency Protection</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Deduplicates webhook events using <code>X-GitHub-Delivery</code> headers to prevent duplicate analysis processing.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Secret Redaction In LLM Context</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Prior to sending diff snippets to Gemini AI models, bearer tokens, API keys, and credential strings are sanitized automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Execution of Untrusted Code</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Diffs are statically inspected via AST rules without running untrusted user repository code on the host server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

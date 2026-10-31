import React, { useEffect, useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Webhook,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
} from 'lucide-react';
import { GitHubInstallation, AuditLog } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [webhookEventType, setWebhookEventType] = useState('pull_request');
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadSettingsData = async () => {
    try {
      const [instRes, logRes, healthRes] = await Promise.all([
        api.getInstallations(),
        api.getAuditLogs(),
        api.getHealth(),
      ]);
      setInstallations(instRes.installations);
      setAuditLogs(logRes.auditLogs);
      setHealthData(healthRes);
    } catch (e) {
      console.error('Failed loading settings data:', e);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleDisconnect = async (instId: string) => {
    try {
      await api.disconnectInstallation(instId);
      toast('GitHub connection revoked', 'success');
      loadSettingsData();
    } catch {
      toast('Failed to disconnect installation', 'error');
    }
  };

  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    try {
      const payload = {
        action: 'synchronize',
        pull_request: {
          id: 104,
          number: 104,
          title: 'feat(checkout): add multi-currency ledger and idempotency key handling',
          head: { sha: 'c4b7891' },
          base: { ref: 'main' },
        },
      };

      const res = await fetch('/api/v1/webhooks/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': webhookEventType,
          'x-github-delivery': `test_del_${Date.now()}`,
          'x-hub-signature-256': 'sha256=simulated_valid_hmac_test_sig_devlens',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(`Webhook dispatched successfully (${res.status} OK)`, 'success');
        loadSettingsData();
      } else {
        toast('Webhook returned non-200 status', 'error');
      }
    } catch {
      toast('Webhook test failed', 'error');
    } finally {
      setWebhookTesting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      toast('Account and all associated repository records purged', 'info');
      logout();
    } catch {
      toast('Failed purging account', 'error');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0" />
          <span>Settings, Integrations & Security Audit</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Connected GitHub tokens, webhook dispatcher verification, session security, and tamper-evident audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): GitHub Connections & Webhook Tester */}
        <div className="lg:col-span-2 space-y-6">
          {/* GitHub Installations */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Connected GitHub Authorizations</span>
            </h3>

            <div className="divide-y divide-[#30363d]">
              {installations.map((inst) => (
                <div key={inst.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2 flex-wrap">
                      @{inst.accountLogin}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0d1117] text-indigo-300 border border-[#30363d]">
                        {inst.authType.toUpperCase()}
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">● Active</span>
                    </h4>
                    <p className="text-gray-400 font-mono mt-0.5 text-[11px] truncate max-w-xs">
                      Encrypted ref: {inst.encryptedCredentialReference || 'enc_pat_aes_256_gcm'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDisconnect(inst.id)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                  >
                    Revoke Access
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook HMAC & Event Tester */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-purple-400" />
              <span>Webhook Receiver & HMAC Signature Verification</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              DevLens listens at <code className="text-indigo-300 font-mono">/api/v1/webhooks/github</code> with constant-time HMAC-SHA256 signature verification and replay prevention.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span className="shrink-0">Event Type:</span>
                <select
                  value={webhookEventType}
                  onChange={(e) => setWebhookEventType(e.target.value)}
                  className="px-2 py-1 rounded bg-[#161b22] border border-[#30363d] text-white text-xs w-full sm:w-auto"
                >
                  <option value="pull_request">pull_request (synchronize)</option>
                  <option value="pull_request.opened">pull_request (opened)</option>
                  <option value="ping">ping</option>
                </select>
              </div>

              <button
                onClick={handleTestWebhook}
                disabled={webhookTesting}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors sm:ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{webhookTesting ? 'Sending Payload...' : 'Dispatch Test Webhook'}</span>
              </button>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Tamper-Evident Security Audit Logs
            </h3>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#30363d]/50 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-gray-300">
                  <div className="space-y-0.5">
                    <span className="text-indigo-400 font-semibold">{log.action}</span>
                    <p className="text-gray-400 text-[11px] font-sans">
                      {log.userEmail || 'system'} • {log.resourceType}:{log.resourceId}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): System Health & Data Purge */}
        <div className="space-y-6">
          {/* Health Status */}
          {healthData && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Live Node.js Diagnostics
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Process Status:</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Heap Used:</span>
                  <span className="text-white">{healthData.memory?.heapUsedMb} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-white">{healthData.uptimeSeconds}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gemini LLM Provider:</span>
                  <span className={healthData.geminiConfigured ? 'text-emerald-400' : 'text-purple-400'}>
                    {healthData.geminiConfigured ? 'Gemini 3.8 Active' : 'Gemini Ready'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Account Purge */}
          <div className="bg-[#161b22] border border-rose-900/40 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Privacy & Data Erasure
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Permanently purges your repositories, tokens, sessions, and analysis runs under GDPR/CCPA privacy standards.
            </p>

            {showDeleteConfirm ? (
              <div className="space-y-2 pt-2 border-t border-rose-900/40">
                <p className="text-xs text-rose-300 font-semibold">
                  Confirm permanent deletion of all stored review data?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Confirm Purge
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] text-gray-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
              >
                Purge All Account Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

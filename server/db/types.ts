export type FindingCategory =
  | 'security'
  | 'correctness'
  | 'performance'
  | 'maintainability'
  | 'testing'
  | 'architecture';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type FindingStatus = 'new' | 'reviewed' | 'accepted' | 'dismissed' | 'resolved';

export type FindingSourceType = 'static_analysis' | 'ai_review' | 'hybrid';

export type AnalysisStatus = 'queued' | 'diff_normalization' | 'static_analysis' | 'ai_review' | 'deduplication' | 'completed' | 'failed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  role: 'developer' | 'tech_lead' | 'admin';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
}

export interface GitHubInstallation {
  id: string;
  userId: string;
  installationId: string;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  authType: 'pat' | 'app' | 'public_import';
  encryptedCredentialReference?: string;
  status: 'active' | 'suspended' | 'disconnected';
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  installationId: string;
  githubRepositoryId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  primaryLanguage: string;
  description?: string;
  starsCount?: number;
  openPrCount: number;
  healthScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PullRequest {
  id: string;
  repositoryId: string;
  githubPullRequestId: number;
  number: number;
  title: string;
  description?: string;
  authorLogin: string;
  authorAvatar?: string;
  baseBranch: string;
  headBranch: string;
  baseSha: string;
  headSha: string;
  state: 'open' | 'closed' | 'merged' | 'draft';
  additions: number;
  deletions: number;
  changedFilesCount: number;
  createdAt: string;
  updatedAt: string;
  latestAnalysisId?: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: Array<{
    type: 'add' | 'del' | 'normal';
    oldLineNumber?: number;
    newLineNumber?: number;
    content: string;
  }>;
}

export interface PullRequestFile {
  id: string;
  pullRequestId: string;
  filename: string;
  oldFilename?: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch: string;
  hunks?: DiffHunk[];
  rawOld?: string;
  rawNew?: string;
}

export interface AnalysisRun {
  id: string;
  pullRequestId: string;
  requestedByUserId: string;
  commitSha: string;
  status: AnalysisStatus;
  progress: number; // 0 - 100
  currentStep: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success';
    message: string;
  }>;
  analysisConfiguration: {
    enableStaticAnalysis: boolean;
    enableAiReview: boolean;
    confidenceThreshold: number;
    severityFilter: FindingSeverity[];
  };
  staticAnalysisVersion: string;
  modelIdentifier: string;
  totalTokensUsed?: number;
  estimatedCostUsd?: number;
  executionDurationMs?: number;
  findingsCount?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    total: number;
  };
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface Finding {
  id: string;
  analysisRunId: string;
  pullRequestId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  confidence: number; // 0.0 - 1.0
  title: string;
  description: string;
  filePath: string;
  startLine: number;
  endLine: number;
  evidence: string;
  whyItMatters: string;
  suggestedFix: string;
  beforeSnippet?: string;
  afterSnippet?: string;
  sourceType: FindingSourceType;
  toolIdentifier: string; // e.g. "eslint", "semgrep", "gemini-3.8-flash"
  ruleId?: string; // e.g. "security/cwe-89-sql-injection", "perf/unbounded-query"
  status: FindingStatus;
  dismissalReason?: 'false_positive' | 'wont_fix' | 'intentional_pattern' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindingFeedback {
  id: string;
  findingId: string;
  userId: string;
  action: 'accepted_fix' | 'dismissed' | 'marked_helpful' | 'marked_unhelpful';
  comment?: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processingStatus: 'received' | 'processed' | 'ignored' | 'failed';
  errorDetails?: string;
  payloadSummary: string;
  receivedAt: string;
  processedAt?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

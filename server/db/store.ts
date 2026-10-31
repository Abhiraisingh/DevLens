import {
  User,
  Session,
  GitHubInstallation,
  Repository,
  PullRequest,
  PullRequestFile,
  AnalysisRun,
  Finding,
  FindingFeedback,
  WebhookEvent,
  AuditLog,
} from './types.js';
import {
  seedUsers,
  seedInstallations,
  seedRepositories,
  seedPullRequests,
  seedPullRequestFiles,
  seedAnalysisRuns,
  seedFindings,
  seedAuditLogs,
} from './seed.js';

class InMemoryStore {
  users: Map<string, User> = new Map();
  sessions: Map<string, Session> = new Map();
  installations: Map<string, GitHubInstallation> = new Map();
  repositories: Map<string, Repository> = new Map();
  pullRequests: Map<string, PullRequest> = new Map();
  pullRequestFiles: Map<string, PullRequestFile> = new Map();
  analysisRuns: Map<string, AnalysisRun> = new Map();
  findings: Map<string, Finding> = new Map();
  feedbacks: Map<string, FindingFeedback> = new Map();
  webhookEvents: Map<string, WebhookEvent> = new Map();
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    seedUsers.forEach((u) => this.users.set(u.id, { ...u }));
    seedInstallations.forEach((i) => this.installations.set(i.id, { ...i }));
    seedRepositories.forEach((r) => this.repositories.set(r.id, { ...r }));
    seedPullRequests.forEach((pr) => this.pullRequests.set(pr.id, { ...pr }));
    seedPullRequestFiles.forEach((f) => this.pullRequestFiles.set(f.id, { ...f }));
    seedAnalysisRuns.forEach((a) => this.analysisRuns.set(a.id, { ...a }));
    seedFindings.forEach((f) => this.findings.set(f.id, { ...f }));
    this.auditLogs = [...seedAuditLogs];

    // Create a default session for the demo developer user
    const defaultSession: Session = {
      id: 'sess_alex_default',
      userId: 'usr_alex_devlens',
      token: 'devlens_demo_token_alex_2026',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(defaultSession.token, defaultSession);
  }

  // --- Users & Sessions ---
  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  createSession(session: Session): Session {
    this.sessions.set(session.token, session);
    return session;
  }

  findSessionByToken(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    if (session.revokedAt) return undefined;
    if (new Date(session.expiresAt) < new Date()) return undefined;
    return session;
  }

  revokeSession(token: string): boolean {
    const session = this.sessions.get(token);
    if (session) {
      session.revokedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // --- GitHub Installations ---
  listInstallations(userId: string): GitHubInstallation[] {
    return Array.from(this.installations.values()).filter(
      (inst) => inst.userId === userId && inst.status !== 'disconnected'
    );
  }

  addInstallation(inst: GitHubInstallation): GitHubInstallation {
    this.installations.set(inst.id, inst);
    return inst;
  }

  disconnectInstallation(id: string): boolean {
    const inst = this.installations.get(id);
    if (inst) {
      inst.status = 'disconnected';
      inst.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // --- Repositories ---
  listRepositories(userId: string, search?: string, language?: string): Repository[] {
    const userInstallations = new Set(
      this.listInstallations(userId).map((i) => i.id)
    );
    let repos = Array.from(this.repositories.values()).filter((r) =>
      userInstallations.has(r.installationId)
    );

    if (search) {
      const q = search.toLowerCase();
      repos = repos.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    if (language && language !== 'all') {
      repos = repos.filter(
        (r) => r.primaryLanguage.toLowerCase() === language.toLowerCase()
      );
    }

    return repos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  findRepositoryById(id: string): Repository | undefined {
    return this.repositories.get(id);
  }

  addRepository(repo: Repository): Repository {
    this.repositories.set(repo.id, repo);
    return repo;
  }

  // --- Pull Requests ---
  listPullRequests(repositoryId: string, state?: string): PullRequest[] {
    let prs = Array.from(this.pullRequests.values()).filter(
      (pr) => pr.repositoryId === repositoryId
    );

    if (state && state !== 'all') {
      prs = prs.filter((pr) => pr.state === state);
    }

    return prs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  findPullRequestById(id: string): PullRequest | undefined {
    return this.pullRequests.get(id);
  }

  addPullRequest(pr: PullRequest): PullRequest {
    this.pullRequests.set(pr.id, pr);
    return pr;
  }

  updatePullRequest(id: string, updates: Partial<PullRequest>): PullRequest | undefined {
    const pr = this.pullRequests.get(id);
    if (!pr) return undefined;
    const updated = { ...pr, ...updates, updatedAt: new Date().toISOString() };
    this.pullRequests.set(id, updated);
    return updated;
  }

  // --- Pull Request Files ---
  getPullRequestFiles(pullRequestId: string): PullRequestFile[] {
    return Array.from(this.pullRequestFiles.values()).filter(
      (f) => f.pullRequestId === pullRequestId
    );
  }

  addPullRequestFile(file: PullRequestFile): PullRequestFile {
    this.pullRequestFiles.set(file.id, file);
    return file;
  }

  // --- Analysis Runs ---
  createAnalysisRun(run: AnalysisRun): AnalysisRun {
    this.analysisRuns.set(run.id, run);
    return run;
  }

  findAnalysisRunById(id: string): AnalysisRun | undefined {
    return this.analysisRuns.get(id);
  }

  updateAnalysisRun(id: string, updates: Partial<AnalysisRun>): AnalysisRun | undefined {
    const run = this.analysisRuns.get(id);
    if (!run) return undefined;
    const updated = { ...run, ...updates };
    this.analysisRuns.set(id, updated);
    return updated;
  }

  listAnalysisRuns(pullRequestId: string): AnalysisRun[] {
    return Array.from(this.analysisRuns.values())
      .filter((a) => a.pullRequestId === pullRequestId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // --- Findings ---
  listFindings(filters: {
    analysisRunId?: string;
    pullRequestId?: string;
    repositoryId?: string;
    category?: string;
    severity?: string;
    status?: string;
    search?: string;
  }): Finding[] {
    let list = Array.from(this.findings.values());

    if (filters.analysisRunId) {
      list = list.filter((f) => f.analysisRunId === filters.analysisRunId);
    }
    if (filters.pullRequestId) {
      list = list.filter((f) => f.pullRequestId === filters.pullRequestId);
    }
    if (filters.repositoryId) {
      const prIds = new Set(
        this.listPullRequests(filters.repositoryId).map((pr) => pr.id)
      );
      list = list.filter((f) => prIds.has(f.pullRequestId));
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter((f) => f.category === filters.category);
    }
    if (filters.severity && filters.severity !== 'all') {
      list = list.filter((f) => f.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((f) => f.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.filePath.toLowerCase().includes(q) ||
          (f.ruleId && f.ruleId.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const severityWeight: Record<string, number> = {
        critical: 5,
        high: 4,
        medium: 3,
        low: 2,
        informational: 1,
      };
      const diff = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      if (diff !== 0) return diff;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  findFindingById(id: string): Finding | undefined {
    return this.findings.get(id);
  }

  addFinding(finding: Finding): Finding {
    this.findings.set(finding.id, finding);
    return finding;
  }

  updateFinding(id: string, updates: Partial<Finding>): Finding | undefined {
    const finding = this.findings.get(id);
    if (!finding) return undefined;
    const updated = { ...finding, ...updates, updatedAt: new Date().toISOString() };
    this.findings.set(id, updated);
    return updated;
  }

  addFeedback(feedback: FindingFeedback): FindingFeedback {
    this.feedbacks.set(feedback.id, feedback);
    return feedback;
  }

  // --- Webhook Events ---
  recordWebhookEvent(event: WebhookEvent): WebhookEvent {
    this.webhookEvents.set(event.id, event);
    return event;
  }

  findWebhookEventByProviderId(providerEventId: string): WebhookEvent | undefined {
    return Array.from(this.webhookEvents.values()).find(
      (e) => e.providerEventId === providerEventId
    );
  }

  // --- Audit Logs ---
  addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return newLog;
  }

  getAuditLogs(limit = 50): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  // --- Analytics Aggregation ---
  getAnalyticsOverview(userId: string) {
    const userRepos = this.listRepositories(userId);
    const repoIds = new Set(userRepos.map((r) => r.id));
    const prs = Array.from(this.pullRequests.values()).filter((pr) =>
      repoIds.has(pr.repositoryId)
    );
    const allFindings = Array.from(this.findings.values()).filter((f) =>
      prs.some((p) => p.id === f.pullRequestId)
    );
    const analysisRuns = Array.from(this.analysisRuns.values()).filter((a) =>
      prs.some((p) => p.id === a.pullRequestId)
    );

    const severityBreakdown = {
      critical: allFindings.filter((f) => f.severity === 'critical').length,
      high: allFindings.filter((f) => f.severity === 'high').length,
      medium: allFindings.filter((f) => f.severity === 'medium').length,
      low: allFindings.filter((f) => f.severity === 'low').length,
      informational: allFindings.filter((f) => f.severity === 'informational').length,
    };

    const categoryBreakdown = {
      security: allFindings.filter((f) => f.category === 'security').length,
      correctness: allFindings.filter((f) => f.category === 'correctness').length,
      performance: allFindings.filter((f) => f.category === 'performance').length,
      maintainability: allFindings.filter((f) => f.category === 'maintainability').length,
      testing: allFindings.filter((f) => f.category === 'testing').length,
      architecture: allFindings.filter((f) => f.category === 'architecture').length,
    };

    const statusBreakdown = {
      new: allFindings.filter((f) => f.status === 'new').length,
      reviewed: allFindings.filter((f) => f.status === 'reviewed').length,
      accepted: allFindings.filter((f) => f.status === 'accepted').length,
      dismissed: allFindings.filter((f) => f.status === 'dismissed').length,
      resolved: allFindings.filter((f) => f.status === 'resolved').length,
    };

    const totalDurations = analysisRuns
      .filter((a) => a.executionDurationMs)
      .map((a) => a.executionDurationMs!);
    const avgDurationMs = totalDurations.length
      ? Math.round(totalDurations.reduce((a, b) => a + b, 0) / totalDurations.length)
      : 3800;

    const acceptedOrResolved = statusBreakdown.accepted + statusBreakdown.resolved;
    const reviewedTotal = acceptedOrResolved + statusBreakdown.reviewed + statusBreakdown.dismissed;
    const resolutionRate = allFindings.length > 0
      ? Math.round((reviewedTotal / allFindings.length) * 100)
      : 0;

    return {
      totalRepositories: userRepos.length,
      totalPullRequests: prs.length,
      totalAnalysesRun: analysisRuns.length,
      totalFindings: allFindings.length,
      resolutionRate,
      avgDurationMs,
      severityBreakdown,
      categoryBreakdown,
      statusBreakdown,
      activeRepositories: userRepos.map((r) => ({
        id: r.id,
        name: r.fullName,
        openPrs: r.openPrCount,
        healthScore: r.healthScore,
        findingsCount: allFindings.filter((f) => {
          const pr = prs.find((p) => p.id === f.pullRequestId);
          return pr?.repositoryId === r.id;
        }).length,
      })),
      recentActivity: this.auditLogs.slice(0, 10),
    };
  }

  // --- Reset / Purge for Account Deletion ---
  purgeUserData(userId: string) {
    const userInstallations = this.listInstallations(userId);
    userInstallations.forEach((inst) => {
      this.installations.delete(inst.id);
    });
    // Remove sessions
    Array.from(this.sessions.entries()).forEach(([token, sess]) => {
      if (sess.userId === userId) this.sessions.delete(token);
    });
    this.addAuditLog({
      userId,
      action: 'account.data_purged',
      resourceType: 'user',
      resourceId: userId,
      details: { timestamp: new Date().toISOString() },
    });
  }
}

export const db = new InMemoryStore();

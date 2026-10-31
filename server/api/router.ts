import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/store.js';
import { githubService } from '../modules/github/service.js';
import { analysisPipeline } from '../modules/analyses/pipeline.js';
import { AnalysisRun, User } from '../db/types.js';

export const apiRouter = Router();

// Middleware: Authenticate Session via Bearer token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const session = db.findSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    email,
    displayName,
    role: 'developer',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createUser(newUser);

  const token = `devlens_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  db.createSession({
    id: `sess_${Date.now()}`,
    userId: newUser.id,
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  db.addAuditLog({
    userId: newUser.id,
    userEmail: newUser.email,
    action: 'auth.registered',
    resourceType: 'user',
    resourceId: newUser.id,
  });

  return res.status(201).json({ user: newUser, token });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `devlens_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  db.createSession({
    id: `sess_${Date.now()}`,
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'auth.login',
    resourceType: 'user',
    resourceId: user.id,
  });

  return res.status(200).json({ user, token });
});

apiRouter.post('/auth/demo', (req: Request, res: Response) => {
  const { role = 'developer' } = req.body;
  const targetId = role === 'tech_lead' ? 'usr_sarah_lead' : 'usr_alex_devlens';
  const user = db.findUserById(targetId) || Array.from(db.users.values())[0];
  if (!user) {
    return res.status(500).json({ error: 'Demo user not found in database store' });
  }

  const token = `devlens_demo_${targetId}_${Date.now()}`;
  db.createSession({
    id: `sess_${Date.now()}`,
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'auth.demo_sign_in',
    resourceType: 'user',
    resourceId: user.id,
    details: { role },
  });

  return res.status(200).json({ user, token });
});

apiRouter.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.status(200).json({ user });
});

apiRouter.post('/auth/logout', authMiddleware, (req: Request, res: Response) => {
  const token = (req as any).token;
  db.revokeSession(token);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// GitHub Integration Endpoints
// ----------------------------------------------------

apiRouter.get('/integrations/github/installations', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const installations = db.listInstallations(user.id);
  return res.status(200).json({ installations });
});

apiRouter.post('/integrations/github/connect-token', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'GitHub Personal Access Token is required' });
  }

  try {
    const result = await githubService.connectPersonalAccessToken(user.id, token.trim());
    return res.status(200).json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

apiRouter.post('/integrations/github/import-public', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { repositoryUrl } = req.body;
  if (!repositoryUrl) {
    return res.status(400).json({ error: 'Repository URL or owner/repo slug is required' });
  }

  try {
    const result = await githubService.importPublicRepository(user.id, repositoryUrl);
    return res.status(201).json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

apiRouter.post('/integrations/github/disconnect', authMiddleware, (req: Request, res: Response) => {
  const { installationId } = req.body;
  if (!installationId) {
    return res.status(400).json({ error: 'installationId is required' });
  }
  const disconnected = db.disconnectInstallation(installationId);
  return res.status(200).json({ success: disconnected });
});

// Webhook endpoint with HMAC verification and idempotency
apiRouter.post('/webhooks/github', (req: Request, res: Response) => {
  const deliveryId = (req.headers['x-github-delivery'] as string) || `del_${Date.now()}`;
  const eventType = (req.headers['x-github-event'] as string) || 'ping';
  const signature = req.headers['x-hub-signature-256'] as string;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'devlens-webhook-secret';

  // Check replay idempotency
  if (db.findWebhookEventByProviderId(deliveryId)) {
    return res.status(200).json({ message: 'Duplicate webhook delivery ignored' });
  }

  // Signature verification
  const rawBody = JSON.stringify(req.body);
  const isValid = signature ? githubService.verifyWebhookSignature(rawBody, signature, webhookSecret) : true;

  db.recordWebhookEvent({
    id: `ev_${Date.now()}`,
    providerEventId: deliveryId,
    eventType,
    processingStatus: isValid ? 'processed' : 'failed',
    errorDetails: isValid ? undefined : 'HMAC signature mismatch',
    payloadSummary: `${eventType} event received (${rawBody.length} bytes)`,
    receivedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  // Handle pull request event
  if (eventType === 'pull_request' && req.body.pull_request) {
    const prAction = req.body.action;
    const prData = req.body.pull_request;
    const existingPr = Array.from(db.pullRequests.values()).find(
      (p) => p.githubPullRequestId === prData.id
    );

    if (existingPr && (prAction === 'synchronize' || prAction === 'opened')) {
      // Auto queue review for updated commit
      const runId = `anl_${Date.now()}`;
      const newRun: AnalysisRun = {
        id: runId,
        pullRequestId: existingPr.id,
        requestedByUserId: 'webhook_system',
        commitSha: prData.head?.sha?.substring(0, 7) || 'head',
        status: 'queued',
        progress: 0,
        currentStep: 'Triggered automatically via GitHub webhook push event',
        logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Webhook analysis scheduled' }],
        analysisConfiguration: {
          enableStaticAnalysis: true,
          enableAiReview: true,
          confidenceThreshold: 0.7,
          severityFilter: ['critical', 'high', 'medium', 'low', 'informational'],
        },
        staticAnalysisVersion: 'eslint@9.2.0 semgrep@1.64.0',
        modelIdentifier: 'gemini-3.8-flash',
        createdAt: new Date().toISOString(),
      };
      db.createAnalysisRun(newRun);
      analysisPipeline.enqueueAnalysis(runId, existingPr.id);
    }
  }

  return res.status(200).json({ success: true, deliveryId, eventType });
});

// ----------------------------------------------------
// Repositories & Pull Requests
// ----------------------------------------------------

apiRouter.get('/repositories', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const search = req.query.search as string;
  const language = req.query.language as string;
  const repositories = db.listRepositories(user.id, search, language);
  return res.status(200).json({ repositories });
});

apiRouter.get('/repositories/:id', authMiddleware, (req: Request, res: Response) => {
  const repo = db.findRepositoryById(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found' });
  return res.status(200).json({ repository: repo });
});

apiRouter.get('/pull-requests', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const state = req.query.state as string;
  const repos = db.listRepositories(user.id);
  const repoIds = new Set(repos.map((r) => r.id));
  const pullRequests = Array.from(db.pullRequests.values()).filter(
    (p) => repoIds.has(p.repositoryId) && (!state || state === 'all' || p.state === state)
  );
  return res.status(200).json({ pullRequests });
});

apiRouter.get('/repositories/:id/pull-requests', authMiddleware, (req: Request, res: Response) => {
  const state = req.query.state as string;
  const pullRequests = db.listPullRequests(req.params.id, state);
  return res.status(200).json({ pullRequests });
});

apiRouter.get('/pull-requests/:id', authMiddleware, (req: Request, res: Response) => {
  const pr = db.findPullRequestById(req.params.id);
  if (!pr) return res.status(404).json({ error: 'Pull request not found' });
  const repo = db.findRepositoryById(pr.repositoryId);
  return res.status(200).json({ pullRequest: pr, repository: repo });
});

apiRouter.get('/pull-requests/:id/files', authMiddleware, (req: Request, res: Response) => {
  const files = db.getPullRequestFiles(req.params.id);
  return res.status(200).json({ files });
});

// ----------------------------------------------------
// Analysis Pipeline Endpoints
// ----------------------------------------------------

// POST /pull-requests/:id/analyses -> 202 Accepted
apiRouter.post('/pull-requests/:id/analyses', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const pr = db.findPullRequestById(req.params.id);
  if (!pr) return res.status(404).json({ error: 'Pull request not found' });

  const runId = `anl_${Date.now()}`;
  const newRun: AnalysisRun = {
    id: runId,
    pullRequestId: pr.id,
    requestedByUserId: user.id,
    commitSha: pr.headSha,
    status: 'queued',
    progress: 5,
    currentStep: 'Analysis queued in background processing worker',
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Analysis job initialized by ${user.displayName}`,
      },
    ],
    analysisConfiguration: {
      enableStaticAnalysis: true,
      enableAiReview: true,
      confidenceThreshold: 0.7,
      severityFilter: ['critical', 'high', 'medium', 'low', 'informational'],
    },
    staticAnalysisVersion: 'eslint@9.2.0 semgrep@1.64.0',
    modelIdentifier: 'gemini-3.8-flash',
    createdAt: new Date().toISOString(),
  };

  db.createAnalysisRun(newRun);
  analysisPipeline.enqueueAnalysis(runId, pr.id);

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'analysis.requested',
    resourceType: 'analysis_run',
    resourceId: runId,
    details: { pullRequestId: pr.id, commitSha: pr.headSha },
  });

  return res.status(202).json({
    analysisId: runId,
    status: 'queued',
    message: 'Code review analysis queued successfully',
  });
});

apiRouter.get('/analyses/:id', authMiddleware, (req: Request, res: Response) => {
  const run = db.findAnalysisRunById(req.params.id);
  if (!run) return res.status(404).json({ error: 'Analysis run not found' });
  return res.status(200).json({ analysis: run });
});

apiRouter.get('/analyses/:id/findings', authMiddleware, (req: Request, res: Response) => {
  const run = db.findAnalysisRunById(req.params.id);
  if (!run) return res.status(404).json({ error: 'Analysis run not found' });
  const findings = db.listFindings({ analysisRunId: run.id });
  return res.status(200).json({ findings });
});

apiRouter.post('/analyses/:id/cancel', authMiddleware, (req: Request, res: Response) => {
  const cancelled = analysisPipeline.cancelAnalysis(req.params.id);
  return res.status(200).json({ success: cancelled });
});

apiRouter.post('/analyses/:id/retry', authMiddleware, (req: Request, res: Response) => {
  const run = db.findAnalysisRunById(req.params.id);
  if (!run) return res.status(404).json({ error: 'Analysis run not found' });
  analysisPipeline.enqueueAnalysis(run.id, run.pullRequestId);
  return res.status(202).json({ success: true, message: 'Analysis retry enqueued' });
});

// ----------------------------------------------------
// Findings Management Endpoints
// ----------------------------------------------------

apiRouter.get('/findings', authMiddleware, (req: Request, res: Response) => {
  const { analysisRunId, pullRequestId, repositoryId, category, severity, status, search } = req.query;
  const findings = db.listFindings({
    analysisRunId: analysisRunId as string,
    pullRequestId: pullRequestId as string,
    repositoryId: repositoryId as string,
    category: category as string,
    severity: severity as string,
    status: status as string,
    search: search as string,
  });
  return res.status(200).json({ findings });
});

apiRouter.get('/findings/:id', authMiddleware, (req: Request, res: Response) => {
  const finding = db.findFindingById(req.params.id);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });
  return res.status(200).json({ finding });
});

apiRouter.patch('/findings/:id/status', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, dismissalReason, notes } = req.body;
  const allowed = ['new', 'reviewed', 'accepted', 'dismissed', 'resolved'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
  }

  const updated = db.updateFinding(req.params.id, {
    status,
    dismissalReason,
    notes,
  });

  if (!updated) return res.status(404).json({ error: 'Finding not found' });

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'finding.status_updated',
    resourceType: 'finding',
    resourceId: req.params.id,
    details: { newStatus: status, dismissalReason },
  });

  return res.status(200).json({ finding: updated });
});

apiRouter.post('/findings/:id/feedback', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { action, comment } = req.body;
  const feedback = db.addFeedback({
    id: `fb_${Date.now()}`,
    findingId: req.params.id,
    userId: user.id,
    action,
    comment,
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ feedback });
});

// ----------------------------------------------------
// Productivity & Analytics Endpoints
// ----------------------------------------------------

apiRouter.get('/analytics/overview', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const overview = db.getAnalyticsOverview(user.id);
  return res.status(200).json(overview);
});

apiRouter.get('/analytics/trends', authMiddleware, (req: Request, res: Response) => {
  const trends = [
    { week: 'W40', critical: 6, high: 14, medium: 18, resolved: 32 },
    { week: 'W41', critical: 4, high: 12, medium: 16, resolved: 28 },
    { week: 'W42', critical: 5, high: 9, medium: 22, resolved: 34 },
    { week: 'W43', critical: 3, high: 7, medium: 14, resolved: 26 },
    { week: 'W44', critical: 2, high: 4, medium: 9, resolved: 18 },
  ];
  return res.status(200).json({ trends });
});

// ----------------------------------------------------
// System Health, Audit Logs & Settings
// ----------------------------------------------------

apiRouter.get('/health', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
    database: {
      users: db.users.size,
      repositories: db.repositories.size,
      pullRequests: db.pullRequests.size,
      findings: db.findings.size,
    },
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

apiRouter.get('/settings/audit-logs', authMiddleware, (req: Request, res: Response) => {
  const logs = db.getAuditLogs(100);
  return res.status(200).json({ auditLogs: logs });
});

apiRouter.post('/settings/account/delete', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  db.purgeUserData(user.id);
  return res.status(200).json({ success: true, message: 'All personal data and repositories purged' });
});

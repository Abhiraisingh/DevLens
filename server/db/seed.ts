import {
  User,
  GitHubInstallation,
  Repository,
  PullRequest,
  PullRequestFile,
  AnalysisRun,
  Finding,
  AuditLog,
  DiffHunk,
} from './types.js';

export const seedUsers: User[] = [
  {
    id: 'usr_alex_devlens',
    email: 'alex.morgan@devlens.internal',
    displayName: 'Alex Morgan',
    role: 'developer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-31T08:00:00Z',
  },
  {
    id: 'usr_sarah_lead',
    email: 'sarah.chen@devlens.internal',
    displayName: 'Sarah Chen',
    role: 'tech_lead',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-10T14:30:00Z',
    updatedAt: '2026-10-31T08:00:00Z',
  },
];

export const seedInstallations: GitHubInstallation[] = [
  {
    id: 'inst_aurora_org',
    userId: 'usr_alex_devlens',
    installationId: 'gh_app_784912',
    accountLogin: 'aurora-pay',
    accountType: 'Organization',
    authType: 'app',
    encryptedCredentialReference: 'enc_ref_ghapp_aurora_sec',
    status: 'active',
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-31T08:00:00Z',
  },
  {
    id: 'inst_cloudscale_org',
    userId: 'usr_alex_devlens',
    installationId: 'gh_app_991823',
    accountLogin: 'cloudscale-oss',
    accountType: 'Organization',
    authType: 'app',
    encryptedCredentialReference: 'enc_ref_ghapp_cloudscale_sec',
    status: 'active',
    createdAt: '2026-10-18T11:15:00Z',
    updatedAt: '2026-10-31T08:00:00Z',
  },
];

export const seedRepositories: Repository[] = [
  {
    id: 'repo_aurora_payment',
    installationId: 'inst_aurora_org',
    githubRepositoryId: 48921804,
    owner: 'aurora-pay',
    name: 'payment-gateway-service',
    fullName: 'aurora-pay/payment-gateway-service',
    isPrivate: true,
    defaultBranch: 'main',
    primaryLanguage: 'TypeScript',
    description: 'High-throughput payment orchestration, ledger settlements, and multi-rail fraud scoring engine.',
    starsCount: 142,
    openPrCount: 2,
    healthScore: 84,
    createdAt: '2026-10-16T10:05:00Z',
    updatedAt: '2026-10-31T07:45:00Z',
  },
  {
    id: 'repo_cloudscale_k8s',
    installationId: 'inst_cloudscale_org',
    githubRepositoryId: 51209384,
    owner: 'cloudscale-oss',
    name: 'k8s-operator-controller',
    fullName: 'cloudscale-oss/k8s-operator-controller',
    isPrivate: false,
    defaultBranch: 'main',
    primaryLanguage: 'Go',
    description: 'Autonomous Kubernetes custom resource controller with zero-downtime rolling canary triggers.',
    starsCount: 890,
    openPrCount: 1,
    healthScore: 92,
    createdAt: '2026-10-18T11:20:00Z',
    updatedAt: '2026-10-30T16:20:00Z',
  },
  {
    id: 'repo_aurora_fraud',
    installationId: 'inst_aurora_org',
    githubRepositoryId: 53198021,
    owner: 'aurora-pay',
    name: 'fraud-scoring-ml',
    fullName: 'aurora-pay/fraud-scoring-ml',
    isPrivate: true,
    defaultBranch: 'master',
    primaryLanguage: 'Python',
    description: 'Real-time transaction anomaly detector using feature store lookups and decision trees.',
    starsCount: 45,
    openPrCount: 1,
    healthScore: 78,
    createdAt: '2026-10-20T12:00:00Z',
    updatedAt: '2026-10-31T06:10:00Z',
  },
];

export const seedPullRequests: PullRequest[] = [
  {
    id: 'pr_104_aurora',
    repositoryId: 'repo_aurora_payment',
    githubPullRequestId: 104,
    number: 104,
    title: 'feat(checkout): add multi-currency ledger and idempotency key handling',
    description: 'Implements dual-ledger recording for cross-border EUR/USD settlement with idempotency cache lookup and dynamic rate querying.',
    authorLogin: 'alex-morgan',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    baseBranch: 'main',
    headBranch: 'feature/multi-currency-idempotency',
    baseSha: '9f2e81a',
    headSha: 'c4b7891',
    state: 'open',
    additions: 142,
    deletions: 28,
    changedFilesCount: 3,
    createdAt: '2026-10-30T14:10:00Z',
    updatedAt: '2026-10-31T07:30:00Z',
    latestAnalysisId: 'anl_104_initial',
  },
  {
    id: 'pr_108_aurora',
    repositoryId: 'repo_aurora_payment',
    githubPullRequestId: 108,
    number: 108,
    title: 'perf(reconciliation): batch settlement records with async stream pipeline',
    description: 'Refactors nightly batching to process payment ledger chunks in parallel streams across database shards.',
    authorLogin: 'sarah-chen',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    baseBranch: 'main',
    headBranch: 'perf/batch-settlements',
    baseSha: '3a18c9b',
    headSha: 'e92bc44',
    state: 'open',
    additions: 89,
    deletions: 42,
    changedFilesCount: 2,
    createdAt: '2026-10-31T05:20:00Z',
    updatedAt: '2026-10-31T07:45:00Z',
  },
  {
    id: 'pr_42_cloudscale',
    repositoryId: 'repo_cloudscale_k8s',
    githubPullRequestId: 42,
    number: 42,
    title: 'fix(reconciler): prevent goroutine leak on pod eviction race',
    description: 'Closes orphan watcher channels when a cluster node is suddenly cordoned during a scale-down cycle.',
    authorLogin: 'alex-morgan',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    baseBranch: 'main',
    headBranch: 'fix/pod-eviction-leak',
    baseSha: '7e8912d',
    headSha: '4b391cf',
    state: 'open',
    additions: 64,
    deletions: 15,
    changedFilesCount: 2,
    createdAt: '2026-10-29T18:00:00Z',
    updatedAt: '2026-10-30T16:20:00Z',
  },
];

export const seedPullRequestFiles: PullRequestFile[] = [
  {
    id: 'prf_104_payment_service',
    pullRequestId: 'pr_104_aurora',
    filename: 'src/services/payment.service.ts',
    status: 'modified',
    additions: 68,
    deletions: 12,
    patch: `@@ -45,12 +45,68 @@ export class PaymentService {
   async processPayment(req: PaymentRequest): Promise<PaymentResult> {
-    const client = await this.db.getClient();
-    const query = "SELECT * FROM accounts WHERE id = '" + req.accountId + "'";
-    const account = await client.query(query);
+    const idempotencyKey = req.headers['idempotency-key'];
+    if (idempotencyKey) {
+      // Check cache without atomic locking
+      const cached = await this.cache.get(idempotencyKey);
+      if (cached) return JSON.parse(cached);
+    }
+
+    // Vulnerable raw SQL string interpolation
+    const query = \`SELECT * FROM accounts WHERE id = '\${req.accountId}' AND currency = '\${req.currency}'\`;
+    const result = await this.db.query(query);
+    const account = result.rows[0];
+
+    if (!account) {
+      throw new NotFoundError('Account not found');
+    }
+
+    // IEEE-754 precision hazard for financial balances
+    const currentBalance: number = account.balance;
+    const feeAmount: number = req.amount * 0.029 + 0.30;
+    const totalDeduction: number = req.amount + feeAmount;
+    const newBalance: number = currentBalance - totalDeduction;
+
+    if (newBalance < 0) {
+      throw new InsufficientFundsError();
+    }
+
+    // Unbounded dispatch without awaiting or error handling
+    this.webhookDispatcher.sendAsync({
+      event: 'payment.initiated',
+      amount: req.amount,
+      account: req.accountId,
+    });
+
+    await this.db.query(
+      \`UPDATE accounts SET balance = \${newBalance} WHERE id = '\${req.accountId}'\`
+    );
+
+    if (idempotencyKey) {
+      await this.cache.set(idempotencyKey, JSON.stringify({ status: 'success', newBalance }), 3600);
+    }
+
+    return { status: 'success', balance: newBalance };
   }`,
  },
  {
    id: 'prf_104_checkout_controller',
    pullRequestId: 'pr_104_aurora',
    filename: 'src/controllers/checkout.controller.ts',
    status: 'modified',
    additions: 42,
    deletions: 8,
    patch: `@@ -18,8 +18,42 @@ export const checkoutRouter = Router();
-checkoutRouter.post('/charge', async (req, res) => {
-  res.json({ status: 'ok' });
-});
+// Missing rate limiter middleware on public financial endpoint
+checkoutRouter.post('/charge', async (req: Request, res: Response, next: NextFunction) => {
+  try {
+    // Raw unvalidated user request body used without schema validation
+    const { accountId, amount, currency } = req.body;
+    
+    // Secret token checked via timing-unsafe comparison
+    const authHeader = req.headers.authorization || '';
+    const expectedToken = process.env.API_WEBHOOK_SECRET || 'dev-fallback-secret-999';
+    if (authHeader !== \`Bearer \${expectedToken}\`) {
+      return res.status(401).json({ error: 'Unauthorized' });
+    }
+
+    const result = await paymentService.processPayment({
+      accountId,
+      amount: Number(amount),
+      currency: currency || 'USD',
+      headers: req.headers,
+    });
+
+    return res.status(200).json(result);
+  } catch (err: any) {
+    // Leaking database stack traces to clients in production
+    return res.status(500).json({ error: err.message, stack: err.stack });
+  }
+});`,
  },
  {
    id: 'prf_104_encryption',
    pullRequestId: 'pr_104_aurora',
    filename: 'src/security/encryption.ts',
    status: 'modified',
    additions: 32,
    deletions: 8,
    patch: `@@ -5,8 +5,32 @@ import crypto from 'crypto';
-const SECRET_KEY = process.env.ENCRYPTION_KEY;
+// Hardcoded secret key fallback for production decryption
+const DEFAULT_JWT_KEY = "aurora-super-secret-production-signing-key-2026!";
+const SECRET_KEY = process.env.ENCRYPTION_KEY || DEFAULT_JWT_KEY;
+
+export function signPayload(payload: object): string {
+  // Using deprecated and insecure MD5 hashing for token signature
+  const hash = crypto.createHash('md5').update(JSON.stringify(payload) + SECRET_KEY).digest('hex');
+  return \`\${Buffer.from(JSON.stringify(payload)).toString('base64')}.\${hash}\`;
+}`,
  },
  {
    id: 'prf_108_reconcile',
    pullRequestId: 'pr_108_aurora',
    filename: 'src/jobs/reconcile.ts',
    status: 'modified',
    additions: 54,
    deletions: 22,
    patch: `@@ -30,22 +30,54 @@ export async function runNightlyReconcile(): Promise<void> {
   const settlements = await db.query("SELECT id, merchant_id FROM settlements WHERE status = 'PENDING'");
   
-  for (const s of settlements.rows) {
-    await processSingle(s);
-  }
+  // N+1 Query hazard: executing individual SELECT inside unbounded loop
+  for (const settlement of settlements.rows) {
+    const merchant = await db.query(\`SELECT * FROM merchants WHERE id = '\${settlement.merchant_id}'\`);
+    const bankProfile = await db.query(\`SELECT * FROM bank_profiles WHERE merchant_id = '\${settlement.merchant_id}'\`);
+    
+    // High memory usage: buffering large PDF receipt into process memory
+    const receiptBuffer = await generateFullHistoricalPdf(merchant.rows[0].id);
+    await storage.upload(\`receipts/\${settlement.id}.pdf\`, receiptBuffer);
+  }
 }`,
  },
  {
    id: 'prf_108_banking',
    pullRequestId: 'pr_108_aurora',
    filename: 'src/adapters/banking-gateway.ts',
    status: 'modified',
    additions: 35,
    deletions: 20,
    patch: `@@ -12,20 +12,35 @@ export class BankingGatewayAdapter {
   async transferFunds(transfer: FundTransfer): Promise<void> {
-    await axios.post(this.endpoint, transfer);
+    // Missing timeout and retry circuit breaker on external banking API
+    const response = await fetch(this.endpoint, {
+      method: 'POST',
+      body: JSON.stringify(transfer),
+      headers: { 'Content-Type': 'application/json' }
+    });
+    
+    // Assuming 200 without checking response.ok
+    const data = await response.json();
+    return data.transferId;
   }`,
  },
];

export const seedAnalysisRuns: AnalysisRun[] = [
  {
    id: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    requestedByUserId: 'usr_alex_devlens',
    commitSha: 'c4b7891',
    status: 'completed',
    progress: 100,
    currentStep: 'Review pipeline completed with 6 findings',
    logs: [
      { timestamp: '2026-10-31T07:29:10Z', level: 'info', message: 'Pull request diff parsed: 3 changed files, +142 / -28 lines' },
      { timestamp: '2026-10-31T07:29:12Z', level: 'info', message: 'Deterministic static analyzers initialized: ESLint v9.2.0, Semgrep v1.64.0' },
      { timestamp: '2026-10-31T07:29:14Z', level: 'warn', message: 'Rule security/cwe-89-sql-injection triggered on src/services/payment.service.ts' },
      { timestamp: '2026-10-31T07:29:15Z', level: 'warn', message: 'Rule security/cwe-798-hardcoded-credentials triggered on src/security/encryption.ts' },
      { timestamp: '2026-10-31T07:29:18Z', level: 'info', message: 'Dispatching bounded context to Gemini 3.8 Flash model (gemini-3.8-flash)...' },
      { timestamp: '2026-10-31T07:29:22Z', level: 'info', message: 'Structured JSON response validated against Zod ReviewFindings schema' },
      { timestamp: '2026-10-31T07:29:23Z', level: 'success', message: 'Findings deduplicated: 3 static analysis + 3 AI architectural insights stored' },
    ],
    analysisConfiguration: {
      enableStaticAnalysis: true,
      enableAiReview: true,
      confidenceThreshold: 0.7,
      severityFilter: ['critical', 'high', 'medium', 'low', 'informational'],
    },
    staticAnalysisVersion: 'eslint@9.2.0 semgrep@1.64.0',
    modelIdentifier: 'gemini-3.8-flash',
    totalTokensUsed: 1840,
    estimatedCostUsd: 0.00046,
    executionDurationMs: 4210,
    findingsCount: {
      critical: 2,
      high: 2,
      medium: 1,
      low: 1,
      informational: 0,
      total: 6,
    },
    startedAt: '2026-10-31T07:29:08Z',
    completedAt: '2026-10-31T07:29:24Z',
    createdAt: '2026-10-31T07:29:08Z',
  },
];

export const seedFindings: Finding[] = [
  {
    id: 'fnd_sql_injection_payment',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'security',
    severity: 'critical',
    confidence: 0.99,
    title: 'SQL Injection via unsanitized accountId and currency parameters',
    description: 'Dynamic SQL query string template interpolation concatenates client-supplied req.accountId and req.currency directly into the SQL query without parameterized binding or sanitization.',
    filePath: 'src/services/payment.service.ts',
    startLine: 13,
    endLine: 15,
    evidence: "const query = `SELECT * FROM accounts WHERE id = '${req.accountId}' AND currency = '${req.currency}'`;\nconst result = await this.db.query(query);",
    whyItMatters: 'An attacker can supply malicious payloads in `accountId` (e.g. "\' OR 1=1 --") to execute arbitrary queries, bypass authentication, extract user financial records, or alter balances across tenant accounts.',
    suggestedFix: 'Use parameterized queries ($1, $2) to allow the PostgreSQL query planner to separate executable code from user parameters.',
    beforeSnippet: "const query = `SELECT * FROM accounts WHERE id = '${req.accountId}' AND currency = '${req.currency}'`;\nconst result = await this.db.query(query);",
    afterSnippet: "const query = 'SELECT * FROM accounts WHERE id = $1 AND currency = $2';\nconst result = await this.db.query(query, [req.accountId, req.currency]);",
    sourceType: 'static_analysis',
    toolIdentifier: 'semgrep',
    ruleId: 'security/cwe-89-sql-injection',
    status: 'new',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:29:23Z',
  },
  {
    id: 'fnd_hardcoded_jwt_secret',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'security',
    severity: 'critical',
    confidence: 0.98,
    title: 'Hardcoded production secret fallback and insecure MD5 hashing',
    description: 'A fallback secret key is hardcoded directly in source control, and payload signing relies on MD5 hashing which is vulnerable to collision and length extension attacks.',
    filePath: 'src/security/encryption.ts',
    startLine: 2,
    endLine: 8,
    evidence: 'const DEFAULT_JWT_KEY = "aurora-super-secret-production-signing-key-2026!";\nconst hash = crypto.createHash(\'md5\').update(JSON.stringify(payload) + SECRET_KEY).digest(\'hex\');',
    whyItMatters: 'Anyone with repository read access can forge arbitrary JWTs or authorization signatures, gaining full administrative rights across services. MD5 is deprecated and forbidden under PCI-DSS standards.',
    suggestedFix: 'Require ENCRYPTION_KEY from environment variables and throw during startup if missing. Use HMAC-SHA256 or Ed25519 for tamper-proof signatures.',
    beforeSnippet: 'const DEFAULT_JWT_KEY = "aurora-super-secret-production-signing-key-2026!";\nconst SECRET_KEY = process.env.ENCRYPTION_KEY || DEFAULT_JWT_KEY;\nconst hash = crypto.createHash(\'md5\').update(...).digest(\'hex\');',
    afterSnippet: 'const SECRET_KEY = process.env.ENCRYPTION_KEY;\nif (!SECRET_KEY) throw new Error("FATAL: ENCRYPTION_KEY missing in environment");\nconst hash = crypto.createHmac(\'sha256\', SECRET_KEY).update(...).digest(\'hex\');',
    sourceType: 'hybrid',
    toolIdentifier: 'eslint & gemini-3.8-flash',
    ruleId: 'security/cwe-798-hardcoded-secret',
    status: 'new',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:29:23Z',
  },
  {
    id: 'fnd_float_currency_math',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'correctness',
    severity: 'high',
    confidence: 0.95,
    title: 'Floating-point arithmetic hazard in balance calculation',
    description: 'Financial fees and deductions are calculated using JavaScript standard floating-point numbers (`number`), introducing IEEE 754 precision rounding errors (e.g., 0.1 + 0.2 !== 0.3).',
    filePath: 'src/services/payment.service.ts',
    startLine: 22,
    endLine: 26,
    evidence: 'const currentBalance: number = account.balance;\nconst feeAmount: number = req.amount * 0.029 + 0.30;\nconst totalDeduction: number = req.amount + feeAmount;\nconst newBalance: number = currentBalance - totalDeduction;',
    whyItMatters: 'Accumulated fractional cents lead to unbalanced ledgers, audit discrepancies with clearing houses, and potential round-tripping balance exploits.',
    suggestedFix: 'Represent currency in smallest discrete atomic units (cents/satoshis as integers/BigInt) or use an arbitrary-precision math library like `decimal.js` or `dinero.js`.',
    beforeSnippet: 'const feeAmount: number = req.amount * 0.029 + 0.30;\nconst totalDeduction: number = req.amount + feeAmount;',
    afterSnippet: '// Represent in integer cents\nconst feeAmountCents = Math.round(req.amountCents * 0.029) + 30;\nconst totalDeductionCents = req.amountCents + feeAmountCents;',
    sourceType: 'ai_review',
    toolIdentifier: 'gemini-3.8-flash',
    ruleId: 'correctness/floating-point-currency',
    status: 'accepted',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:35:00Z',
  },
  {
    id: 'fnd_missing_rate_limit',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'security',
    severity: 'high',
    confidence: 0.92,
    title: 'Missing rate limiting middleware on public checkout endpoint',
    description: 'The `/charge` route directly executes payment operations without an express rate limiter or IP throttling middleware.',
    filePath: 'src/controllers/checkout.controller.ts',
    startLine: 3,
    endLine: 7,
    evidence: "checkoutRouter.post('/charge', async (req: Request, res: Response, next: NextFunction) => {",
    whyItMatters: 'Payment endpoints without rate limiting are susceptible to automated card-testing fraud attacks (carding), denial-of-service, and credential stuffing.',
    suggestedFix: 'Attach a rate limiting middleware (e.g. `express-rate-limit` backed by Redis) allowing max 10 requests/min per IP/API token.',
    beforeSnippet: "checkoutRouter.post('/charge', async (req: Request, res: Response, next: NextFunction) => {",
    afterSnippet: "checkoutRouter.post('/charge', rateLimiter({ max: 10, windowMs: 60000 }), async (req: Request, res: Response, next: NextFunction) => {",
    sourceType: 'ai_review',
    toolIdentifier: 'gemini-3.8-flash',
    ruleId: 'security/cwe-770-missing-rate-limit',
    status: 'reviewed',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:38:00Z',
  },
  {
    id: 'fnd_timing_attack_token',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'security',
    severity: 'medium',
    confidence: 0.90,
    title: 'Timing attack vulnerability in authorization token string comparison',
    description: 'The authorization header token is evaluated using standard equality (`!==`), which short-circuits on the first non-matching byte.',
    filePath: 'src/controllers/checkout.controller.ts',
    startLine: 11,
    endLine: 14,
    evidence: "if (authHeader !== `Bearer ${expectedToken}`) { return res.status(401).json(...); }",
    whyItMatters: 'Remote attackers can measure microsecond response latency variations to systematically guess authorization secret tokens character-by-character.',
    suggestedFix: 'Use `crypto.timingSafeEqual` over fixed-length buffer digests to ensure constant-time comparison.',
    beforeSnippet: "if (authHeader !== `Bearer ${expectedToken}`) {",
    afterSnippet: "const isAuthorized = crypto.timingSafeEqual(\n  Buffer.from(authHeader),\n  Buffer.from(`Bearer ${expectedToken}`)\n);",
    sourceType: 'static_analysis',
    toolIdentifier: 'semgrep',
    ruleId: 'security/cwe-208-timing-attack',
    status: 'new',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:29:23Z',
  },
  {
    id: 'fnd_stack_trace_leak',
    analysisRunId: 'anl_104_initial',
    pullRequestId: 'pr_104_aurora',
    category: 'maintainability',
    severity: 'low',
    confidence: 0.94,
    title: 'Stack trace exposure in HTTP 500 error response',
    description: 'Internal database and file path stack traces are returned directly to clients when exceptions occur.',
    filePath: 'src/controllers/checkout.controller.ts',
    startLine: 24,
    endLine: 27,
    evidence: "return res.status(500).json({ error: err.message, stack: err.stack });",
    whyItMatters: 'Stack traces expose library versions, internal paths, and query structures that aid reconnaissance for targeted exploits.',
    suggestedFix: 'Log the full error server-side and return an opaque error reference code to the user.',
    beforeSnippet: "return res.status(500).json({ error: err.message, stack: err.stack });",
    afterSnippet: "logger.error('Charge failed', { err });\nreturn res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });",
    sourceType: 'ai_review',
    toolIdentifier: 'gemini-3.8-flash',
    ruleId: 'maint/cwe-209-stack-trace-exposure',
    status: 'new',
    createdAt: '2026-10-31T07:29:23Z',
    updatedAt: '2026-10-31T07:29:23Z',
  },
];

export const seedAuditLogs: AuditLog[] = [
  {
    id: 'log_01',
    userId: 'usr_alex_devlens',
    userEmail: 'alex.morgan@devlens.internal',
    action: 'installation.connected',
    resourceType: 'github_installation',
    resourceId: 'inst_aurora_org',
    details: { account: 'aurora-pay', reposDiscovered: 2 },
    ipAddress: '127.0.0.1',
    createdAt: '2026-10-16T10:00:00Z',
  },
  {
    id: 'log_02',
    userId: 'usr_alex_devlens',
    userEmail: 'alex.morgan@devlens.internal',
    action: 'analysis.completed',
    resourceType: 'analysis_run',
    resourceId: 'anl_104_initial',
    details: { prNumber: 104, findingsFound: 6, durationMs: 4210 },
    ipAddress: '127.0.0.1',
    createdAt: '2026-10-31T07:29:24Z',
  },
  {
    id: 'log_03',
    userId: 'usr_alex_devlens',
    userEmail: 'alex.morgan@devlens.internal',
    action: 'finding.status_updated',
    resourceType: 'finding',
    resourceId: 'fnd_float_currency_math',
    details: { previousStatus: 'new', newStatus: 'accepted' },
    ipAddress: '127.0.0.1',
    createdAt: '2026-10-31T07:35:00Z',
  },
];

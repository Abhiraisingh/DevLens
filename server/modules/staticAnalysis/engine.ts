import { Finding, PullRequestFile } from '../../db/types.js';

interface StaticRule {
  id: string;
  name: string;
  tool: 'eslint' | 'semgrep' | 'code-scanner';
  category: 'security' | 'correctness' | 'performance' | 'maintainability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  whyItMatters: string;
  check: (file: PullRequestFile) => Array<{
    startLine: number;
    endLine: number;
    evidence: string;
    suggestedFix: string;
    beforeSnippet?: string;
    afterSnippet?: string;
  }>;
}

const STATIC_RULES: StaticRule[] = [
  {
    id: 'security/cwe-89-sql-injection',
    name: 'SQL Injection via string interpolation in database query',
    tool: 'semgrep',
    category: 'security',
    severity: 'critical',
    description: 'Dynamic SQL query string template interpolation concatenates client parameters directly into SQL statement.',
    whyItMatters: 'Allows unauthenticated users to execute arbitrary SQL, extract confidential database records, or modify balances.',
    check: (file) => {
      const results = [];
      const lines = file.patch.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.startsWith('+') &&
          (/SELECT\s+.*WHERE.*?\$\{/i.test(line) ||
            /UPDATE\s+.*SET.*?\$\{/i.test(line) ||
            /INSERT\s+INTO.*?\$\{/i.test(line) ||
            /query\(`[^`]*\$\{/i.test(line))
        ) {
          results.push({
            startLine: Math.max(1, i - 1),
            endLine: i + 1,
            evidence: line.replace(/^\+/, '').trim(),
            suggestedFix: 'Replace template literal with parameterized query placeholders ($1, $2) and pass parameters in an array.',
            beforeSnippet: line.replace(/^\+/, '').trim(),
            afterSnippet: "const query = 'SELECT * FROM accounts WHERE id = $1 AND currency = $2';\nconst result = await db.query(query, [accountId, currency]);",
          });
        }
      }
      return results;
    },
  },
  {
    id: 'security/cwe-798-hardcoded-secret',
    name: 'Hardcoded secret or encryption key in source code',
    tool: 'eslint',
    category: 'security',
    severity: 'critical',
    description: 'A fallback secret or private key is embedded directly into repository source code.',
    whyItMatters: 'Exposes administrative credentials to anyone with repository read access or decompiled client code.',
    check: (file) => {
      const results = [];
      const lines = file.patch.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.startsWith('+') &&
          (/(SECRET|KEY|PASSWORD|TOKEN|API_KEY)\s*=\s*["'][^"']{8,}["']/i.test(line) ||
            /["']aurora-super-secret/i.test(line) ||
            /["']dev-fallback-secret/i.test(line))
        ) {
          results.push({
            startLine: Math.max(1, i - 1),
            endLine: i + 1,
            evidence: line.replace(/^\+/, '').trim(),
            suggestedFix: 'Load secret exclusively from environment variables with startup validation failure if missing.',
            beforeSnippet: line.replace(/^\+/, '').trim(),
            afterSnippet: 'const SECRET_KEY = process.env.ENCRYPTION_KEY;\nif (!SECRET_KEY) throw new Error("Missing ENCRYPTION_KEY env var");',
          });
        }
      }
      return results;
    },
  },
  {
    id: 'security/cwe-208-timing-attack',
    name: 'Timing attack in authorization token string comparison',
    tool: 'semgrep',
    category: 'security',
    severity: 'medium',
    description: 'String equality operator (=== or !==) is used on authorization tokens or webhook signatures.',
    whyItMatters: 'Timing variations permit side-channel byte-by-byte guessing of secret credentials over the network.',
    check: (file) => {
      const results = [];
      const lines = file.patch.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.startsWith('+') &&
          (/(authHeader|token|signature|secret)\s*(!==|===)\s*/i.test(line) ||
            /!==\s*`Bearer/i.test(line))
        ) {
          results.push({
            startLine: Math.max(1, i - 1),
            endLine: i + 1,
            evidence: line.replace(/^\+/, '').trim(),
            suggestedFix: 'Use crypto.timingSafeEqual on fixed-length buffers to eliminate execution timing differences.',
            beforeSnippet: line.replace(/^\+/, '').trim(),
            afterSnippet: 'const isValid = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));',
          });
        }
      }
      return results;
    },
  },
  {
    id: 'perf/n-plus-one-query',
    name: 'N+1 Database Query execution inside iterative loop',
    tool: 'semgrep',
    category: 'performance',
    severity: 'high',
    description: 'Database query executed inside for/forEach loop generates a separate round-trip for each record.',
    whyItMatters: 'Causes severe latency degradation and connection pool starvation when processing large collections.',
    check: (file) => {
      const results = [];
      const lines = file.patch.split('\n');
      let insideLoop = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/(for\s*\(|for\s+const|for\s+let|\.forEach\()/i.test(line)) {
          insideLoop = true;
        }
        if (insideLoop && line.startsWith('+') && /(db\.query|await\s+client\.query|\.findMany|\.findOne)/i.test(line)) {
          results.push({
            startLine: Math.max(1, i - 1),
            endLine: i + 1,
            evidence: line.replace(/^\+/, '').trim(),
            suggestedFix: 'Batch the IDs and execute a single WHERE id IN (...) query before the loop, or use SQL JOIN.',
            beforeSnippet: line.replace(/^\+/, '').trim(),
            afterSnippet: 'const merchants = await db.query("SELECT * FROM merchants WHERE id = ANY($1)", [merchantIds]);',
          });
          insideLoop = false;
        }
      }
      return results;
    },
  },
  {
    id: 'maint/cwe-209-stack-trace-exposure',
    name: 'Internal exception stack trace leaked to HTTP response',
    tool: 'eslint',
    category: 'maintainability',
    severity: 'low',
    description: 'Internal stack trace (err.stack) is returned directly in HTTP JSON response body.',
    whyItMatters: 'Leaks sensitive directory structure, underlying database versions, and code structure to clients.',
    check: (file) => {
      const results = [];
      const lines = file.patch.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('+') && /status\(500\)\.json\(\{.*?stack:/i.test(line)) {
          results.push({
            startLine: Math.max(1, i - 1),
            endLine: i + 1,
            evidence: line.replace(/^\+/, '').trim(),
            suggestedFix: 'Log stack traces internally via logger.error and return a sanitized error message and correlation ID.',
            beforeSnippet: line.replace(/^\+/, '').trim(),
            afterSnippet: "logger.error('Unhandled request failure', { err });\nreturn res.status(500).json({ error: 'Internal Server Error', traceId });",
          });
        }
      }
      return results;
    },
  },
];

export function runStaticAnalysis(
  files: PullRequestFile[],
  analysisRunId: string,
  pullRequestId: string
): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!file.patch) continue;

    for (const rule of STATIC_RULES) {
      const violations = rule.check(file);
      for (const v of violations) {
        findings.push({
          id: `fnd_static_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          analysisRunId,
          pullRequestId,
          category: rule.category,
          severity: rule.severity,
          confidence: 0.96,
          title: rule.name,
          description: rule.description,
          filePath: file.filename,
          startLine: v.startLine,
          endLine: v.endLine,
          evidence: v.evidence,
          whyItMatters: rule.whyItMatters,
          suggestedFix: v.suggestedFix,
          beforeSnippet: v.beforeSnippet,
          afterSnippet: v.afterSnippet,
          sourceType: 'static_analysis',
          toolIdentifier: rule.tool,
          ruleId: rule.id,
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return findings;
}

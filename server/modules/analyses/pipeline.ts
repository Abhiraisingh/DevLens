import { db } from '../../db/store.js';
import { AnalysisRun, Finding, PullRequestFile } from '../../db/types.js';
import { runStaticAnalysis } from '../staticAnalysis/engine.js';
import { AiReviewAdapter } from '../aiReview/adapter.js';

interface AnalysisJob {
  analysisId: string;
  pullRequestId: string;
  cancelled: boolean;
}

class AnalysisPipelineQueue {
  private activeJobs: Map<string, AnalysisJob> = new Map();
  private aiAdapter = new AiReviewAdapter();

  enqueueAnalysis(analysisId: string, pullRequestId: string) {
    const job: AnalysisJob = { analysisId, pullRequestId, cancelled: false };
    this.activeJobs.set(analysisId, job);

    // Run asynchronously outside HTTP handler
    setImmediate(() => {
      this.executeJob(job).catch((err) => {
        console.error(`Analysis job ${analysisId} encountered fatal error:`, err);
        db.updateAnalysisRun(analysisId, {
          status: 'failed',
          errorCode: 'UNHANDLED_PIPELINE_ERROR',
          errorMessage: err instanceof Error ? err.message : String(err),
        });
      });
    });
  }

  cancelAnalysis(analysisId: string): boolean {
    const job = this.activeJobs.get(analysisId);
    if (job) {
      job.cancelled = true;
      db.updateAnalysisRun(analysisId, {
        status: 'cancelled',
        currentStep: 'Analysis cancelled by user',
      });
      return true;
    }
    return false;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Map<string, Finding>();

    for (const f of findings) {
      // Key by filePath and line window
      const key = `${f.filePath}:${Math.floor(f.startLine / 5)}:${f.category}`;
      const existing = seen.get(key);

      if (existing) {
        // Merge into hybrid finding
        existing.sourceType = 'hybrid';
        existing.toolIdentifier = `${existing.toolIdentifier} & ${f.toolIdentifier}`;
        existing.evidence = `${existing.evidence}\n\n[Supporting]: ${f.evidence}`.trim();
        if (f.confidence > existing.confidence) {
          existing.confidence = f.confidence;
        }
      } else {
        seen.set(key, { ...f });
      }
    }

    return Array.from(seen.values());
  }

  private async executeJob(job: AnalysisJob) {
    const startTime = Date.now();
    const run = db.findAnalysisRunById(job.analysisId);
    if (!run) return;

    const appendLog = (level: 'info' | 'warn' | 'error' | 'success', message: string) => {
      const current = db.findAnalysisRunById(job.analysisId);
      if (!current) return;
      const logs = [...current.logs, { timestamp: new Date().toISOString(), level, message }];
      db.updateAnalysisRun(job.analysisId, { logs });
    };

    try {
      // Step 1: Diff Normalization
      if (job.cancelled) return;
      db.updateAnalysisRun(job.analysisId, {
        status: 'diff_normalization',
        progress: 15,
        currentStep: 'Normalizing changed file diffs and calculating hunks...',
        startedAt: new Date().toISOString(),
      });
      appendLog('info', 'Starting diff retrieval and normalization pipeline...');
      await this.sleep(400);

      const files: PullRequestFile[] = db.getPullRequestFiles(job.pullRequestId);
      appendLog('info', `Loaded ${files.length} changed files for pull request diff parsing.`);

      // Step 2: Static Analysis
      if (job.cancelled) return;
      db.updateAnalysisRun(job.analysisId, {
        status: 'static_analysis',
        progress: 40,
        currentStep: 'Running deterministic static analyzers (ESLint & Semgrep rules)...',
      });
      appendLog('info', 'Invoking deterministic AST & pattern analyzers across changed lines...');
      await this.sleep(600);

      const staticFindings = runStaticAnalysis(files, job.analysisId, job.pullRequestId);
      appendLog('info', `Static analysis completed: detected ${staticFindings.length} deterministic findings.`);

      // Step 3: AI Review Analysis
      if (job.cancelled) return;
      db.updateAnalysisRun(job.analysisId, {
        status: 'ai_review',
        progress: 70,
        currentStep: `Synthesizing architectural review with ${this.aiAdapter.modelIdentifier}...`,
      });

      const { findings: aiFindings, tokensUsed, costUsd } = await this.aiAdapter.analyzePullRequest(
        files,
        job.analysisId,
        job.pullRequestId,
        (msg) => appendLog('info', msg)
      );
      appendLog('info', `AI analysis completed: generated ${aiFindings.length} evidence-backed insights.`);

      // Step 4: Normalization & Deduplication
      if (job.cancelled) return;
      db.updateAnalysisRun(job.analysisId, {
        status: 'deduplication',
        progress: 90,
        currentStep: 'Deduplicating overlapping findings and persisting to database...',
      });
      await this.sleep(300);

      const combined = [...staticFindings, ...aiFindings];
      const finalizedFindings = this.deduplicateFindings(combined);

      // Persist findings to database store
      for (const f of finalizedFindings) {
        db.addFinding(f);
      }

      // Tally findings by severity
      const counts = {
        critical: finalizedFindings.filter((f) => f.severity === 'critical').length,
        high: finalizedFindings.filter((f) => f.severity === 'high').length,
        medium: finalizedFindings.filter((f) => f.severity === 'medium').length,
        low: finalizedFindings.filter((f) => f.severity === 'low').length,
        informational: finalizedFindings.filter((f) => f.severity === 'informational').length,
        total: finalizedFindings.length,
      };

      const durationMs = Date.now() - startTime;
      db.updateAnalysisRun(job.analysisId, {
        status: 'completed',
        progress: 100,
        currentStep: `Completed in ${durationMs}ms with ${counts.total} actionable findings.`,
        findingsCount: counts,
        totalTokensUsed: tokensUsed,
        estimatedCostUsd: costUsd,
        executionDurationMs: durationMs,
        completedAt: new Date().toISOString(),
      });

      appendLog('success', `Review pipeline completed successfully. Found ${counts.total} issues.`);

      // Update PR latest analysis pointer
      db.updatePullRequest(job.pullRequestId, {
        latestAnalysisId: job.analysisId,
      });

      // Audit Log
      db.addAuditLog({
        userId: run.requestedByUserId,
        action: 'analysis.completed',
        resourceType: 'analysis_run',
        resourceId: job.analysisId,
        details: {
          pullRequestId: job.pullRequestId,
          findingsTotal: counts.total,
          durationMs,
        },
      });

      this.activeJobs.delete(job.analysisId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      appendLog('error', `Pipeline execution failed: ${errorMsg}`);
      db.updateAnalysisRun(job.analysisId, {
        status: 'failed',
        progress: 100,
        currentStep: 'Pipeline failed due to execution error.',
        errorCode: 'EXECUTION_FAILURE',
        errorMessage: errorMsg,
        completedAt: new Date().toISOString(),
      });
      this.activeJobs.delete(job.analysisId);
    }
  }
}

export const analysisPipeline = new AnalysisPipelineQueue();

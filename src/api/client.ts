import {
  User,
  GitHubInstallation,
  Repository,
  PullRequest,
  PullRequestFile,
  AnalysisRun,
  Finding,
  AnalyticsOverview,
  AuditLog,
  FindingStatus,
} from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('devlens_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('devlens_token', token);
    } else {
      localStorage.removeItem('devlens_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch {
        // use default message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth ---
  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    this.setToken(res.token);
    return res;
  }

  async demoLogin(
    role: 'developer' | 'tech_lead' = 'developer'
  ): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    this.setToken(null);
  }

  // --- GitHub Integrations ---
  async getInstallations(): Promise<GitHubInstallation[] & { installations: GitHubInstallation[] }> {
    const res = await this.request<{ installations: GitHubInstallation[] }>(
      '/integrations/github/installations'
    );
    const arr = [...(res.installations || [])] as any;
    arr.installations = arr;
    return arr;
  }

  async connectToken(
    token: string
  ): Promise<{ installation: GitHubInstallation; reposDiscovered: number }> {
    return this.request<{ installation: GitHubInstallation; reposDiscovered: number }>(
      '/integrations/github/connect-token',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    );
  }

  async importPublicRepo(
    repositoryUrl: string
  ): Promise<{ repository: Repository; prsCount: number }> {
    return this.request<{ repository: Repository; prsCount: number }>(
      '/integrations/github/import-public',
      {
        method: 'POST',
        body: JSON.stringify({ repositoryUrl }),
      }
    );
  }

  async importPublicRepository(
    repositoryUrl: string
  ): Promise<{ repository: Repository; prsCount: number }> {
    return this.importPublicRepo(repositoryUrl);
  }

  async disconnectInstallation(installationId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/integrations/github/disconnect', {
      method: 'POST',
      body: JSON.stringify({ installationId }),
    });
  }

  // --- Repositories & PRs ---
  async getRepositories(
    searchOrParams?: string | { search?: string; language?: string },
    language?: string
  ): Promise<Repository[] & { repositories: Repository[] }> {
    const params = new URLSearchParams();
    if (typeof searchOrParams === 'object' && searchOrParams !== null) {
      if (searchOrParams.search) params.set('search', searchOrParams.search);
      if (searchOrParams.language) params.set('language', searchOrParams.language);
    } else {
      if (searchOrParams) params.set('search', searchOrParams);
      if (language) params.set('language', language);
    }
    const res = await this.request<{ repositories: Repository[] }>(
      `/repositories?${params.toString()}`
    );
    const arr = [...(res.repositories || [])] as any;
    arr.repositories = arr;
    return arr;
  }

  async getRepository(id: string): Promise<Repository & { repository: Repository }> {
    const res = await this.request<{ repository: Repository }>(`/repositories/${id}`);
    const obj = { ...res.repository } as any;
    obj.repository = res.repository;
    return obj;
  }

  async getPullRequests(
    repositoryId?: string,
    state?: string
  ): Promise<PullRequest[] & { pullRequests: PullRequest[] }> {
    let url = '/pull-requests';
    const params = new URLSearchParams();
    if (repositoryId) {
      url = `/repositories/${repositoryId}/pull-requests`;
    }
    if (state && state !== 'all') {
      params.set('state', state);
    }
    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    const res = await this.request<{ pullRequests: PullRequest[] }>(fullUrl);
    const arr = [...(res.pullRequests || [])] as any;
    arr.pullRequests = arr;
    return arr;
  }

  async getPullRequest(
    id: string
  ): Promise<PullRequest & { pullRequest: PullRequest; repository: Repository }> {
    const res = await this.request<{ pullRequest: PullRequest; repository: Repository }>(
      `/pull-requests/${id}`
    );
    const obj = { ...res.pullRequest, repository: res.repository } as any;
    obj.pullRequest = res.pullRequest;
    return obj;
  }

  async getPullRequestFiles(
    pullRequestId: string
  ): Promise<PullRequestFile[] & { files: PullRequestFile[] }> {
    const res = await this.request<{ files: PullRequestFile[] }>(
      `/pull-requests/${pullRequestId}/files`
    );
    const arr = [...(res.files || [])] as any;
    arr.files = arr;
    return arr;
  }

  // --- Analysis Pipeline ---
  async triggerAnalysis(
    pullRequestId: string
  ): Promise<
    AnalysisRun & { analysisId: string; status: string; message: string; analysis?: AnalysisRun }
  > {
    const res = await this.request<{
      analysisId: string;
      status: string;
      message: string;
      analysis?: AnalysisRun;
    }>(`/pull-requests/${pullRequestId}/analyses`, { method: 'POST' });
    const obj = (res.analysis ? { ...res.analysis } : { id: res.analysisId }) as any;
    obj.analysisId = res.analysisId;
    obj.status = res.status;
    obj.message = res.message;
    obj.analysis = res.analysis;
    return obj;
  }

  async getAnalysis(id: string): Promise<AnalysisRun & { analysis: AnalysisRun }> {
    const res = await this.request<{ analysis: AnalysisRun }>(`/analyses/${id}`);
    const obj = { ...res.analysis } as any;
    obj.analysis = res.analysis;
    return obj;
  }

  async getAnalysisFindings(
    id: string
  ): Promise<Finding[] & { findings: Finding[]; items: Finding[] }> {
    const res = await this.request<{ findings: Finding[] }>(`/analyses/${id}/findings`);
    const arr = [...(res.findings || [])] as any;
    arr.findings = arr;
    arr.items = arr;
    return arr;
  }

  async cancelAnalysis(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/analyses/${id}/cancel`, { method: 'POST' });
  }

  async retryAnalysis(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/analyses/${id}/retry`, { method: 'POST' });
  }

  // --- Findings ---
  async getFindings(
    filters: {
      analysisRunId?: string;
      pullRequestId?: string;
      repositoryId?: string;
      category?: string;
      severity?: string;
      status?: string;
      search?: string;
    } = {}
  ): Promise<Finding[] & { findings: Finding[]; items: Finding[] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const res = await this.request<{ findings: Finding[] }>(`/findings?${params.toString()}`);
    const arr = [...(res.findings || [])] as any;
    arr.findings = arr;
    arr.items = arr;
    return arr;
  }

  async getFinding(id: string): Promise<Finding & { finding: Finding }> {
    const res = await this.request<{ finding: Finding }>(`/findings/${id}`);
    const obj = { ...res.finding } as any;
    obj.finding = res.finding;
    return obj;
  }

  async updateFindingStatus(
    id: string,
    data:
      | FindingStatus
      | {
          status: FindingStatus | string;
          dismissalReason?: string;
          notes?: string;
        },
    dismissalReason?: string,
    notes?: string
  ): Promise<Finding & { finding: Finding }> {
    const payload =
      typeof data === 'string'
        ? { status: data, dismissalReason, notes }
        : data;

    const res = await this.request<{ finding: Finding }>(`/findings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const obj = { ...res.finding } as any;
    obj.finding = res.finding;
    return obj;
  }

  async submitFindingFeedback(
    findingId: string,
    action: string,
    comment?: string
  ): Promise<{ feedback: any }> {
    return this.request<{ feedback: any }>(`/findings/${findingId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    });
  }

  // --- Analytics & Settings ---
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/analytics/overview');
  }

  async getAnalyticsTrends(): Promise<{ trends: any[] }> {
    return this.request<{ trends: any[] }>('/analytics/trends');
  }

  async getAuditLogs(): Promise<AuditLog[] & { auditLogs: AuditLog[] }> {
    const res = await this.request<{ auditLogs: AuditLog[] }>('/settings/audit-logs');
    const arr = [...(res.auditLogs || [])] as any;
    arr.auditLogs = arr;
    return arr;
  }

  async purgeAccount(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/settings/account/delete', {
      method: 'POST',
    });
  }

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return this.purgeAccount();
  }

  async getHealth(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/health');
  }
}

export const api = new ApiClient();

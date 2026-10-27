import { AuthTokens, UserProfile } from "../types";

const getApiBase = (): string => {
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  // When running in browser, using relative path '/api/v1' allows Vite's proxy
  // to forward all requests to http://localhost:8000, ensuring seamless operation
  // on localhost, LAN Wi-Fi IPs, and mobile devices without CORS or port conflicts.
  return "/api/v1";
};

const API_BASE = getApiBase();

class ApiClient {
  private getAccessToken(): string | null {
    return localStorage.getItem("inkloom_access_token");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("inkloom_refresh_token");
  }

  public setTokens(tokens: { access_token: string; refresh_token: string }) {
    localStorage.setItem("inkloom_access_token", tokens.access_token);
    localStorage.setItem("inkloom_refresh_token", tokens.refresh_token);
  }

  public clearTokens() {
    localStorage.removeItem("inkloom_access_token");
    localStorage.removeItem("inkloom_refresh_token");
  }

  public hasTokens(): boolean {
    return !!this.getAccessToken();
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration & automatic refresh
    if (response.status === 401 && this.getRefreshToken()) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers.set("Authorization", `Bearer ${this.getAccessToken()}`);
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    if (!response.ok) {
      let errorDetail = "An unexpected error occurred.";
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(errorDetail || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      this.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // --- Auth Endpoints ---

  async registerBrand(data: {
    email: string;
    password: string;
    full_name: string;
    brand_name: string;
    brand_slug: string;
    website?: string;
  }): Promise<AuthTokens> {
    const res = await this.request<AuthTokens>("/auth/register-brand", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(res);
    return res;
  }

  async registerCreator(data: {
    email: string;
    password: string;
    full_name: string;
    invitation_token?: string;
  }): Promise<AuthTokens> {
    const res = await this.request<AuthTokens>("/auth/register-creator", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(res);
    return res;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthTokens> {
    const res = await this.request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setTokens(res);
    return res;
  }

  async logout(): Promise<void> {
    const refresh_token = this.getRefreshToken();
    try {
      if (refresh_token) {
        await this.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/me");
  }

  async updateProfile(fullName: string): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/me/profile", {
      method: "PUT",
      body: JSON.stringify({ full_name: fullName }),
    });
  }

  async updatePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- Brand Endpoints ---

  async listUserBrands(): Promise<Array<{ id: string; name: string; slug: string; role: string }>> {
    return this.request<Array<{ id: string; name: string; slug: string; role: string }>>("/brands");
  }

  async getBrand(brandId: string): Promise<any> {
    return this.request(`/brands/${brandId}`);
  }

  async updateBrand(brandId: string, data: any): Promise<any> {
    return this.request(`/brands/${brandId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getBrandMembers(brandId: string): Promise<Array<{
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    joined_at: string;
  }>> {
    return this.request(`/brands/${brandId}/members`);
  }

  async inviteMember(brandId: string, email: string, role: string): Promise<{
    id: string;
    email: string;
    role: string;
    invitation_token: string;
  }> {
    return this.request(`/brands/${brandId}/invitations`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  // --- Golden Facts ---

  async listFacts(brandId: string, params?: { category?: string; status?: string; q?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.status) query.set("status", params.status);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return this.request(`/brands/${brandId}/facts${qs ? `?${qs}` : ""}`);
  }

  async createFact(brandId: string, data: any): Promise<any> {
    return this.request(`/brands/${brandId}/facts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFact(brandId: string, factId: string, data: any): Promise<any> {
    return this.request(`/brands/${brandId}/facts/${factId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async supersedeFact(brandId: string, factId: string, supersededById?: string): Promise<any> {
    return this.request(`/brands/${brandId}/facts/${factId}/supersede`, {
      method: "POST",
      body: JSON.stringify({ superseded_by_id: supersededById }),
    });
  }

  async markFactOutdated(brandId: string, factId: string): Promise<any> {
    return this.request(`/brands/${brandId}/facts/${factId}/mark-outdated`, {
      method: "POST",
    });
  }

  async deleteFact(brandId: string, factId: string): Promise<any> {
    return this.request(`/brands/${brandId}/facts/${factId}`, {
      method: "DELETE",
    });
  }

  async previewCSV(brandId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request(`/brands/${brandId}/facts/csv-preview`, {
      method: "POST",
      body: formData,
    });
  }

  async importCSV(brandId: string, csvText: string, columnMapping: Record<string, string>, strictMode: boolean = true): Promise<any> {
    return this.request(`/brands/${brandId}/facts/csv-import`, {
      method: "POST",
      body: JSON.stringify({
        csv_text: csvText,
        column_mapping: columnMapping,
        strict_mode: strictMode,
      }),
    });
  }

  // --- Brand Rules ---

  async listRules(brandId: string, params?: { rule_type?: string; channel?: string; severity?: string; enforcement_mode?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.rule_type) query.set("rule_type", params.rule_type);
    if (params?.channel) query.set("channel", params.channel);
    if (params?.severity) query.set("severity", params.severity);
    if (params?.enforcement_mode) query.set("enforcement_mode", params.enforcement_mode);
    const qs = query.toString();
    return this.request(`/brands/${brandId}/rules${qs ? `?${qs}` : ""}`);
  }

  async createRule(brandId: string, data: any): Promise<any> {
    return this.request(`/brands/${brandId}/rules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRule(brandId: string, ruleId: string, data: any, saveAsDraft: boolean = false): Promise<any> {
    return this.request(`/brands/${brandId}/rules/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, save_as_draft: saveAsDraft }),
    });
  }

  async publishRule(brandId: string, ruleId: string): Promise<any> {
    return this.request(`/brands/${brandId}/rules/${ruleId}/publish`, {
      method: "POST",
    });
  }

  async deleteRule(brandId: string, ruleId: string): Promise<any> {
    return this.request(`/brands/${brandId}/rules/${ruleId}`, {
      method: "DELETE",
    });
  }

  async getRuleHistory(brandId: string, ruleId: string): Promise<any[]> {
    return this.request(`/brands/${brandId}/rules/${ruleId}/history`);
  }

  // --- Visual Assets ---

  async listAssets(brandId: string, assetType?: string): Promise<any[]> {
    const query = new URLSearchParams();
    if (assetType && assetType !== "ALL") query.set("asset_type", assetType);
    const qs = query.toString();
    return this.request(`/brands/${brandId}/assets${qs ? `?${qs}` : ""}`);
  }

  async createAsset(brandId: string, data: any): Promise<any> {
    return this.request(`/brands/${brandId}/assets`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadAsset(brandId: string, name: string, assetType: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("asset_type", assetType);
    formData.append("file", file);
    return this.request(`/brands/${brandId}/assets/upload`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteAsset(brandId: string, assetId: string): Promise<any> {
    return this.request(`/brands/${brandId}/assets/${assetId}`, {
      method: "DELETE",
    });
  }

  getAssetFileUrl(brandId: string, assetId: string): string {
    return `${API_BASE}/brands/${brandId}/assets/${assetId}/file`;
  }

  // --- Invitations ---

  async verifyInvitation(token: string): Promise<{
    brand_name: string;
    brand_slug: string;
    invited_email: string;
    role: string;
    is_valid: boolean;
  }> {
    return this.request(`/invitations/verify?token=${encodeURIComponent(token)}`);
  }

  async acceptInvitation(token: string): Promise<{
    brand_id: string;
    brand_name: string;
    role: string;
    message: string;
  }> {
    return this.request("/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }
  // --- Audit & Escalation ---

  async auditText(brandId: string, data: { draft_text: string; channel?: string }): Promise<{
    audit_id: string;
    brand_id: string;
    overall_score: number;
    status: "PASSED" | "WARNINGS_RESOLVABLE" | "NEEDS_REVIEW" | "REJECTED";
    summary: string;
    findings: Array<{
      id?: string;
      finding_type: string;
      severity: "CRITICAL" | "WARNING" | "SUGGESTION";
      original_snippet: string;
      explanation: string;
      citation_reference: string;
      suggested_fix: string;
    }>;
  }> {
    return this.request(`/brands/${brandId}/audit/text`, {
      method: "POST",
      body: JSON.stringify({
        draft_text: data.draft_text,
        channel: data.channel || "general",
      }),
    });
  }

  async escalateAudit(brandId: string, auditId: string, data: { creator_notes: string }): Promise<{
    review_id: string;
    audit_id: string;
    status: string;
    message: string;
  }> {
    return this.request(`/brands/${brandId}/audit/${auditId}/escalate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async rerunAudit(brandId: string, auditId: string): Promise<{
    audit_id: string;
    overall_score: number;
    status: string;
    summary: string;
    findings: Array<any>;
  }> {
    return this.request(`/brands/${brandId}/audit/${auditId}/rerun`, {
      method: "POST",
    });
  }

  async getAssistantSuggestions(
    brandId: string,
    data: { draft_text: string; query: string; channel?: string }
  ): Promise<{
    advice: string;
    alternatives: string[];
    channel_notes: string;
  }> {
    return this.request(`/brands/${brandId}/audit/assistant`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async auditImage(
    brandId: string,
    file: File,
    options?: {
      channel?: string;
      brief_context?: string;
      color_tolerance?: number;
      reference_logo_id?: string;
    }
  ): Promise<{
    audit_id: string;
    brand_id: string;
    overall_visual_score: number;
    aspect_ratio: number;
    dimensions: [number, number];
    is_aspect_ratio_compliant: boolean;
    target_channel_spec: string;
    color_findings: Array<{
      extracted_hex: string;
      nearest_brand_hex: string;
      distance_delta_e: number;
      is_compliant: boolean;
      percentage_coverage: number;
      explanation?: string;
    }>;
    logo_detection: {
      detected: boolean;
      confidence_score: number;
      is_reliable_match: boolean;
      detection_method: string;
      notes: string;
    } | null;
    logo_detected: boolean | null;
    deterministic_explanations: string[];
    qualitative_assessment: {
      vibe_score: number;
      aesthetic_critique: string;
      matches_brand_style: boolean;
      mood: string;
      composition_assessment: string;
      visual_clutter_level: string;
      audience_relevance: string;
      qualitative_findings: Array<{
        aspect: string;
        severity: string;
        rationale: string;
        confidence: number;
        reference_rule_ids: string[];
        improvement_suggestion: string;
      }>;
      suggestions: string[];
      disclaimer: string;
    } | null;
    summary: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.channel) formData.append("channel", options.channel);
    if (options?.brief_context) formData.append("brief_context", options.brief_context);
    if (options?.color_tolerance !== undefined) formData.append("color_tolerance", options.color_tolerance.toString());
    if (options?.reference_logo_id) formData.append("reference_logo_id", options.reference_logo_id);

    const token = this.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/brands/${brandId}/audit/image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Image audit failed with status ${response.status}`);
    }

    return response.json();
  }

  // --- Human Review Queue ---

  public async listReviews(brandId: string, statusFilter?: string): Promise<ReviewItemDetail[]> {
    const params = statusFilter && statusFilter !== "ALL" ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
    return this.request<ReviewItemDetail[]>(`/brands/${brandId}/reviews${params}`);
  }

  public async getReview(brandId: string, reviewId: string): Promise<ReviewItemDetail> {
    return this.request<ReviewItemDetail>(`/brands/${brandId}/reviews/${reviewId}`);
  }

  public async takeReviewAction(
    brandId: string,
    reviewId: string,
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES",
    comments: string,
  ): Promise<ReviewItemDetail> {
    return this.request<ReviewItemDetail>(`/brands/${brandId}/reviews/${reviewId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, comments }),
    });
  }

  public async transitionReviewState(
    brandId: string,
    reviewId: string,
    targetStatus: string,
    notes?: string,
  ): Promise<ReviewItemDetail> {
    return this.request<ReviewItemDetail>(`/brands/${brandId}/reviews/${reviewId}/transition`, {
      method: "POST",
      body: JSON.stringify({ target_status: targetStatus, notes }),
    });
  }

  public async resubmitReview(
    brandId: string,
    reviewId: string,
    creatorNotes: string,
    freshAuditId: string,
  ): Promise<ReviewItemDetail> {
    return this.request<ReviewItemDetail>(`/brands/${brandId}/reviews/${reviewId}/resubmit`, {
      method: "POST",
      body: JSON.stringify({
        creator_notes: creatorNotes,
        fresh_audit_id: freshAuditId,
      }),
    });
  }

  public async acceptAuditFinding(
    brandId: string,
    auditId: string,
    findingId: string,
  ): Promise<{ finding_id: string; audit_id: string; is_accepted: boolean; suggested_fix: string; message: string }> {
    return this.request(`/brands/${brandId}/audit/${auditId}/findings/${findingId}/accept`, {
      method: "POST",
    });
  }

  // --- Analytics & Immutable Audit Ledger ---

  public async getAnalytics(
    brandId: string,
    params?: {
      start_date?: string;
      end_date?: string;
      channel?: string;
      severity?: string;
      rule?: string;
    },
  ): Promise<AnalyticsOverview> {
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    if (params?.channel && params.channel !== "ALL") query.set("channel", params.channel);
    if (params?.severity && params.severity !== "ALL") query.set("severity", params.severity);
    if (params?.rule) query.set("rule", params.rule);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<AnalyticsOverview>(`/brands/${brandId}/analytics${qs}`);
  }

  public async listAuditEvents(
    brandId: string,
    params?: {
      action?: string;
      resource_type?: string;
      actor_email?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditEventItem[]> {
    const query = new URLSearchParams();
    if (params?.action && params.action !== "ALL") query.set("action", params.action);
    if (params?.resource_type && params.resource_type !== "ALL") query.set("resource_type", params.resource_type);
    if (params?.actor_email) query.set("actor_email", params.actor_email);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<AuditEventItem[]>(`/brands/${brandId}/audit-events${qs}`);
  }
}

export interface ReviewItemDetail {
  id: string;
  brand_id: string;
  audit_id: string;
  status: string;
  creator_notes: string;
  reviewer_comments: string;
  reviewed_at: string | null;
  reviewed_by_id: string | null;
  content_snippet: string;
  content_snapshot: string;
  content_hash: string;
  content_version: number;
  findings_snapshot: Array<any>;
  rule_versions_snapshot: Record<string, any>;
  evidence_citations_snapshot: Array<any>;
  revision_history: Array<any>;
  is_stale: boolean;
  overall_score: number;
  created_at: string;
  submitted_by_id: string;
}

export interface AnalyticsOverview {
  brand_id: string;
  total_audits_measured: number;
  passed_audits_measured: number;
  first_time_pass_rate: number;
  total_findings_measured: number;
  accepted_corrections_measured: number;
  correction_rate: number;
  avg_review_turnaround_minutes: number;
  completed_reviews_measured: number;
  is_estimated: boolean;
  audits_over_time: Array<{
    date: string;
    total_audits: number;
    passed_audits: number;
    flagged_audits: number;
    avg_score: number;
  }>;
  violation_categories: Array<{
    category: string;
    count: number;
    percentage: number;
    severity: string;
  }>;
  severity_distribution: Array<{
    severity: string;
    count: number;
    percentage: number;
  }>;
  frequently_violated_rules: Array<{
    rule_reference: string;
    violation_count: number;
    severity: string;
    sample_explanation: string;
  }>;
  recurring_error_patterns: Array<{
    pattern_snippet: string;
    finding_type: string;
    count: number;
    suggested_fix: string;
  }>;
  channel_performance: Array<{
    channel: string;
    audit_count: number;
    avg_score: number;
    pass_rate: number;
  }>;
  review_status_distribution: Record<string, number>;
}

export interface AuditEventItem {
  id: string;
  brand_id: string;
  actor_email: string;
  actor_role: string;
  resource_type: string;
  resource_id: string;
  action: string;
  version_reference: string;
  details: Record<string, any>;
  created_at: string;
}

export const api = new ApiClient();

export type UserRole = "OWNER" | "BRAND_MANAGER" | "CONTENT_CREATOR" | "COMPLIANCE_REVIEWER" | "SUPER_ADMIN";

export interface UserMembership {
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  memberships: UserMembership[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  user: UserProfile;
}

export type RouteId =
  | "overview"
  | "brand-setup"
  | "golden-facts"
  | "brand-rules"
  | "visual-assets"
  | "creator-studio"
  | "audit-history"
  | "review-queue"
  | "analytics"
  | "settings";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  toneGuidelines: string[];
  supported_channels?: string[];
  target_audience?: string;
  brand_voice?: string[];
  preferred_terminology?: Record<string, string>;
  prohibited_terminology?: string[];
  reviewer_contact_email?: string;
  review_thresholds?: {
    auto_pass_min_score?: number;
    escalate_below_score?: number;
    target_sla_hours?: number;
    require_human_review_for_critical?: boolean;
  };
  activeRulesCount: number;
  goldenFactsCount: number;
}

export interface GoldenFact {
  id: string;
  brandId?: string;
  brand_id?: string;
  category: string;
  title: string;
  claimStatement: string;
  claim_statement?: string;
  value?: string | null;
  unit?: string | null;
  sourceDocument: string;
  source_document?: string;
  effectiveDate?: string | null;
  effective_date?: string | null;
  expiryDate?: string | null;
  expiry_date?: string | null;
  approvalStatus?: string;
  approval_status?: string;
  version?: number;
  superseded_by_id?: string | null;
  lastVerified?: string;
  status?: "INDEXED" | "PENDING_SYNC" | "OUTDATED" | "SUPERSEDED";
  is_active?: boolean;
  vectorDimensions?: number;
  created_at?: string;
}

export interface BrandRule {
  id: string;
  brandId?: string;
  brand_id?: string;
  ruleType: string;
  rule_type?: string;
  name: string;
  description?: string;
  patternOrInstruction: string;
  pattern_or_instruction?: string;
  severity: "CRITICAL" | "WARNING" | "SUGGESTION";
  enforcementMode?: string;
  enforcement_mode?: string;
  explanation: string;
  explanation_template?: string;
  sourceReference?: string;
  source_reference?: string;
  channels: string[];
  applies_to_channels?: string[];
  isActive?: boolean;
  is_active?: boolean;
  version?: number;
  isDraft?: boolean;
  is_draft?: boolean;
  draftChanges?: Record<string, any>;
  draft_changes?: Record<string, any>;
  created_at?: string;
}

export interface RuleAuditLogEntry {
  id: string;
  rule_id: string;
  actor_name: string;
  action: string;
  version: number;
  changes_summary: string;
  created_at: string;
}

export interface VisualAsset {
  id: string;
  brandId?: string;
  brand_id?: string;
  name: string;
  assetType: string;
  asset_type?: string;
  previewUrl?: string;
  file_path?: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  hexCode?: string;
  aspectRatio?: string;
  clearanceMarginPx?: number;
  metadata_json?: Record<string, any>;
  is_active?: boolean;
  updatedAt?: string;
  created_at?: string;
}

export interface CSVPreview {
  filename: string;
  total_rows: number;
  headers: string[];
  suggested_mapping: Record<string, string>;
  sample_rows: Record<string, string>[];
}

export interface CSVImportRowError {
  row_number: number;
  field: string;
  error: string;
  row_data: Record<string, any>;
}

export interface CSVImportResult {
  total_processed: number;
  imported_count: number;
  failed_count: number;
  errors: CSVImportRowError[];
}

export interface AuditFinding {
  id: string;
  findingType: "FACTUAL_INACCURACY" | "PROHIBITED_TERM" | "PROHIBITED_CLAIM" | "MISSING_DISCLOSURE" | "TONE_DEVIATION" | "COLOR_MISMATCH" | "ASPECT_RATIO";
  severity: "CRITICAL" | "WARNING" | "SUGGESTION";
  originalSnippet: string;
  explanation: string;
  citationReference: string;
  suggestedFix: string;
  isApplied?: boolean;
}

export interface AuditRecord {
  id: string;
  brandId: string;
  timestamp: string;
  channel: "linkedin" | "twitter" | "blog" | "press_release" | "email";
  contentType: "TEXT" | "IMAGE" | "MULTIMODAL";
  contentSnippet: string;
  overallScore: number;
  status: "PASSED" | "WARNINGS_RESOLVABLE" | "NEEDS_REVIEW" | "REJECTED";
  summary: string;
  findings: AuditFinding[];
  authorName: string;
}

export type ReviewStatusType =
  | "DRAFT"
  | "AUDIT_COMPLETED"
  | "AWAITING_REVIEW"
  | "PENDING"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMITTED";

export interface ReviewQueueItem {
  id: string;
  brandId: string;
  auditId: string;
  creatorName: string;
  creatorNotes: string;
  submittedAt: string;
  status: ReviewStatusType;
  reviewerComments?: string;
  contentSnippet: string;
  contentSnapshot?: string;
  contentHash?: string;
  contentVersion?: number;
  channel: string;
  overallScore: number;
  findingsCount: number;
  findingsSnapshot?: Array<any>;
  ruleVersionsSnapshot?: Record<string, any>;
  revisionHistory?: Array<any>;
  isStale?: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export type ResolvedThemeMode = "light" | "dark";

export type AccentColor = "orange" | "indigo" | "violet" | "ocean" | "emerald" | "rose" | "amber" | "teal";

export interface AccentOption {
  id: AccentColor;
  label: string;
  previewColor: string;
  badgeClass: string;
  description: string;
}

export type VisualPresetId = "obsidian" | "midnight" | "aurora" | "nebula" | "oceanic" | "minimal";

export type SurfaceTranslucency = "solid" | "medium" | "heavy";

export type MotionIntensity = "paused" | "gentle" | "normal" | "vibrant";

export interface VisualPreset {
  id: VisualPresetId;
  label: string;
  tagline: string;
  description: string;
  previewColors: [string, string, string];
  accentColor: AccentColor;
  translucency: SurfaceTranslucency;
  motionIntensity: MotionIntensity;
}

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  History,
  Trash2,
  Clock,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  ArrowRight,
  RefreshCw,
  XCircle,
  Copy,
  Image as ImageIcon,
  Palette,
  Eye,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Input, Textarea, Select } from "../design-system/FormControls";
import { Modal } from "../design-system/Modal";
import { EmptyState } from "../design-system/EmptyState";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { PageHeader } from "../components/PageHeader";
import { useNotification } from "../context/NotificationContext";
import { MOCK_GOLDEN_FACTS } from "../data/mockData";
import { GoldenFact, CSVPreview, CSVImportResult } from "../types";
import { api } from "../api/client";

const CATEGORIES = [
  "All",
  "SLA & Performance",
  "Pricing & Plans",
  "Security & Privacy",
  "Product Specs",
  "Architecture & Scale",
  "Legal & Disclaimers",
];

const STATUS_FILTERS = ["ALL", "APPROVED", "DRAFT", "OUTDATED", "SUPERSEDED"];

export interface BrandImageReference {
  id: string;
  title: string;
  channel: string;
  aspectRatio: string;
  dimensions: string;
  imageUrl: string;
  category: "Campaign Banner" | "Social Square" | "Editorial Header" | "Logo & Glyph" | "Customer Proof";
  companyExpectation: string;
  dominantPalette: { hex: string; name: string }[];
  maxDeltaE: number;
  logoClearancePx: number;
  dos: string[];
  donts: string[];
  status: "APPROVED" | "RECOMMENDED" | "MANDATORY";
}

const IMAGE_CATEGORIES = [
  "All",
  "Campaign Banner",
  "Social Square",
  "Editorial Header",
  "Logo & Glyph",
  "Customer Proof",
];

export const APPROVED_IMAGE_REFERENCES: BrandImageReference[] = [
  {
    id: "ref-img-1",
    title: "Q1 Cloud Infrastructure Campaign Hero Banner",
    channel: "LinkedIn Sponsored (1.91:1)",
    aspectRatio: "1.91:1",
    dimensions: "1200 x 628 px",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    category: "Campaign Banner",
    companyExpectation: "Official banner for all paid LinkedIn sponsored updates and organic executive posts. Dark obsidian slate background with warm sunset ember curvature. Keep copy overlay under 20% area with min 4.5:1 WCAG contrast.",
    dominantPalette: [
      { hex: "#0F172A", name: "Obsidian Slate" },
      { hex: "#F26A0F", name: "Sunset Ember" },
    ],
    maxDeltaE: 10.0,
    logoClearancePx: 24,
    dos: [
      "Use high-resolution 1200x628 canvas at 72 or 144 DPI",
      "Anchor logo top-left or bottom-right with 24px safety buffer",
      "Pair with verified claims from Golden Facts (100-300 words)",
    ],
    donts: [
      "Do NOT stretch or squash to 16:9 or 1:1 aspect ratios",
      "Do NOT apply cold blue or unapproved neon gradient overlays",
      "Do NOT cover more than 20% of the image surface area with text",
    ],
    status: "APPROVED",
  },
  {
    id: "ref-img-2",
    title: "Product Feature Spotlight & Carousel Slide",
    channel: "Instagram / Community (1:1)",
    aspectRatio: "1:1",
    dimensions: "1080 x 1080 px",
    imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&q=80",
    category: "Social Square",
    companyExpectation: "Dedicated square format for feature highlights and event carousels. Minimal abstract geometry with centered focal point. Brand emblem must remain legible at mobile feed resolutions.",
    dominantPalette: [
      { hex: "#18121F", name: "Deep Charcoal" },
      { hex: "#E8650D", name: "Vibrant Flame" },
    ],
    maxDeltaE: 12.0,
    logoClearancePx: 32,
    dos: [
      "Ensure 1:1 perfect square aspect ratio (1080x1080)",
      "Center primary technical graphic within 800px inner circle",
      "Check thumbnail legibility at 150px feed size",
    ],
    donts: [
      "Do NOT use busy stock imagery with artificial models or watermarks",
      "Do NOT place critical copy closer than 60px from any outer border",
    ],
    status: "RECOMMENDED",
  },
  {
    id: "ref-img-3",
    title: "Enterprise Architecture & Whitepaper Header",
    channel: "Website Blog & X / Twitter (16:9)",
    aspectRatio: "16:9",
    dimensions: "1920 x 1080 px",
    imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
    category: "Editorial Header",
    companyExpectation: "Top-of-article graphic for technical blog posts and whitepapers. Uses abstract layered ribbons expressing data pipeline fluidity. Clear right half for editorial title placement.",
    dominantPalette: [
      { hex: "#110D17", name: "Void Dark" },
      { hex: "#FF7A1A", name: "Warm Amber" },
    ],
    maxDeltaE: 12.0,
    logoClearancePx: 24,
    dos: [
      "Maintain clean, uncluttered negative space on right edge",
      "Keep color saturation restrained and enterprise-grade",
      "Render at crisp 2x retina density for desktop readability",
    ],
    donts: [
      "Do NOT use generic stock photos of server racks or blue circuit boards",
      "Do NOT use harsh magenta, lime green, or non-brand tints",
    ],
    status: "APPROVED",
  },
  {
    id: "ref-img-4",
    title: "Primary Wordmark & Emblem Clearance Specification",
    channel: "Global Brand Identity",
    aspectRatio: "4:1",
    dimensions: "Vector SVG / 1600 x 400 px",
    imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&q=80",
    category: "Logo & Glyph",
    companyExpectation: "Required logo presentation across all marketing materials. The orange ember mark must precede the wordmark. Minimum safe exclusion zone equal to the height of the letter 'I' around all sides.",
    dominantPalette: [
      { hex: "#F26A0F", name: "Sunset Ember" },
      { hex: "#FFFFFF", name: "Pure White" },
    ],
    maxDeltaE: 5.0,
    logoClearancePx: 32,
    dos: [
      "Preserve original vector geometry without stroke distortion",
      "Use white wordmark exclusively on dark slate backgrounds",
      "Maintain minimum 32px height for print and 24px for web displays",
    ],
    donts: [
      "NEVER change glyph color from approved #F26A0F",
      "NEVER rotate, skew, stretch, or outline the emblem",
      "NEVER place on low-contrast peach, yellow, or bright orange backgrounds",
    ],
    status: "MANDATORY",
  },
  {
    id: "ref-img-5",
    title: "Executive Customer Testimonial & Case Study Card",
    channel: "Customer Stories / LinkedIn (1.91:1)",
    aspectRatio: "1.91:1",
    dimensions: "1200 x 628 px",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
    category: "Customer Proof",
    companyExpectation: "Format for quoting customer CTOs and enterprise brand leaders. Professional enterprise portrait tinted with subtle monochrome warm vignette. Customer logo placed at 70% opacity in lower quadrant.",
    dominantPalette: [
      { hex: "#1A1423", name: "Dark Indigo" },
      { hex: "#FFC48A", name: "Soft Peach Highlight" },
    ],
    maxDeltaE: 14.0,
    logoClearancePx: 20,
    dos: [
      "Use high-resolution black & white or duotone headshots",
      "Limit quote to under 25 words in 24px clean typography",
      "Include full executive name, official title, and verified enterprise name",
    ],
    donts: [
      "Do NOT use unverified or anonymized quotes without legal signoff",
      "Do NOT use colored customer logos that clash with brand palette",
    ],
    status: "APPROVED",
  },
];

export const GoldenFactsView: React.FC = () => {
  const { activeBrand, isDemoMode, activeRole, setCurrentRoute } = useWorkspace();
  const isAdmin = activeRole === "BRAND_MANAGER";
  const { showToast } = useNotification();

  // Tab: Ground Truth Facts vs Image References
  const [referenceTab, setReferenceTab] = useState<"facts" | "images">("facts");
  const [selectedImageCategory, setSelectedImageCategory] = useState<string>("All");
  const [inspectingImage, setInspectingImage] = useState<BrandImageReference | null>(null);

  const handleSendToCreatorStudio = (img: BrandImageReference) => {
    try {
      sessionStorage.setItem("inkloom_selected_reference_image", JSON.stringify(img));
    } catch (_) {}
    showToast({
      type: "success",
      title: "Reference Image Selected",
      message: `Loaded "${img.title}" into Creator Studio. Switching to drafting canvas...`,
    });
    setCurrentRoute("creator-studio");
  };

  const handleCopyImageUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    showToast({
      type: "info",
      title: "Asset URL Copied",
      message: `Copied approved high-resolution asset link for "${title}".`,
    });
  };

  const handleCopyCitation = (fact: GoldenFact) => {
    const citation = `[Source: ${fact.sourceDocument}] "${fact.claimStatement}"`;
    navigator.clipboard.writeText(citation);
    showToast({
      type: "info",
      title: "Citation Copied",
      message: `Copied citation for "${fact.title}" to clipboard.`,
    });
  };

  const [facts, setFacts] = useState<GoldenFact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSupersedeModalOpen, setIsSupersedeModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFactForSupersede, setSelectedFactForSupersede] = useState<GoldenFact | null>(null);
  const [successorFactId, setSuccessorFactId] = useState<string>("");
  const [previewingSourceFact, setPreviewingSourceFact] = useState<GoldenFact | null>(null);

  // Add / Edit Fact Form State
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("SLA & Performance");
  const [formClaim, setFormClaim] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formEffectiveDate, setFormEffectiveDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formApprovalStatus, setFormApprovalStatus] = useState("APPROVED");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Import Wizard State
  const [csvStep, setCsvStep] = useState<1 | 2 | 3>(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [strictMode, setStrictMode] = useState<boolean>(true);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Fetch facts
  const fetchFacts = useCallback(async () => {
    if (!activeBrand?.id) return;
    if (isDemoMode || !api.hasTokens()) {
      setFacts(MOCK_GOLDEN_FACTS);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.listFacts(activeBrand.id, {
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        q: searchTerm || undefined,
      });

      // Normalize fields from backend snake_case to frontend camelCase
      const normalized: GoldenFact[] = data.map((f: any) => ({
        id: f.id,
        brandId: f.brand_id,
        category: f.category,
        title: f.title,
        claimStatement: f.claim_statement,
        value: f.value,
        unit: f.unit,
        sourceDocument: f.source_document,
        effectiveDate: f.effective_date,
        expiryDate: f.expiry_date,
        approvalStatus: f.approval_status || "APPROVED",
        version: f.version || 1,
        superseded_by_id: f.superseded_by_id,
        lastVerified: f.created_at ? f.created_at.split("T")[0] : undefined,
        status: f.approval_status === "OUTDATED" ? "OUTDATED" : f.approval_status === "SUPERSEDED" ? "SUPERSEDED" : "INDEXED",
        vectorDimensions: 768,
      }));
      setFacts(normalized);
    } catch (err: any) {
      console.error("Failed to load facts:", err);
      // Fallback to mock on error
      setFacts(MOCK_GOLDEN_FACTS);
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand.id, isDemoMode, selectedCategory, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setEditingFactId(null);
    setFormTitle("");
    setFormCategory("SLA & Performance");
    setFormClaim("");
    setFormValue("");
    setFormUnit("");
    setFormSource("");
    setFormEffectiveDate("");
    setFormExpiryDate("");
    setFormApprovalStatus("APPROVED");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (fact: GoldenFact) => {
    setEditingFactId(fact.id);
    setFormTitle(fact.title);
    setFormCategory(fact.category);
    setFormClaim(fact.claimStatement);
    setFormValue(fact.value || "");
    setFormUnit(fact.unit || "");
    setFormSource(fact.sourceDocument);
    setFormEffectiveDate(fact.effectiveDate || "");
    setFormExpiryDate(fact.expiryDate || "");
    setFormApprovalStatus(fact.approvalStatus || "APPROVED");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Fact
  const handleSubmitFact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formExpiryDate && formEffectiveDate && formExpiryDate < formEffectiveDate) {
      setFormError("Expiry date cannot be earlier than the effective date.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formTitle,
      category: formCategory,
      claim_statement: formClaim,
      value: formValue || null,
      unit: formUnit || null,
      source_document: formSource,
      effective_date: formEffectiveDate || null,
      expiry_date: formExpiryDate || null,
      approval_status: formApprovalStatus,
    };

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        if (editingFactId) {
          await api.updateFact(activeBrand.id, editingFactId, payload);
          showToast({
            type: "success",
            title: "Golden Fact Updated",
            message: `Updated "${formTitle}" (v${(facts.find((f) => f.id === editingFactId)?.version || 1) + 1}).`,
          });
        } else {
          await api.createFact(activeBrand.id, payload);
          showToast({
            type: "success",
            title: "Golden Fact Created & Indexed",
            message: `Generated 768-dim embedding into pgvector partition for ${activeBrand.name}.`,
          });
        }
        await fetchFacts();
      } else {
        // Demo mode fallback
        const mockNew: GoldenFact = {
          id: editingFactId || `fact-${Date.now()}`,
          brandId: activeBrand.id,
          category: formCategory,
          title: formTitle,
          claimStatement: formClaim,
          value: formValue,
          unit: formUnit,
          sourceDocument: formSource,
          effectiveDate: formEffectiveDate,
          expiryDate: formExpiryDate,
          approvalStatus: formApprovalStatus,
          version: editingFactId ? (facts.find((f) => f.id === editingFactId)?.version || 1) + 1 : 1,
          lastVerified: new Date().toISOString().split("T")[0],
          status: formApprovalStatus === "OUTDATED" ? "OUTDATED" : formApprovalStatus === "SUPERSEDED" ? "SUPERSEDED" : "INDEXED",
          vectorDimensions: 768,
        };
        setFacts((prev) =>
          editingFactId ? prev.map((f) => (f.id === editingFactId ? mockNew : f)) : [mockNew, ...prev]
        );
        showToast({
          type: "success",
          title: editingFactId ? "Fact Updated (Demo)" : "Fact Indexed (Demo)",
          message: `Saved "${formTitle}".`,
        });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save fact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Outdated
  const handleMarkOutdated = async (fact: GoldenFact) => {
    if (!window.confirm(`Mark fact "${fact.title}" as outdated? Creators will be alerted if using this claim.`)) {
      return;
    }
    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.markFactOutdated(activeBrand.id, fact.id);
        await fetchFacts();
        showToast({
          type: "info",
          title: "Fact Marked Outdated",
          message: `Fact "${fact.title}" is now marked outdated.`,
        });
      } catch (err: any) {
        showToast({ type: "error", title: "Action Failed", message: err.message });
      }
    } else {
      setFacts((prev) =>
        prev.map((f) => (f.id === fact.id ? { ...f, approvalStatus: "OUTDATED", status: "OUTDATED" } : f))
      );
      showToast({ type: "info", title: "Fact Marked Outdated (Demo)", message: fact.title });
    }
  };

  // Open Supersede Modal
  const handleOpenSupersedeModal = (fact: GoldenFact) => {
    setSelectedFactForSupersede(fact);
    setSuccessorFactId("");
    setIsSupersedeModalOpen(true);
  };

  // Confirm Supersede
  const handleConfirmSupersede = async () => {
    if (!selectedFactForSupersede) return;
    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.supersedeFact(activeBrand.id, selectedFactForSupersede.id, successorFactId || undefined);
        await fetchFacts();
        showToast({
          type: "info",
          title: "Fact Superseded",
          message: `Fact marked superseded by newer ground truth.`,
        });
      } catch (err: any) {
        showToast({ type: "error", title: "Supersede Failed", message: err.message });
      }
    } else {
      setFacts((prev) =>
        prev.map((f) =>
          f.id === selectedFactForSupersede.id
            ? { ...f, approvalStatus: "SUPERSEDED", status: "SUPERSEDED", superseded_by_id: successorFactId || null }
            : f
        )
      );
    }
    setIsSupersedeModalOpen(false);
  };

  // Delete Fact
  const handleDeleteFact = async (fact: GoldenFact) => {
    if (!window.confirm(`Permanently delete fact "${fact.title}"? This removes its pgvector embedding.`)) {
      return;
    }
    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.deleteFact(activeBrand.id, fact.id);
        await fetchFacts();
        showToast({
          type: "success",
          title: "Fact Deleted",
          message: `Removed "${fact.title}" from knowledge base.`,
        });
      } catch (err: any) {
        showToast({ type: "error", title: "Deletion Failed", message: err.message });
      }
    } else {
      setFacts((prev) => prev.filter((f) => f.id !== fact.id));
      showToast({ type: "success", title: "Fact Deleted (Demo)", message: fact.title });
    }
  };

  // CSV File Selection & Preview Call
  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const text = await file.text();
    setCsvRawText(text);

    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        const preview = await api.previewCSV(activeBrand.id, file);
        setCsvPreview(preview);
        setColumnMapping(preview.suggested_mapping || {});
        setCsvStep(2);
      } catch (err: any) {
        showToast({
          type: "error",
          title: "CSV Parse Failed",
          message: err.message || "Unable to parse CSV structure.",
        });
      }
    } else {
      // Demo preview simulation
      const preview: CSVPreview = {
        filename: file.name,
        total_rows: 5,
        headers: ["title", "claim", "value", "unit", "category", "source"],
        suggested_mapping: {
          title: "title",
          claim_statement: "claim",
          value: "value",
          unit: "unit",
          category: "category",
          source_document: "source",
        },
        sample_rows: [
          {
            title: "99.99% Uptime Guarantee",
            claim: "Nexus Cloud maintains enterprise 99.99% multi-region uptime.",
            value: "99.99",
            unit: "%",
            category: "SLA & Performance",
            source: "Enterprise SLA v3.2",
          },
          {
            title: "SOC 2 Type II Certified",
            claim: "Audited annually across all five trust service criteria.",
            value: "Annual",
            unit: "",
            category: "Security & Privacy",
            source: "Security Whitepaper",
          },
        ],
      };
      setCsvPreview(preview);
      setColumnMapping(preview.suggested_mapping);
      setCsvStep(2);
    }
  };

  // Execute CSV Import
  const handleExecuteImport = async () => {
    if (!csvRawText) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        const result: CSVImportResult = await api.importCSV(activeBrand.id, csvRawText, columnMapping, strictMode);
        setImportResult(result);
        if (result.errors.length === 0) {
          showToast({
            type: "success",
            title: "CSV Ingestion Succeeded",
            message: `Imported and indexed ${result.imported_count} Golden Facts into pgvector.`,
          });
          await fetchFacts();
          setTimeout(() => {
            setIsUploadModalOpen(false);
            setCsvStep(1);
          }, 1500);
        } else {
          setCsvStep(3); // Show error table
        }
      } else {
        // Demo mode
        showToast({
          type: "success",
          title: "Spreadsheet Ingested (Demo)",
          message: `Parsed facts from ${csvFile?.name || "spreadsheet"}.`,
        });
        setIsUploadModalOpen(false);
        setCsvStep(1);
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Import Failed",
        message: err.message || "Failed to import CSV.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (fact: GoldenFact) => {
    const status = fact.approvalStatus || (fact.status === "OUTDATED" ? "OUTDATED" : "APPROVED");
    if (status === "APPROVED") {
      return (
        <Badge variant="success" size="sm">
          <Check className="h-3 w-3 mr-1" /> Approved (v{fact.version || 1})
        </Badge>
      );
    }
    if (status === "DRAFT") {
      return (
        <Badge variant="warning" size="sm">
          <Clock className="h-3 w-3 mr-1" /> Draft (v{fact.version || 1})
        </Badge>
      );
    }
    if (status === "OUTDATED") {
      return (
        <Badge variant="danger" size="sm">
          <AlertCircle className="h-3 w-3 mr-1" /> Outdated (v{fact.version || 1})
        </Badge>
      );
    }
    if (status === "SUPERSEDED") {
      return (
        <Badge variant="neutral" size="sm">
          <History className="h-3 w-3 mr-1" /> Superseded (v{fact.version || 1})
        </Badge>
      );
    }
    return <Badge variant="neutral" size="sm">v{fact.version || 1}</Badge>;
  };

  const totalFactsCount = facts.length;
  const approvedFactsCount = facts.filter((f) => f.approvalStatus === "APPROVED").length;
  const outdatedCount = facts.filter((f) => f.approvalStatus === "OUTDATED" || f.approvalStatus === "SUPERSEDED").length;
  const categoriesCount = new Set(facts.map((f) => f.category)).size;

  const filteredImages = APPROVED_IMAGE_REFERENCES.filter((img) => {
    if (selectedImageCategory !== "All" && img.category !== selectedImageCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        img.title.toLowerCase().includes(q) ||
        img.companyExpectation.toLowerCase().includes(q) ||
        img.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Standardized Compact Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Golden Facts"
        description="Verified ground-truth facts and approved claims your team can cite."
        technicalDetails="PGVECTOR 768D KNOWLEDGE STORE — Brand-isolated vector partitions with deterministic source traceability."
        isAdmin={isAdmin}
        actions={
          isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCsvStep(1);
                  setCsvFile(null);
                  setCsvPreview(null);
                  setImportResult(null);
                  setIsUploadModalOpen(true);
                }}
                leftIcon={<Upload className="h-4 w-4" />}
                className="font-medium"
              >
                Import CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddModal}
                leftIcon={<Plus className="h-4 w-4" />}
                className="font-bold shadow-glow"
              >
                Add Golden Fact
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Reference Type Switcher: Ground Truth Facts vs Brand Image References */}
      <div className="surface-glass rounded-2xl p-1.5 border border-[var(--glass-border)] shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setReferenceTab("facts")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            referenceTab === "facts"
              ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-accent-glow"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Ground Truth Facts ({facts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setReferenceTab("images")}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            referenceTab === "images"
              ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-accent-glow"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Brand Image References ({APPROVED_IMAGE_REFERENCES.length})</span>
          <Badge variant={referenceTab === "images" ? "brand" : "neutral"} size="sm">
            Visual Guidelines
          </Badge>
        </button>
      </div>

      {/* =======================================================================
          TAB 1: Ground Truth Facts (Text Claims & Knowledge Partition)
          ======================================================================= */}
      {referenceTab === "facts" && (
        <div className="space-y-6">
          {/* 4 Metric Cards — Equal Height, Tabular Numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Verified Facts</span>
            <BookOpen className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={totalFactsCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">active claims</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Indexed Vectors</span>
            <Layers className="h-4 w-4 text-cyan-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={totalFactsCount * 768} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">768-dim floats</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Active Categories</span>
            <Tag className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={categoriesCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">taxonomy groups</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Lifecycle Status</span>
            <History className="h-4 w-4 text-[var(--color-warning)] opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={outdatedCount} />
            </span>
            <span className="text-[13px] text-[var(--color-warning)]">
              {outdatedCount > 0 ? "outdated / superseded" : "all up to date"}
            </span>
          </div>
        </div>
      </div>

      {/* Curated Library Filtering and Search Controls */}
      <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md relative flex items-center">
            <Search className="h-4 w-4 absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search claims, documents, metrics, or citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-primary)] transition-all duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                title="Clear search"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {searchTerm && (
              <div className="text-xs font-mono text-[var(--accent-text)] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span>{facts.length} match{facts.length === 1 ? "" : "es"}</span>
              </div>
            )}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={STATUS_FILTERS.map((s) => ({ value: s, label: s === "ALL" ? "All Lifecycle Statuses" : s }))}
              className="text-xs min-w-[140px]"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchFacts}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              title="Refresh facts from database"
              className="text-xs"
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Category Tabs with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[var(--border-subtle)] scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = cat === "All" ? facts.length : facts.filter((f) => f.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all interactive-pill cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facts Knowledge Library Grid */}
      {isLoading ? (
        <div className="p-16 surface-glass rounded-3xl border border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
          <p className="font-medium text-[var(--text-secondary)]">Loading pgvector Golden Facts partition...</p>
        </div>
      ) : facts.length === 0 ? (
        <EmptyState
          preset={searchTerm ? "search" : "default"}
          title={searchTerm ? "No Matching Claims Found" : "No Golden Facts Indexed"}
          description={
            searchTerm || selectedCategory !== "All"
              ? `No claims match "${searchTerm}" in ${selectedCategory}. Try adjusting your search query.`
              : "Golden Facts serve as authoritative ground truth for fact-checking AI drafts against real specs."
          }
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
              Create First Fact
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="surface-glass surface-tactile interactive-card micro-lift rounded-2xl p-5 border border-[var(--glass-border)] shadow-xs hover:border-[var(--border-strong)] transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                {/* Bookplate Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                      {fact.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-subtle)] px-1.5 py-0.5 rounded">
                      v{fact.version || 1}
                    </span>
                  </div>
                  {getStatusBadge(fact)}
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight mb-2">
                  {fact.title}
                </h3>

                {/* Ground Truth Claim Block */}
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-subtle)] p-3.5 rounded-xl border border-[var(--border-subtle)] relative">
                  <span className="text-base font-serif text-[var(--accent-text)] opacity-40 select-none mr-1">“</span>
                  <span className="font-normal text-[var(--text-primary)]">{fact.claimStatement}</span>
                  <span className="text-base font-serif text-[var(--accent-text)] opacity-40 select-none ml-1">”</span>
                </div>

                {/* Exact Value / Metric Chip */}
                {(fact.value || fact.unit) && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-mono">Canonical Metric:</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] text-xs font-mono font-bold">
                      {fact.value} {fact.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Provenance & Citation Strip */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewingSourceFact(fact)}
                    className="flex items-center gap-1.5 truncate max-w-[220px] text-left hover:text-[var(--accent-primary)] group/cite cursor-pointer transition-colors"
                    title="Inspect Source Document Dossier"
                  >
                    <FileText className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />
                    <span className="font-semibold text-[var(--text-secondary)] group-hover/cite:text-[var(--accent-primary)] truncate underline decoration-dotted underline-offset-2">
                      {fact.sourceDocument}
                    </span>
                  </button>

                  {(fact.effectiveDate || fact.expiryDate) && (
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                      <Calendar className="h-3 w-3" />
                      {fact.effectiveDate || "–"} → {fact.expiryDate || "Ongoing"}
                    </span>
                  )}
                </div>

                {fact.superseded_by_id && (
                  <div className="text-[10px] text-[var(--color-warning)] flex items-center gap-1.5 p-1.5 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)]">
                    <History className="h-3 w-3 shrink-0" />
                    <span>Superseded by fact: <code className="font-mono font-bold">{fact.superseded_by_id}</code></span>
                  </div>
                )}

                {/* Action Buttons — Role Aware */}
                <div className="flex items-center justify-between pt-1">
                  {isAdmin ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewingSourceFact(fact)}
                        className="text-xs px-2 h-7 text-[var(--accent-text)] font-medium"
                        leftIcon={<FileText className="h-3 w-3" />}
                      >
                        Citation Dossier
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(fact)}
                          className="text-xs px-2 h-7"
                        >
                          Edit
                        </Button>

                        {fact.approvalStatus !== "OUTDATED" && fact.approvalStatus !== "SUPERSEDED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkOutdated(fact)}
                            className="text-xs px-2 h-7 text-[var(--color-warning)]"
                            title="Mark as outdated without deleting"
                          >
                            Outdated
                          </Button>
                        )}

                        {fact.approvalStatus !== "SUPERSEDED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenSupersedeModal(fact)}
                            className="text-xs px-2 h-7 text-[var(--accent-primary)]"
                            title="Supersede with newer ground truth"
                          >
                            Supersede
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFact(fact)}
                          className="text-xs px-2 h-7 text-[var(--color-danger)]"
                          title="Permanently delete fact"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyCitation(fact)}
                        className="text-xs px-2.5 h-7 text-[var(--accent-text)] font-medium"
                        leftIcon={<Copy className="h-3.5 w-3.5" />}
                      >
                        Copy Citation
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewingSourceFact(fact)}
                        className="text-xs px-2 h-7 text-[var(--text-muted)]"
                        leftIcon={<FileText className="h-3 w-3" />}
                      >
                        Source Info
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}

      {/* =======================================================================
          TAB 2: Brand Image References & Visual Guidelines (FOR CREATORS)
          ======================================================================= */}
      {referenceTab === "images" && (
        <div className="space-y-6">
          {/* Visual Standards 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Approved Visuals</span>
                <ImageIcon className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  <AnimatedCounter value={APPROVED_IMAGE_REFERENCES.length} />
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">brand assets</span>
              </div>
            </div>

            <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Channel Specs</span>
                <Layers className="h-4 w-4 text-cyan-400 opacity-80" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  4
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">aspect ratios</span>
              </div>
            </div>

            <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Color Tolerance</span>
                <Palette className="h-4 w-4 text-emerald-400 opacity-80" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums text-emerald-400 font-mono">
                  ΔE ≤ 12.0
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">CIEDE2000</span>
              </div>
            </div>

            <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Logo Clearance</span>
                <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  16–32px
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">safety margin</span>
              </div>
            </div>
          </div>

          {/* Company Visual Expectations Banner */}
          <div className="p-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/30 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase font-bold text-[var(--accent-text)] tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                <span>What The Company Expects With Creative Imagery</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)]">
                Dual-Engine Evaluation Contract
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every marketing and social visual representing <strong className="text-[var(--text-primary)]">Nexus Cloud</strong> is algorithmically checked by our computer vision engine. Creative images must strictly preserve our Obsidian Slate & Sunset Ember signature palette (<span className="text-[var(--accent-text)] font-mono font-bold">#0F172A</span> and <span className="text-[var(--accent-text)] font-mono font-bold">#F26A0F</span>), respect channel aspect ratios without stretching, and guarantee a minimum 4.5:1 WCAG AA text contrast ratio.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                ✓ LinkedIn: 1.91:1 (1200x628px)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                ✓ Instagram: 1:1 (1080x1080px)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                ✓ Editorial: 16:9 (1920x1080px)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                ✓ Minimum 16px Logo Safe Zone
              </span>
            </div>
          </div>

          {/* Filtering and Search Controls for Images */}
          <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 max-w-md relative flex items-center">
                <Search className="h-4 w-4 absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search image references, channels, specifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-primary)] transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs font-mono text-[var(--accent-text)] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span>{filteredImages.length} approved reference{filteredImages.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[var(--border-subtle)] scrollbar-none">
              {IMAGE_CATEGORIES.map((cat) => {
                const count = cat === "All" ? APPROVED_IMAGE_REFERENCES.length : APPROVED_IMAGE_REFERENCES.filter((img) => img.category === cat).length;
                const isSelected = selectedImageCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedImageCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all interactive-pill cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image References Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="surface-glass surface-tactile interactive-card micro-lift rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-xs hover:border-[var(--border-strong)] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Preview Header */}
                  <div className="relative aspect-video w-full bg-black/40 overflow-hidden border-b border-[var(--border-subtle)]">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/20">
                        {img.aspectRatio}
                      </span>
                      <Badge
                        variant={img.status === "MANDATORY" ? "danger" : img.status === "APPROVED" ? "success" : "brand"}
                        size="sm"
                      >
                        {img.status}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
                      {img.dimensions}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--accent-text)] tracking-wider block">
                        {img.channel}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                        {img.title}
                      </h3>
                    </div>

                    {/* What Company Expects Callout */}
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-[var(--accent-primary)]" />
                        Company Expectation:
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {img.companyExpectation}
                      </p>
                    </div>

                    {/* Dominant Palette Swatches & Tolerance */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--text-muted)] font-semibold">Expected Palette:</span>
                        <span className="font-mono text-emerald-400 font-bold">Max ΔE ≤ {img.maxDeltaE}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {img.dominantPalette.map((color) => (
                          <div
                            key={color.hex}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px]"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full inline-block border border-white/20 shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-mono text-[var(--text-primary)] font-bold">{color.hex}</span>
                            <span className="text-[var(--text-muted)] text-[10px]">({color.name})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Do's & Don'ts Quick Tips */}
                    <div className="space-y-1.5 pt-1 border-t border-[var(--border-subtle)] text-[11px]">
                      <div className="flex items-start gap-1.5 text-emerald-400">
                        <Check className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">{img.dos[0]}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-rose-400">
                        <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">{img.donts[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendToCreatorStudio(img)}
                    leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                    className="flex-1 text-xs font-bold"
                  >
                    Use in Creator Studio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectingImage(img)}
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                    className="text-xs px-2.5"
                  >
                    Specs
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyImageUrl(img.imageUrl, img.title)}
                    leftIcon={<Copy className="h-3.5 w-3.5" />}
                    className="text-xs px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    title="Copy high-res image link"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Image Reference Specification Modal */}
      {inspectingImage && (
        <Modal
          isOpen={!!inspectingImage}
          onClose={() => setInspectingImage(null)}
          title={inspectingImage.title}
          description={`Approved brand image standard for ${inspectingImage.channel}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            <div className="relative rounded-xl overflow-hidden border border-[var(--border-default)] bg-black/60 max-h-72 flex items-center justify-center">
              <img
                src={inspectingImage.imageUrl}
                alt={inspectingImage.title}
                className="max-h-72 w-full object-contain"
              />
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-[11px] border border-white/20">
                {inspectingImage.dimensions} • Ratio: {inspectingImage.aspectRatio}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[var(--accent-text)] tracking-wider block">
                Company Brand Expectation
              </span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {inspectingImage.companyExpectation}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Colorimetric Tolerances
                </span>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  CIEDE2000 ΔE ≤ {inspectingImage.maxDeltaE}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {inspectingImage.dominantPalette.map((col) => (
                    <span
                      key={col.hex}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                    >
                      <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: col.hex }} />
                      <span>{col.hex}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Layout & Logo Clearance
                </span>
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">
                  {inspectingImage.logoClearancePx}px Exclusion Zone
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Keep copy overlay under 20% surface area with minimum 4.5:1 WCAG contrast.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Visual Do's:
                </span>
                <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                  {inspectingImage.dos.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Visual Don'ts:
                </span>
                <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                  {inspectingImage.donts.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyImageUrl(inspectingImage.imageUrl, inspectingImage.title)}
                leftIcon={<Copy className="h-3.5 w-3.5" />}
              >
                Copy Image URL
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingImage(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleSendToCreatorStudio(inspectingImage);
                    setInspectingImage(null);
                  }}
                  leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                >
                  Use in Creator Studio
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Rich Source Document Citation Preview Modal */}
      {previewingSourceFact && (
        <Modal
          isOpen={!!previewingSourceFact}
          onClose={() => setPreviewingSourceFact(null)}
          title="Verified Source Citation Dossier"
          description="Ground truth provenance and citation evidence for algorithmic fact-checking."
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="surface-glass rounded-xl p-4 border border-[var(--glass-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-text)]">
                  Primary Source Document
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                  v{previewingSourceFact.version || 1}
                </span>
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                {previewingSourceFact.sourceDocument}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Referenced category: <strong className="text-[var(--text-primary)]">{previewingSourceFact.category}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Authoritative Claim Statement
              </label>
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed">
                "{previewingSourceFact.claimStatement}"
              </div>
            </div>

            {(previewingSourceFact.value || previewingSourceFact.unit) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">Exact Value</span>
                  <p className="text-sm font-mono font-bold text-[var(--text-primary)] mt-1">{previewingSourceFact.value || "–"}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">Unit of Measurement</span>
                  <p className="text-sm font-mono font-bold text-[var(--text-primary)] mt-1">{previewingSourceFact.unit || "–"}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">Effective Window</span>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  {previewingSourceFact.effectiveDate || "Immediate"} → {previewingSourceFact.expiryDate || "Ongoing"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">Vector Embedding</span>
                <p className="text-xs font-mono text-[var(--accent-text)] mt-1">
                  pgvector partition / 768-dim
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const citationText = `[Source: ${previewingSourceFact.sourceDocument}] "${previewingSourceFact.claimStatement}" (${previewingSourceFact.value ? `${previewingSourceFact.value} ${previewingSourceFact.unit || ""}` : previewingSourceFact.category})`;
                  navigator.clipboard.writeText(citationText);
                  showToast({
                    type: "info",
                    title: "Citation Copied",
                    message: "Formatted source citation copied to clipboard.",
                  });
                }}
                leftIcon={<FileText className="h-3.5 w-3.5" />}
              >
                Copy Citation Reference
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPreviewingSourceFact(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Fact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingFactId ? "Edit Structured Golden Fact" : "Add Verified Golden Fact"}
        description="Ground-truth facts are embedded into the brand vector index for deterministic and RAG semantic verification."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitFact} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-xs text-[var(--color-danger)] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fact Title"
              placeholder="e.g. 99.99% Core Service Uptime SLA"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              options={CATEGORIES.filter((c) => c !== "All").map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Textarea
            label="Claim Statement (Exact ground truth statement)"
            placeholder="e.g. Nexus Cloud guarantees 99.99% monthly availability for all Enterprise multi-region clusters."
            rows={3}
            value={formClaim}
            onChange={(e) => setFormClaim(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Structured Metric Value (Optional)"
              placeholder="e.g. 99.99, 50, 10"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />
            <Input
              label="Metric Unit (Optional)"
              placeholder="e.g. %, ms, USD, TB"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            />
          </div>

          <Input
            label="Authoritative Source Document"
            placeholder="e.g. Master Services Agreement v3.4 Section 4.2"
            value={formSource}
            onChange={(e) => setFormSource(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Effective Date"
              type="date"
              value={formEffectiveDate}
              onChange={(e) => setFormEffectiveDate(e.target.value)}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formExpiryDate}
              onChange={(e) => setFormExpiryDate(e.target.value)}
            />
            <Select
              label="Approval Status"
              value={formApprovalStatus}
              onChange={(e) => setFormApprovalStatus(e.target.value)}
              options={[
                { value: "APPROVED", label: "Approved & Active" },
                { value: "DRAFT", label: "Draft / Pending Verification" },
                { value: "OUTDATED", label: "Outdated" },
                { value: "SUPERSEDED", label: "Superseded" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Indexing..." : editingFactId ? "Save & Increment Version" : "Create & Index Fact"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supersede Modal */}
      <Modal
        isOpen={isSupersedeModalOpen}
        onClose={() => setIsSupersedeModalOpen(false)}
        title="Supersede Golden Fact"
        description="Mark this ground-truth record as superseded by a newer version or replacement fact."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            You are superseding: <strong className="text-[var(--text-primary)]">{selectedFactForSupersede?.title}</strong>
          </p>

          <Input
            label="Successor Fact ID (Optional UUID)"
            placeholder="Enter the UUID of the newer successor fact, if known..."
            value={successorFactId}
            onChange={(e) => setSuccessorFactId(e.target.value)}
          />

          <p className="text-[11px] text-[var(--text-muted)]">
            Creators referencing this claim in active drafts will receive an advisory warning pointing to the updated ground truth.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" onClick={() => setIsSupersedeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSupersede}>
              Confirm Supersede
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Wizard Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import Golden Facts from CSV"
        description="Strictly validated bulk ingestion with column mapping, preview, and row-level error reporting."
        maxWidth="xl"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${csvStep === 1 ? "text-[var(--accent-primary)] font-bold" : "text-[var(--text-muted)]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            Select File
          </div>
          <ArrowRight className="h-3 w-3 text-[var(--border-default)]" />
          <div className={`flex items-center gap-2 ${csvStep === 2 ? "text-[var(--accent-primary)] font-bold" : "text-[var(--text-muted)]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            Column Mapping & Preview
          </div>
          <ArrowRight className="h-3 w-3 text-[var(--border-default)]" />
          <div className={`flex items-center gap-2 ${csvStep === 3 ? "text-[var(--accent-primary)] font-bold" : "text-[var(--text-muted)]"}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            Validation Report
          </div>
        </div>

        {/* Step 1: File Drop */}
        {csvStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center hover:border-[var(--accent-primary)] bg-[var(--bg-surface-subtle)] transition-colors">
              <FileSpreadsheet className="h-10 w-10 text-[var(--accent-primary)] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Choose a CSV file to import
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Supported columns: <code>title</code>, <code>claim_statement</code>, <code>category</code>, <code>value</code>, <code>unit</code>, <code>source_document</code>, <code>effective_date</code>, <code>expiry_date</code>.
              </p>
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={handleCsvFileChange}
              />
              <label
                htmlFor="csv-file-input"
                className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] shadow-xs cursor-pointer transition-colors"
              >
                Browse Files (.csv)
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Mapping & Preview */}
        {csvStep === 2 && csvPreview && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs bg-[var(--bg-surface-subtle)] p-3 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <span>File: <strong className="text-[var(--text-primary)]">{csvPreview.filename}</strong></span>
              <span>Total Rows: <strong className="text-[var(--text-primary)]">{csvPreview.total_rows}</strong></span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                Map CSV Columns to Golden Fact Fields
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { field: "title", label: "Fact Title (Required)", required: true },
                  { field: "claim_statement", label: "Claim Statement (Required)", required: true },
                  { field: "category", label: "Category" },
                  { field: "source_document", label: "Source Document" },
                  { field: "value", label: "Structured Value" },
                  { field: "unit", label: "Metric Unit" },
                  { field: "effective_date", label: "Effective Date" },
                  { field: "expiry_date", label: "Expiry Date" },
                ].map((item) => (
                  <div key={item.field} className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                      {item.label}
                    </label>
                    <select
                      value={columnMapping[item.field] || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, [item.field]: e.target.value })
                      }
                      className="text-xs px-2.5 py-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-[var(--accent-ring)]"
                    >
                      <option value="">-- Ignore / Not in CSV --</option>
                      {csvPreview.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Mode Toggle */}
            <div className="p-3 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center gap-3">
              <input
                type="checkbox"
                id="strict-mode"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="h-4 w-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-ring)] border-[var(--border-default)]"
              />
              <label htmlFor="strict-mode" className="text-xs text-[var(--text-primary)] cursor-pointer">
                <strong>Strict Validation Mode:</strong> Abort transaction if any row has missing required fields or invalid dates. No malformed rows are silently accepted.
              </label>
            </div>

            {/* Sample Table */}
            <div>
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Data Preview (First {csvPreview.sample_rows.length} Rows)
              </h5>
              <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
                    <tr>
                      {csvPreview.headers.map((h) => (
                        <th key={h} className="p-2 border-b border-[var(--border-subtle)] font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.sample_rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[var(--border-subtle)]">
                        {csvPreview.headers.map((h) => (
                          <td key={h} className="p-2 truncate max-w-[160px] text-[var(--text-primary)]">
                            {row[h] || "–"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={() => setCsvStep(1)}>
                Back to File Selection
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteImport}
                disabled={isImporting || !columnMapping.title || !columnMapping.claim_statement}
              >
                {isImporting ? "Validating & Ingesting..." : "Execute Strict Import"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Error Report */}
        {csvStep === 3 && importResult && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-xs text-[var(--color-danger)] flex items-center gap-2">
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <strong>Import Aborted by Strict Validator:</strong> {importResult.errors.length} validation errors detected in CSV.
              </div>
            </div>

            <div className="overflow-x-auto border border-[var(--color-danger-border)] rounded-lg max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
                  <tr>
                    <th className="p-2 border-b border-[var(--color-danger-border)]">Row #</th>
                    <th className="p-2 border-b border-[var(--color-danger-border)]">Field</th>
                    <th className="p-2 border-b border-[var(--color-danger-border)]">Provided Value</th>
                    <th className="p-2 border-b border-[var(--color-danger-border)]">Error Description</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.errors.map((err, idx) => (
                    <tr key={idx} className="border-b border-[var(--color-danger-border)]">
                      <td className="p-2 font-mono font-bold text-[var(--color-danger)]">Row {err.row_number}</td>
                      <td className="p-2 font-mono text-[var(--text-primary)]">{err.field}</td>
                      <td className="p-2 text-[var(--text-secondary)] truncate max-w-[150px]">
                        {err.row_data?.[err.field] !== undefined ? String(err.row_data[err.field]) : "–"}
                      </td>
                      <td className="p-2 text-[var(--color-danger)]">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={() => setCsvStep(2)}>
                Back to Column Mapping
              </Button>
              <Button variant="secondary" onClick={() => setCsvStep(1)}>
                Upload Corrected CSV
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

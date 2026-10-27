"""
Inkloom AI Brand Governance Platform - API v1 Router
Complete endpoints for:
- Authentication & Profile
- Multi-Tenant Brands, Members & Invitations
- Golden Facts Management & CSV Bulk Ingestion
- Deterministic Guardrails & Versioned History
- Visual Assets & Private Media Storage
- Real-time Content Audits (Text RAG & OpenCV Vision Engine)
- Human Review Queue (Decisions, Resubmissions, Revision Snapshots)
- Governance Analytics & Cryptographic Audit Ledger
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Header, UploadFile, File, Form, status
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from app.services import database as db

router = APIRouter(prefix="/v1")


# =============================================================================
# Auth Dependencies
# =============================================================================

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        # In development/demo, default to demo owner
        profile = db.get_user_profile("usr-owner")
        if profile:
            return profile
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = db.decode_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user = db.get_user_profile(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# =============================================================================
# Request & Response Models
# =============================================================================

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterBrandRequest(BaseModel):
    email: str
    password: str
    full_name: str
    brand_name: str
    brand_slug: str
    website: Optional[str] = None

class RegisterCreatorRequest(BaseModel):
    email: str
    password: str
    full_name: str
    invitation_token: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    full_name: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class InviteMemberRequest(BaseModel):
    email: str
    role: str

class AcceptInvitationRequest(BaseModel):
    token: str

class FactCreateUpdateRequest(BaseModel):
    category: str
    title: str
    claim_statement: str
    value: Optional[str] = None
    unit: Optional[str] = None
    source_document: str
    effective_date: Optional[str] = None
    expiry_date: Optional[str] = None
    approval_status: Optional[str] = "APPROVED"

class FactSupersedeRequest(BaseModel):
    superseded_by_id: Optional[str] = None

class CSVImportRequest(BaseModel):
    csv_text: str
    column_mapping: Dict[str, str]
    strict_mode: Optional[bool] = True

class RuleCreateUpdateRequest(BaseModel):
    rule_type: str
    name: str
    description: Optional[str] = ""
    pattern_or_instruction: str
    severity: Optional[str] = "CRITICAL"
    enforcement_mode: Optional[str] = "BLOCK"
    explanation_template: Optional[str] = ""
    explanation: Optional[str] = ""
    source_reference: Optional[str] = ""
    applies_to_channels: Optional[List[str]] = None
    channels: Optional[List[str]] = None
    save_as_draft: Optional[bool] = False

class VisualAssetCreateRequest(BaseModel):
    name: str
    asset_type: str
    hex_code: Optional[str] = None
    aspect_ratio: Optional[str] = None
    clearance_margin_px: Optional[int] = None
    metadata_json: Optional[Dict[str, Any]] = None

class TextAuditRequest(BaseModel):
    draft_text: str
    channel: Optional[str] = "general"

class EscalateAuditRequest(BaseModel):
    creator_notes: str

class AssistantSuggestionsRequest(BaseModel):
    draft_text: str
    query: str
    channel: Optional[str] = "general"

class ReviewActionRequest(BaseModel):
    action: str  # APPROVE | REJECT | REQUEST_CHANGES
    comments: str

class ReviewTransitionRequest(BaseModel):
    target_status: str
    notes: Optional[str] = None

class ReviewResubmitRequest(BaseModel):
    creator_notes: str
    fresh_audit_id: str


# =============================================================================
# Authentication Endpoints
# =============================================================================

@router.post("/auth/login")
def login(creds: LoginRequest):
    user = db.authenticate_user(creds.email, creds.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    role = user["memberships"][0]["role"] if user["memberships"] else "CONTENT_CREATOR"
    access_token = db.create_token(user["id"], user["email"], role)
    refresh_token = db.create_token(user["id"], user["email"], role)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in_minutes": 1440,
        "user": user
    }


@router.post("/auth/register-brand")
def register_brand_endpoint(req: RegisterBrandRequest):
    if db.get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    user = db.create_user(req.email, req.password, req.full_name, is_superuser=False)
    brand = db.create_brand({
        "name": req.brand_name,
        "slug": req.brand_slug,
        "website": req.website or ""
    }, owner_user_id=user["id"])
    
    user_updated = db.get_user_profile(user["id"])
    token = db.create_token(user["id"], user["email"], "OWNER")
    
    return {
        "access_token": token,
        "refresh_token": token,
        "token_type": "bearer",
        "expires_in_minutes": 1440,
        "user": user_updated
    }


@router.post("/auth/register-creator")
def register_creator_endpoint(req: RegisterCreatorRequest):
    if db.get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    user = db.create_user(req.email, req.password, req.full_name, is_superuser=False)
    
    if req.invitation_token:
        db.accept_invitation(req.invitation_token, user["id"])
    else:
        # Default assignment to Nexus Cloud for immediate demo capability
        conn = db.get_connection()
        conn.execute(
            "INSERT INTO memberships (id, user_id, brand_id, role, created_at) VALUES (?, ?, 'brand-nexus', 'CONTENT_CREATOR', ?);",
            (f"m-{uuid.uuid4().hex[:8]}", user["id"], db.now_iso())
        )
        conn.commit()
        conn.close()

    user_updated = db.get_user_profile(user["id"])
    token = db.create_token(user["id"], user["email"], "CONTENT_CREATOR")
    
    return {
        "access_token": token,
        "refresh_token": token,
        "token_type": "bearer",
        "expires_in_minutes": 1440,
        "user": user_updated
    }


@router.post("/auth/refresh")
def refresh_token(req: RefreshTokenRequest):
    payload = db.decode_token(req.refresh_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = db.get_user_profile(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    role = user["memberships"][0]["role"] if user["memberships"] else "CONTENT_CREATOR"
    new_access = db.create_token(user["id"], user["email"], role)
    new_refresh = db.create_token(user["id"], user["email"], role)
    
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }


@router.post("/auth/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/auth/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return user


@router.put("/auth/me/profile")
def update_profile(req: UpdateProfileRequest, user: Dict[str, Any] = Depends(get_current_user)):
    updated = db.update_user_profile(user["id"], req.full_name)
    if not updated:
        raise HTTPException(status_code=400, detail="Could not update profile")
    return updated


@router.put("/auth/me/password")
def update_password(req: UpdatePasswordRequest, user: Dict[str, Any] = Depends(get_current_user)):
    success = db.update_user_password(user["id"], req.current_password, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    return {"message": "Password updated successfully."}


# =============================================================================
# Brands & Memberships Endpoints
# =============================================================================

@router.get("/brands")
def get_user_brands(user: Dict[str, Any] = Depends(get_current_user)):
    brands = db.list_user_brands(user["id"])
    if not brands:
        # Fallback to all brands for exploration
        conn = db.get_connection()
        rows = conn.execute("SELECT id, name, slug, 'OWNER' as role FROM brands;").fetchall()
        conn.close()
        return [dict(r) for r in rows]
    return brands


@router.get("/brands/{brand_id}")
def get_brand_endpoint(brand_id: str):
    brand = db.get_brand(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.put("/brands/{brand_id}")
def update_brand_endpoint(brand_id: str, data: Dict[str, Any]):
    updated = db.update_brand(brand_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Brand not found")
    return updated


@router.get("/brands/{brand_id}/members")
def get_brand_members_endpoint(brand_id: str):
    return db.get_brand_members(brand_id)


@router.post("/brands/{brand_id}/invitations")
def invite_member_endpoint(brand_id: str, req: InviteMemberRequest):
    return db.create_invitation(brand_id, req.email, req.role)


@router.get("/invitations/verify")
def verify_invitation_endpoint(token: str = Query(...)):
    res = db.verify_invitation(token)
    if not res:
        raise HTTPException(status_code=404, detail="Invitation not found or expired")
    return res


@router.post("/invitations/accept")
def accept_invitation_endpoint(req: AcceptInvitationRequest, user: Dict[str, Any] = Depends(get_current_user)):
    res = db.accept_invitation(req.token, user["id"])
    if not res:
        raise HTTPException(status_code=400, detail="Invalid invitation token")
    return res


# =============================================================================
# Golden Facts Endpoints
# =============================================================================

@router.get("/brands/{brand_id}/facts")
def list_facts_endpoint(
    brand_id: str,
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
):
    return db.list_facts(brand_id, category=category, status=status, query=q)


@router.post("/brands/{brand_id}/facts")
def create_fact_endpoint(brand_id: str, req: FactCreateUpdateRequest):
    return db.create_fact(brand_id, req.model_dump())


@router.put("/brands/{brand_id}/facts/{fact_id}")
def update_fact_endpoint(brand_id: str, fact_id: str, req: FactCreateUpdateRequest):
    res = db.update_fact(brand_id, fact_id, req.model_dump())
    if not res:
        raise HTTPException(status_code=404, detail="Fact not found")
    return res


@router.post("/brands/{brand_id}/facts/{fact_id}/supersede")
def supersede_fact_endpoint(brand_id: str, fact_id: str, req: FactSupersedeRequest):
    res = db.supersede_fact(brand_id, fact_id, req.superseded_by_id)
    if not res:
        raise HTTPException(status_code=404, detail="Fact not found")
    return res


@router.post("/brands/{brand_id}/facts/{fact_id}/mark-outdated")
def mark_fact_outdated_endpoint(brand_id: str, fact_id: str):
    res = db.mark_fact_outdated(brand_id, fact_id)
    if not res:
        raise HTTPException(status_code=404, detail="Fact not found")
    return res


@router.delete("/brands/{brand_id}/facts/{fact_id}")
def delete_fact_endpoint(brand_id: str, fact_id: str):
    db.delete_fact(brand_id, fact_id)
    return {"message": "Fact deleted"}


@router.post("/brands/{brand_id}/facts/csv-preview")
async def csv_preview_endpoint(brand_id: str, file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    return db.preview_csv_content(text, filename=file.filename or "upload.csv")


@router.post("/brands/{brand_id}/facts/csv-import")
def csv_import_endpoint(brand_id: str, req: CSVImportRequest):
    return db.import_csv_facts(brand_id, req.csv_text, req.column_mapping, strict_mode=bool(req.strict_mode))


# =============================================================================
# Brand Rules Endpoints
# =============================================================================

@router.get("/brands/{brand_id}/rules")
def list_rules_endpoint(
    brand_id: str,
    rule_type: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    enforcement_mode: Optional[str] = Query(None)
):
    return db.list_rules(brand_id, rule_type=rule_type, channel=channel, severity=severity, enforcement_mode=enforcement_mode)


@router.post("/brands/{brand_id}/rules")
def create_rule_endpoint(brand_id: str, req: RuleCreateUpdateRequest):
    return db.create_rule(brand_id, req.model_dump())


@router.put("/brands/{brand_id}/rules/{rule_id}")
def update_rule_endpoint(brand_id: str, rule_id: str, req: RuleCreateUpdateRequest):
    res = db.update_rule(brand_id, rule_id, req.model_dump(), save_as_draft=bool(req.save_as_draft))
    if not res:
        raise HTTPException(status_code=404, detail="Rule not found")
    return res


@router.post("/brands/{brand_id}/rules/{rule_id}/publish")
def publish_rule_endpoint(brand_id: str, rule_id: str):
    res = db.publish_rule(brand_id, rule_id)
    if not res:
        raise HTTPException(status_code=404, detail="Rule not found")
    return res


@router.delete("/brands/{brand_id}/rules/{rule_id}")
def delete_rule_endpoint(brand_id: str, rule_id: str):
    db.delete_rule(brand_id, rule_id)
    return {"message": "Rule deleted"}


@router.get("/brands/{brand_id}/rules/{rule_id}/history")
def get_rule_history_endpoint(brand_id: str, rule_id: str):
    return db.get_rule_history(brand_id, rule_id)


# =============================================================================
# Visual Assets Endpoints
# =============================================================================

@router.get("/brands/{brand_id}/assets")
def list_assets_endpoint(brand_id: str, asset_type: Optional[str] = Query(None)):
    return db.list_assets(brand_id, asset_type=asset_type)


@router.post("/brands/{brand_id}/assets")
def create_asset_endpoint(brand_id: str, req: VisualAssetCreateRequest):
    return db.create_asset(brand_id, req.model_dump())


@router.post("/brands/{brand_id}/assets/upload")
async def upload_asset_endpoint(
    brand_id: str,
    name: str = Form(...),
    asset_type: str = Form(...),
    file: UploadFile = File(...)
):
    content = await file.read()
    return db.upload_asset_file(brand_id, name, asset_type, file.filename or "asset.png", content, file.content_type or "image/png")


@router.delete("/brands/{brand_id}/assets/{asset_id}")
def delete_asset_endpoint(brand_id: str, asset_id: str):
    db.delete_asset(brand_id, asset_id)
    return {"message": "Asset deleted"}


@router.get("/brands/{brand_id}/assets/{asset_id}/file")
def get_asset_file_endpoint(brand_id: str, asset_id: str):
    asset = db.get_asset(brand_id, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    file_path = asset.get("file_path")
    if file_path and os.path.isfile(file_path):
        return FileResponse(file_path, media_type=asset.get("mime_type", "image/png"))
    
    # Check default test assets
    fallback = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "test-data", "visual-assets", "compliant_hero_banner.png"))
    if os.path.isfile(fallback):
        return FileResponse(fallback, media_type="image/png")
    
    return Response(status_code=404, content="File not found on disk")


# =============================================================================
# Content Auditing & Assistant Endpoints
# =============================================================================

@router.post("/brands/{brand_id}/audit/text")
def audit_text_endpoint(brand_id: str, req: TextAuditRequest, user: Dict[str, Any] = Depends(get_current_user)):
    return db.audit_text(brand_id, req.draft_text, channel=req.channel or "general", user_id=user["id"])


@router.post("/brands/{brand_id}/audit/{audit_id}/escalate")
def escalate_audit_endpoint(brand_id: str, audit_id: str, req: EscalateAuditRequest, user: Dict[str, Any] = Depends(get_current_user)):
    return db.escalate_audit_to_review(brand_id, audit_id, req.creator_notes, user_id=user["id"])


@router.post("/brands/{brand_id}/audit/{audit_id}/rerun")
def rerun_audit_endpoint(brand_id: str, audit_id: str):
    audit = db.get_audit(brand_id, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return db.audit_text(brand_id, audit["draft_text"], channel=audit["channel"])


@router.post("/brands/{brand_id}/audit/{audit_id}/findings/{finding_id}/accept")
def accept_finding_endpoint(brand_id: str, audit_id: str, finding_id: str):
    return db.accept_audit_finding(brand_id, audit_id, finding_id)


@router.post("/brands/{brand_id}/audit/assistant")
def assistant_endpoint(brand_id: str, req: AssistantSuggestionsRequest):
    return db.get_assistant_advice(brand_id, req.draft_text, req.query, channel=req.channel or "general")


@router.post("/brands/{brand_id}/audit/image")
async def audit_image_endpoint(
    brand_id: str,
    file: UploadFile = File(...),
    channel: Optional[str] = Form("general"),
    brief_context: Optional[str] = Form(""),
    color_tolerance: Optional[float] = Form(25.0),
    reference_logo_id: Optional[str] = Form(None)
):
    content = await file.read()
    try:
        return db.audit_image_compliance(
            brand_id, content, file.filename or "image.png",
            channel=channel or "general",
            brief_context=brief_context or "",
            color_tolerance=color_tolerance or 25.0,
            reference_logo_id=reference_logo_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# Human Review Queue Endpoints
# =============================================================================

@router.get("/brands/{brand_id}/reviews")
def list_reviews_endpoint(brand_id: str, status_filter: Optional[str] = Query(None)):
    return db.list_reviews(brand_id, status_filter=status_filter)


@router.get("/brands/{brand_id}/reviews/{review_id}")
def get_review_endpoint(brand_id: str, review_id: str):
    res = db.get_review(brand_id, review_id)
    if not res:
        raise HTTPException(status_code=404, detail="Review not found")
    return res


@router.post("/brands/{brand_id}/reviews/{review_id}/action")
def review_action_endpoint(brand_id: str, review_id: str, req: ReviewActionRequest, user: Dict[str, Any] = Depends(get_current_user)):
    res = db.take_review_action(brand_id, review_id, req.action, req.comments, reviewer_user_id=user["id"])
    if not res:
        raise HTTPException(status_code=404, detail="Review not found")
    return res


@router.post("/brands/{brand_id}/reviews/{review_id}/transition")
def transition_review_endpoint(brand_id: str, review_id: str, req: ReviewTransitionRequest):
    res = db.transition_review_state(brand_id, review_id, req.target_status, notes=req.notes)
    if not res:
        raise HTTPException(status_code=404, detail="Review not found")
    return res


@router.post("/brands/{brand_id}/reviews/{review_id}/resubmit")
def resubmit_review_endpoint(brand_id: str, review_id: str, req: ReviewResubmitRequest, user: Dict[str, Any] = Depends(get_current_user)):
    res = db.resubmit_review(brand_id, review_id, req.creator_notes, req.fresh_audit_id, user_id=user["id"])
    if not res:
        raise HTTPException(status_code=400, detail="Could not resubmit review. Check that fresh audit exists.")
    return res


# =============================================================================
# Governance Analytics & Immutable Ledger Endpoints
# =============================================================================

@router.get("/brands/{brand_id}/analytics")
def get_analytics_endpoint(
    brand_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    rule: Optional[str] = Query(None)
):
    return db.get_analytics(brand_id, start_date=start_date, end_date=end_date, channel=channel, severity=severity, rule=rule)


@router.get("/brands/{brand_id}/audit-events")
def list_audit_events_endpoint(
    brand_id: str,
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    actor_email: Optional[str] = Query(None),
    limit: Optional[int] = Query(100),
    offset: Optional[int] = Query(0)
):
    return db.list_audit_events(brand_id, action=action, resource_type=resource_type, actor_email=actor_email, limit=limit or 100, offset=offset or 0)

"""Synthetic Test Data Generator for Inkloom AI Brand Governance Platform.

Generates realistic visual assets (compliant & violation images), copy drafts across CMS channels,
enterprise Golden Facts datasets, and review queue tickets for end-to-end testing.
"""
import json
import os
import cv2
import numpy as np


OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
VISUALS_DIR = os.path.join(OUTPUT_DIR, "visual-assets")


def hex_to_bgr(hex_str: str):
    clean = hex_str.lstrip("#")
    r, g, b = int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16)
    return (b, g, r)


def create_canonical_logo(size: int = 100) -> np.ndarray:
    """Creates transparent canonical Inkloom concentric logo mark."""
    logo = np.zeros((size, size, 4), dtype=np.uint8)
    center = (size // 2, size // 2)
    radius_outer = int(size * 0.42)
    radius_mid = int(size * 0.28)
    radius_inner = int(size * 0.14)

    # Outer Indigo Circle
    cv2.circle(logo, center, radius_outer, (229, 70, 79, 255), -1)  # #4F46E5 in BGRA
    # Middle White Ring
    cv2.circle(logo, center, radius_mid, (255, 255, 255, 255), -1)
    # Inner Cyan Core
    cv2.circle(logo, center, radius_inner, (212, 182, 6, 255), -1)   # #06B6D4 in BGRA

    return logo


def generate_visual_assets():
    """Generates a complete suite of compliant and violating campaign graphics."""
    logo = create_canonical_logo(120)
    logo_path = os.path.join(VISUALS_DIR, "inkloom_logo_template.png")
    cv2.imwrite(logo_path, logo)
    print(" -> Generated:", logo_path)

    # 1. Compliant Hero Banner (800x400) - Inkloom Indigo (#4F46E5) with compliant logo and clear space
    banner_comp = np.full((400, 800, 3), hex_to_bgr("#4F46E5"), dtype=np.uint8)
    # Subtle gradient bar at bottom
    cv2.rectangle(banner_comp, (0, 370), (800, 400), hex_to_bgr("#0F172A"), -1)
    # Overlay logo at (60, 60) with generous margin
    logo_bgr = logo[:, :, :3]
    alpha = logo[:, :, 3] / 255.0
    for c in range(3):
        banner_comp[60:180, 60:180, c] = (
            alpha * logo_bgr[:, :, c] + (1 - alpha) * banner_comp[60:180, 60:180, c]
        )
    # Title text well outside the clear space margin
    cv2.putText(banner_comp, "Inkloom AI Enterprise Governance", (210, 115), cv2.FONT_HERSHEY_DUPLEX, 0.85, (255, 255, 255), 2)
    cv2.putText(banner_comp, "Velocity with Precision in Modern CMS Workflows", (210, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (212, 182, 6), 1)
    comp_path = os.path.join(VISUALS_DIR, "compliant_hero_banner.png")
    cv2.imwrite(comp_path, banner_comp)
    print(" -> Generated:", comp_path)

    # 2. Compliant Feature Card (600x400) - Electric Violet (#7C3AED)
    card_comp = np.full((400, 600, 3), hex_to_bgr("#7C3AED"), dtype=np.uint8)
    cv2.circle(card_comp, (520, 80), 120, hex_to_bgr("#06B6D4"), 2)
    cv2.putText(card_comp, "Real-Time Fact Checking", (50, 180), cv2.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2)
    cv2.putText(card_comp, "Verified against Golden Facts v2.4", (50, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)
    card_path = os.path.join(VISUALS_DIR, "compliant_feature_card.png")
    cv2.imwrite(card_path, card_comp)
    print(" -> Generated:", card_path)

    # 3. Violation: Off-Brand Color (#E54F46 Coral Red)
    banner_red = np.full((400, 800, 3), hex_to_bgr("#E54F46"), dtype=np.uint8)
    cv2.putText(banner_red, "LIMITED TIME PROMOTION - 50% OFF", (100, 200), cv2.FONT_HERSHEY_DUPLEX, 1.0, (255, 255, 255), 2)
    red_path = os.path.join(VISUALS_DIR, "violation_offbrand_color.png")
    cv2.imwrite(red_path, banner_red)
    print(" -> Generated:", red_path)

    # 4. Violation: Distorted Stretched Logo (Aspect Ratio Failure)
    banner_distort = np.full((400, 800, 3), (255, 255, 255), dtype=np.uint8)
    # Stretched logo (width 240, height 70 -> ratio 3.4 instead of 1.0)
    stretched_logo = cv2.resize(logo_bgr, (240, 70), interpolation=cv2.INTER_AREA)
    banner_distort[80:150, 60:300] = stretched_logo
    cv2.putText(banner_distort, "Quarterly Investor Overview", (60, 240), cv2.FONT_HERSHEY_DUPLEX, 0.8, (15, 23, 42), 2)
    distort_path = os.path.join(VISUALS_DIR, "violation_stretched_logo.png")
    cv2.imwrite(distort_path, banner_distort)
    print(" -> Generated:", distort_path)

    # 5. Violation: Cluttered Logo Exclusion Zone (Clear Space Invasion)
    banner_clutter = np.full((400, 800, 3), (245, 247, 250), dtype=np.uint8)
    # Place logo at (80, 80)
    for c in range(3):
        banner_clutter[80:200, 80:200, c] = (
            alpha * logo_bgr[:, :, c] + (1 - alpha) * banner_clutter[80:200, 80:200, c]
        )
    # Intrusive high-contrast text encroaching directly within 10px of the logo perimeter
    cv2.putText(banner_clutter, "NEW PRODUCT LAUNCH 2026", (80, 72), cv2.FONT_HERSHEY_DUPLEX, 0.45, (0, 0, 0), 2)
    cv2.putText(banner_clutter, "DISRUPTIVE AI AGENTS", (205, 140), cv2.FONT_HERSHEY_DUPLEX, 0.45, (0, 0, 0), 2)
    clutter_path = os.path.join(VISUALS_DIR, "violation_cluttered_clearspace.png")
    cv2.imwrite(clutter_path, banner_clutter)
    print(" -> Generated:", clutter_path)


def generate_copy_drafts():
    """Generates realistic test copy drafts simulating creator workflows across channels."""
    drafts = [
        {
            "id": "draft-01-pricing-drift",
            "title": "Blog Post: Getting Started with Inkloom AI",
            "channel": "blog",
            "cms": "WordPress",
            "author": "Sarah Jenkins (Growth Content)",
            "text": (
                "Empower your team today with Inkloom AI. You can get started on our starter tier for just $29/mo, "
                "unlocking full real-time brand verification across your entire organization. Experience magic AI "
                "that guarantees zero risk and flawless content generation every time."
            ),
            "expected_violations": [
                {"type": "pricing", "flag": "$29/mo", "fix": "$49/month"},
                {"type": "superlative", "flag": "magic AI", "fix": "high-confidence AI assistance"},
                {"type": "superlative", "flag": "zero risk", "fix": "comprehensive risk mitigation"},
                {"type": "superlative", "flag": "flawless", "fix": "rigorous and consistent"}
            ]
        },
        {
            "id": "draft-02-social-superlatives",
            "title": "LinkedIn Campaign: Enterprise Brand Velocity",
            "channel": "social",
            "cms": "LinkedIn Creator",
            "author": "Marcus Vance (Social Lead)",
            "text": (
                "Tired of brand review bottlenecks? Inkloom AI is the cheapest enterprise compliance tool on the market. "
                "Our software guarantees 100% bug free governance so your writers publish velocity without human overhead."
            ),
            "expected_violations": [
                {"type": "superlative", "flag": "cheapest", "fix": "most cost-effective enterprise solution"},
                {"type": "superlative", "flag": "100% bug free", "fix": "extensively tested and highly reliable"},
                {"type": "slogan", "flag": "velocity without", "fix": "Velocity with Precision"}
            ]
        },
        {
            "id": "draft-03-nonexistent-tier",
            "title": "Newsletter: Community Updates Q3",
            "channel": "email",
            "cms": "Substack / Mailchimp",
            "author": "Elena Rostova (DevRel)",
            "text": (
                "We are thrilled to welcome our new community creators! Try out our $19 starter plan today. "
                "Inkloom brings velocity without precision to every developer workspace."
            ),
            "expected_violations": [
                {"type": "pricing", "flag": "$19", "fix": "free Community tier or $49/mo Starter tier"},
                {"type": "slogan", "flag": "velocity without", "fix": "Velocity with Precision"}
            ]
        },
        {
            "id": "draft-04-fully-compliant",
            "title": "Product Announcement: Inkloom Governance v2.4",
            "channel": "web",
            "cms": "Webflow CMS",
            "author": "Ayush Dey (Product Lead)",
            "text": (
                "Inkloom AI accelerates enterprise content creation with deterministic brand verification. "
                "Starting at $49/month with our Starter tier, marketing teams achieve Velocity with Precision "
                "through verified Golden Facts, SOC2 Type II security, and instant in-context recommendations."
            ),
            "expected_violations": []
        },
        {
            "id": "draft-05-press-release",
            "title": "Press Release: Inkloom AI Announces Series A",
            "channel": "press",
            "cms": "PR Newswire",
            "author": "PR Communications Team",
            "text": (
                "Inkloom AI, the leading enterprise brand governance platform, today announced widespread adoption. "
                "Unlike legacy tools, Inkloom provides flawless verification and zero risk for Fortune 500 publishing. "
                "Enterprise packages begin with our $29 tier."
            ),
            "expected_violations": [
                {"type": "superlative", "flag": "flawless", "fix": "rigorous and consistent"},
                {"type": "superlative", "flag": "zero risk", "fix": "comprehensive risk mitigation"},
                {"type": "pricing", "flag": "$29", "fix": "$49/month"}
            ]
        }
    ]

    path = os.path.join(OUTPUT_DIR, "copy_drafts.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(drafts, f, indent=2)
    print(" -> Generated:", path)


def generate_golden_facts():
    """Generates an expanded enterprise CSV knowledge base."""
    csv_content = """id,category,title,citation,content
fact-price-01,pricing,Starter Tier Pricing,Pricing Matrix v2.4 (Effective 2026) Section 1,Inkloom Starter Tier is priced at $49/month billed monthly or $39/month billed annually. Replaces legacy $29/mo pricing retired Q3.
fact-price-02,pricing,Community Edition,Pricing Matrix v2.4 (Effective 2026) Section 1,Inkloom Community Edition is 100% Free for single users and open-source teams. There is no $19 tier.
fact-price-03,pricing,Professional Tier,Pricing Matrix v2.4 (Effective 2026) Section 2,Inkloom Pro Tier is $199/month for up to 10 creators with unlimited RAG knowledge base indexing and live Chrome extension audits.
fact-price-04,pricing,Enterprise Licensing,Pricing Matrix v2.4 (Effective 2026) Section 3,Enterprise tier includes custom tenant isolation dedicated VPC deployment and 99.95% SLA with custom quote.
fact-tone-01,tone,Banned Superlatives Policy,Brand Style Guide: Banned Terminology 2026 Section 3,Banned words: 'magic AI' (use 'high-confidence AI assistance') 'cheapest' (use 'most cost-effective') 'flawless' (use 'rigorous and consistent').
fact-tone-02,tone,Absolute Guarantees Policy,Brand Style Guide: Legal Risk Policy Section 4,Do not make absolute claims such as '100% bug free' or 'zero risk'. Use 'extensively tested' and 'comprehensive risk mitigation'.
fact-slogan-01,slogan,Official Brand Tagline,Brand Identity Standards v2.4 Section 2,The approved official tagline is 'Velocity with Precision'. Never alter to 'velocity without precision' or omit Precision.
fact-sec-01,security,SOC2 Type II Certification,Security & Compliance Whitepaper 2026 Section 1,Inkloom AI is SOC2 Type II certified with end-to-end AES-256 encryption at rest and TLS 1.3 in transit.
fact-sec-02,security,GDPR & HIPAA Compliance,Security & Compliance Whitepaper 2026 Section 2,Customer content is never used for training foundation models. Full GDPR right-to-erasure and HIPAA BAA support included on Enterprise.
fact-sla-01,sla,Service Level Agreement,Enterprise SLA Schedule v2 Section 1,Guaranteed 99.95% uptime for API compliance audit endpoints with sub-50ms deterministic OpenCV evaluation.
"""
    path = os.path.join(OUTPUT_DIR, "golden_facts_enterprise.csv")
    with open(path, "w", encoding="utf-8") as f:
        f.write(csv_content.strip() + "\n")
    print(" -> Generated:", path)


def generate_review_tickets():
    """Generates sample review tickets for testing the Admin Review Queue."""
    tickets = [
        {
            "id": "REV-201",
            "cms": "WordPress Blog",
            "author": "Sarah Jenkins",
            "submittedAt": "10 minutes ago",
            "excerpt": "Get started on our starter tier for just $29/mo with magic AI content velocity.",
            "violation": "Outdated pricing ($29) + Banned superlative ('magic AI')",
            "citation": "Golden Facts: Pricing Matrix v2.4 Section 1",
            "page_url": "https://company.com/wp-admin/post.php?id=842",
            "status": "pending"
        },
        {
            "id": "REV-202",
            "cms": "LinkedIn Creator",
            "author": "Marcus Vance",
            "submittedAt": "25 minutes ago",
            "excerpt": "Inkloom is the cheapest enterprise governance platform with 100% bug free assurance.",
            "violation": "Disallowed superlative ('cheapest') + Absolute guarantee ('100% bug free')",
            "citation": "Brand Style Guide: Legal Risk Policy Section 4",
            "page_url": "https://linkedin.com/feed/post/urn:li:share:9842",
            "status": "pending"
        },
        {
            "id": "REV-203",
            "cms": "Webflow Landing Page",
            "author": "Alex Rivera",
            "submittedAt": "1 hour ago",
            "excerpt": "Try out our non-existent $19 tier for effortless velocity without precision.",
            "violation": "Non-existent pricing ($19) + Distorted brand slogan",
            "citation": "Brand Identity Standards v2.4 Section 2",
            "page_url": "https://webflow.com/design/inkloom-landing",
            "status": "pending"
        },
        {
            "id": "REV-204",
            "cms": "Substack Newsletter",
            "author": "Elena Rostova",
            "submittedAt": "2 hours ago",
            "excerpt": "Zero risk automated publishing with flawless quality guarantees.",
            "violation": "Disallowed superlative ('flawless') + Unsubstantiated claim ('zero risk')",
            "citation": "Brand Style Guide: Banned Terminology 2026",
            "page_url": "https://inkloom.substack.com/p/draft-12",
            "status": "pending"
        }
    ]

    path = os.path.join(OUTPUT_DIR, "sample_review_tickets.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tickets, f, indent=2)
    print(" -> Generated:", path)


if __name__ == "__main__":
    print("=== Generating Synthetic Test Data for Inkloom AI ===")
    generate_visual_assets()
    generate_copy_drafts()
    generate_golden_facts()
    generate_review_tickets()
    print("=== Synthetic Test Data Generation Complete! ===")

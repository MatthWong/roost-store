# Ops Order Dashboard — Requirements

## Intent Analysis
- **User Request**: Create a dashboard for ops members to view orders needing review, awaiting customer response, or ready for pickup
- **Request Type**: New Feature
- **Scope**: Multiple components — new Dashboard.html + changes to WebApp.gs, OrderDataService.gs, OrderWorkflow.gs
- **Complexity**: Moderate — role-based access, multi-queue view, status action controls, auto-refresh

---

## Functional Requirements

### FR-1: Access & Hosting
- The dashboard is served as `action=dashboard` from the existing Apps Script web app deployment
- The page is designed to be embedded in a Google Sites page restricted to DECA members
- All active ClubRoster members (MEMBER, OFFICER, SPONSOR with IsActive=true) can view the dashboard
- Authorization reuses the existing `assertAuthorizedOpsUser_()` + ClubRoster + ALLOWED_SCHOOL_DOMAIN check

### FR-2: Order Queues
The dashboard displays four named queues:
| Queue Label | Order Status Value |
|---|---|
| Needs Review | `Submitted` |
| Awaiting Customer Response | `Quote Provided` |
| In Production | `In Production` |
| Ready for Pickup | `Ready for Pickup` |

### FR-3: Order Row — Standard Fields
Each order row displays:
- Order Number (TMP-… or RS-…)
- Order Type (Engraving / Embroidery / Heat Press / Custom Item)
- Customer Name
- Current Status
- Submitted / Updated timestamp

### FR-4: Expandable Order Detail
Clicking a row expands to reveal:
- Item Summary
- Pickup Window
- Duplicate Warning flag (shown only if `true`)

### FR-5: Role-Based Actions
- **MEMBER**: view-only — no action controls shown
- **OFFICER / SPONSOR**: a status dropdown appears on each row showing valid next statuses; submitting advances the order via the `action=update-status` endpoint

### FR-6: Auto-Refresh
- The dashboard polls `?action=dashboard-data` every 60 seconds and re-renders the queues without a full page reload

### FR-7: Visual Style
- Distinct ops/admin look: dark background (#1a1a2e), light neutral card surfaces, accent color purple (#5b2d90)
- Visually distinct from the student-facing StatusChecker page

---

## Non-Functional Requirements

### NFR-1: Authorization
- `action=dashboard` and `action=dashboard-data` require active ClubRoster membership
- `action=update-status` additionally requires Role = OFFICER or SPONSOR
- Unauthorized requests receive a `403` JSON error

### NFR-2: Security Extension
- Security extension rules: **not enforced** (internal ops tool, prototype classification)

### NFR-3: Performance
- Dashboard data fetch must complete within Apps Script's 30s execution limit
- Only active queues (Submitted, Quote Provided, In Production, Ready for Pickup) are returned — no full order history

### NFR-4: Compatibility
- Must work when embedded in Google Sites iframe (no `google.script.run` — all data via `fetch`)
- Must work when accessed directly at the web app URL

---

## Data Requirements
- Source: `Orders` sheet (existing)
- Role source: `ClubRoster` sheet — `Role` column (MEMBER / OFFICER / SPONSOR), `IsActive` column
- No schema changes required

---

## Affected Files
| File | Change |
|---|---|
| `integration/apps-script/WebApp.gs` | Add `action=dashboard`, `action=dashboard-data`, `action=update-status` handlers; add `getUserRole_()` |
| `integration/apps-script/OrderDataService.gs` | Add `getDashboardOrders()` |
| `integration/apps-script/OrderWorkflow.gs` | Add `getUserRole_()` helper; `updateOrderStatus` role-gate for OFFICER/SPONSOR |
| `integration/apps-script/Dashboard.html` | New file — ops dashboard UI |

# Code Generation Plan - fallback-store-integration

## Single Source of Truth
This plan is the authoritative execution sequence for Code Generation (Part 2) for custom-order enhancements. Code generation must follow this plan step-by-step.

## Unit Context
- Unit name: fallback-store-integration
- Project type: Greenfield (existing scaffold in workspace root)
- Stories implemented by this unit:
  - US-03: Submit Engraving Orders
  - US-03b: Submit Embroidery Orders with Image Design
  - US-03c: Submit Heat Press Orders with Image Design
  - US-03d: Submit Custom Item Orders with Quote Requests
  - US-05: Track Order by Order Number and Receipt Code (custom-order lifecycle extension)
  - US-06/US-07: Operations views (custom-order visibility and status actions)
  - US-12: Fallback-first mode continuity while extending custom-order logic
- Dependencies on other services/components:
  - Google Forms responses (intake source)
  - Google Sheets tabs (`Orders`, `OrderItems`, `ClubRoster`, `StoreHours`, `PaymentLinks`)
  - Apps Script Web App endpoints (`status`, `products`, `mode`)
  - Square Payment Links generation workflow (deferred for quote-accepted custom orders)
  - Google Sites page embedding and status-check integration docs
- Database entities owned by this unit:
  - `CustomOrder` (Orders sheet mapping)
  - `OrderItem` (OrderItems sheet mapping)
  - `StatusEvent` (optional tracking tab / audit-friendly updates)
  - `NotificationEvent` (optional tracking tab)
  - `PaymentRequest` (deferred payment metadata)
- Service boundaries and responsibilities:
  - `OrderWorkflow.gs`: orchestration, IDs, status lifecycle, pickup assignment timing
  - `OrderDataService.gs`: persistence and retrieval for orders/order items
  - `Config.gs`: status enums, allowed values, sheet names
  - `WebApp.gs`: customer lookup and operations-facing API surface

## Code Location (Verified)
- Application code (workspace root, never `aidlc-docs/`):
  - `integration/apps-script/Config.gs`
  - `integration/apps-script/OrderDataService.gs`
  - `integration/apps-script/OrderWorkflow.gs`
  - `integration/apps-script/WebApp.gs`
  - `integration/config/sheet-schema.md`
  - `integration/docs/SETUP.md`
  - `integration/docs/GOOGLE_SITES_BUILD.md`
- Documentation summaries:
  - `aidlc-docs/construction/fallback-store-integration/code/`

## Detailed Generation Steps

- [x] Step 1: Align configuration constants and status model
  - Update `Config.gs` to include custom-order statuses: Submitted, Under Review, Quote Provided, Quote Accepted, In Production, Ready for Pickup, Picked Up.
  - Add/confirm constants for supported apparel types, size options (XS to 5XL), and image constraints (PNG/JPG/SVG, 5MB).
  - Story mapping: US-03, US-03b, US-03c, US-03d, US-12.

- [x] Step 2: Extend data schema and sheet mapping for normalized line items
  - Update `sheet-schema.md` to add/confirm `OrderItems` tab and required headers.
  - Add optional event/payment tracking headers where needed for status/notification/payment lifecycle.
  - Story mapping: US-03b, US-03c, US-03d, US-06, US-07.

- [x] Step 3: Implement repository-layer updates for custom-order persistence
  - Modify `OrderDataService.gs` to support:
    - create/update custom orders with temporary and permanent IDs
    - insert/read `OrderItems` rows (type + size + qty)
    - order retrieval including line-item aggregation for operations/status views
  - Story mapping: US-03, US-03b, US-03c, US-03d, US-05.

- [x] Step 4: Implement business workflow lifecycle and validation
  - Modify `OrderWorkflow.gs` to enforce:
    - required-field validation per order type
    - image validation rules
    - duplicate warning workflow hooks
    - status transitions in canonical sequence
    - pickup window assignment only on transition to In Production
    - deferred payment-link generation after quote acceptance
  - Story mapping: US-03, US-03b, US-03c, US-03d, US-05, US-07.

- [x] Step 5: Update API layer endpoints and payloads
  - Modify `WebApp.gs` status/action handlers to include custom-order lifecycle fields and safe response payloads.
  - Ensure operations-safe actions for status updates remain role-gated.
  - Story mapping: US-05, US-06, US-07.

- [x] Step 6: Add automated checks/test scaffolding for core workflows
  - Add lightweight Apps Script test helpers or validation functions for:
    - status transition validity
    - required-field enforcement
    - image constraint checks
    - order-item aggregation behavior
  - Story mapping: US-03 through US-07.

- [x] Step 7: Update integration and site setup documentation
  - Update `SETUP.md` with custom-order-specific deployment/config steps.
  - Update `GOOGLE_SITES_BUILD.md` with custom-order page behaviors and required form field expectations.
  - Story mapping: US-03 through US-05, US-10.

- [x] Step 8: Generate code summary artifact for this unit
  - Create/update summary in `aidlc-docs/construction/fallback-store-integration/code/` with modified file list, behavior changes, and traceability.

- [x] Step 9: Validate workspace diagnostics
  - Run diagnostics and fix relevant errors introduced by this unit.
  - Confirm no duplicate/stray files and no code written under `aidlc-docs/` except markdown summaries.


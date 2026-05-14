# Ops Order Dashboard — Code Generation Plan

## Unit: ops-dashboard
## Stories Covered: FR-1 through FR-7, NFR-1 through NFR-4

---

## Step 1 — OrderWorkflow.gs: Add getUserRole_()
- [x] Add `getUserRole_()` function: reads ClubRoster for the active user, returns Role string (MEMBER / OFFICER / SPONSOR) or null
- [x] Add `assertOfficerOrSponsor_()` helper: calls `assertAuthorizedOpsUser_()` then checks Role; throws 403 if MEMBER

## Step 2 — OrderWorkflow.gs: Gate updateOrderStatus on Role
- [x] Modify `updateOrderStatus()` to call `assertOfficerOrSponsor_()` instead of `assertAuthorizedOpsUser_()` so only OFFICER/SPONSOR can advance statuses

## Step 3 — OrderDataService.gs: Add getDashboardOrders()
- [x] Add `getDashboardOrders()` function
- [x] Reads all rows from Orders sheet
- [x] Filters to statuses: Submitted, Quote Provided, In Production, Ready for Pickup
- [x] Returns object: `{ needsReview, awaitingResponse, inProduction, readyForPickup }` — each an array of order row objects
- [x] Each row object includes: orderNumber, orderType, customerName, status, updatedAt, itemSummary, pickupWindow, duplicateWarning

## Step 4 — WebApp.gs: Add dashboard endpoints
- [x] Add `action=dashboard` handler: calls `assertAuthorizedOpsUser_()`, fetches initial data via `getDashboardOrders()`, gets role via `getUserRole_()`, renders Dashboard.html template with `initialDataJson`, `userRole`, `webAppUrl`
- [x] Add `action=dashboard-data` handler: calls `assertAuthorizedOpsUser_()`, returns `jsonResponse_` with orders + userRole
- [x] Add `action=update-status` handler: calls `assertOfficerOrSponsor_()`, reads `orderNumber` + `newStatus` params, calls `updateOrderStatus()`, returns JSON result

## Step 5 — Dashboard.html: Create ops dashboard UI
- [x] Dark ops theme: `#1a1a2e` background, neutral card surfaces `#16213e`, purple accent `#5b2d90`
- [x] Four queue sections rendered as collapsible card columns: Needs Review, Awaiting Response, In Production, Ready for Pickup
- [x] Each order row: Order Number, Order Type, Customer Name, Status, Timestamp
- [x] Click-to-expand row detail: Item Summary, Pickup Window, Duplicate Warning badge
- [x] Role=OFFICER/SPONSOR: status dropdown per row + "Update" button; Role=MEMBER: no action controls
- [x] Auto-refresh: `setInterval` fetches `?action=dashboard-data` every 60 seconds, re-renders queues
- [x] Loading state and error state for fetch failures
- [x] `WEB_APP_URL` injected from template (same pattern as StatusChecker)

## Step 6 — sheet-schema.md: Confirm Role column documented
- [x] Verified ClubRoster Role column documentation is accurate (no changes needed — already defined)

## Step 7 — Audit + State update
- [x] Append generation completion entry to `aidlc-docs/audit.md`
- [x] Update `aidlc-docs/aidlc-state.md` stage progress

---

## Files Changed
| File | Action |
|---|---|
| `integration/apps-script/OrderWorkflow.gs` | Modify — add getUserRole_(), assertOfficerOrSponsor_(), update updateOrderStatus gate |
| `integration/apps-script/OrderDataService.gs` | Modify — add getDashboardOrders() |
| `integration/apps-script/WebApp.gs` | Modify — add 3 new action handlers |
| `integration/apps-script/Dashboard.html` | Create — new ops dashboard UI |

# Shopping Cart — Execution Plan

**Feature**: Shopping Cart  
**Date**: 2026-05-13  
**Phase**: CONSTRUCTION — Code Generation (single unit: `shopping-cart`)

---

## Workflow Decision

| Stage | Execute? | Reason |
|---|---|---|
| Reverse Engineering | SKIP | Artifacts already exist from prior session |
| User Stories | SKIP | Scope is clear; single user type (student customer) |
| Application Design | SKIP | Single unit, no new service boundaries |
| Units Generation | SKIP | Single unit of work |
| Functional Design | SKIP | Requirements are detailed enough; no new DB schema design needed |
| NFR Requirements | SKIP | NFRs documented inline in requirements; no external infra changes |
| NFR Design | SKIP | No infrastructure or scaling changes |
| Infrastructure Design | SKIP | No cloud resource changes |
| **Code Generation** | **EXECUTE** | Core deliverable |
| **Build and Test** | **EXECUTE** | Always runs |

---

## Unit of Work: `shopping-cart`

### Files to Create
| File | Location | Purpose |
|---|---|---|
| `Cart.html` | `integration/apps-script/Cart.html` | Shopping cart UI — HtmlService page |

### Files to Modify
| File | Location | Changes |
|---|---|---|
| `WebApp.gs` | `integration/apps-script/WebApp.gs` | Add `action=cart` (serve Cart.html) |
| `OrderDataService.gs` | `integration/apps-script/OrderDataService.gs` | Add `getActiveProducts()` |
| `OrderWorkflow.gs` | `integration/apps-script/OrderWorkflow.gs` | Add `submitCartOrder()` |
| `SETUP.md` | `integration/docs/SETUP.md` | Document cart endpoint |
| `GOOGLE_SITES_BUILD.md` | `integration/docs/GOOGLE_SITES_BUILD.md` | Add cart page build instructions |

---

## Code Generation Plan (Checkboxes)

### Step 1 — `OrderDataService.gs`: Add `getActiveProducts()`
- [ ] Read all rows from Products sheet
- [ ] Filter: `IsActive` blank/true AND `InventoryCount >= 0` (return all; let client decide OOS display)
- [ ] Return array of `{ productId, sku, name, description, priceCents, paymentLink, imageUrl, inventoryCount }`
- [ ] `imageUrl` read from `ImageUrl` column if it exists; empty string otherwise

### Step 2 — `OrderWorkflow.gs`: Add `submitCartOrder()`
- [ ] Accept `{ items: [{sku, name, quantity, unitPriceCents, paymentLink}], customerName, customerEmail }`
- [ ] Validate: name non-empty, email contains `@`, items array non-empty, all quantities >= 1
- [ ] Server-side inventory check per item: read Products sheet, throw if any item `InventoryCount <= 0`
- [ ] Generate `orderNumber` (`RS-YYYYMMDD-NNNN`) and `receiptCode`
- [ ] Write one row to Orders sheet: `OrderNumber`, `ReceiptCode`, `Status=Pending`, `OrderType=Cart Order`, `ItemSummary`, `UpdatedAt`
- [ ] Write one row per item to OrderItems sheet: `OrderItemID`, `OrderNumber`, `SKU`, `ProductName`, `Quantity`, `UnitPriceCents`, `CreatedAt`
- [ ] Send confirmation email with itemized list, payment links per item, status tracker link
- [ ] Return `{ orderNumber, receiptCode, paymentLinks }`

### Step 3 — `WebApp.gs`: Add `action=cart`
- [ ] Add handler: `assertNone` (public, no auth required)
- [ ] Inject template vars into `Cart.html`: `webAppUrl`, `userRole` (N/A for cart)
- [ ] Set `ALLOWALL` XFrame mode for Sites embed

### Step 4 — `Cart.html`: Shopping cart UI
- [ ] Purple/gold storefront palette (matches Google Sites school colors, not ops dark theme)
- [ ] Product grid: card per product with Name, Description, Price, optional image / placeholder
- [ ] "Out of Stock" badge and disabled Add button when `inventoryCount <= 0`
- [ ] Quantity selector (− / number / +) per cart line item
- [ ] Cart sidebar / drawer: line items, subtotals, grand total
- [ ] Remove item button per line item
- [ ] Checkout form: Full Name, School Email, Place Order button
- [ ] Client-side validation before calling `google.script.run.submitCartOrder`
- [ ] Loading state while `google.script.run` is in-flight
- [ ] Success screen: Order Number, Receipt Code, payment link buttons per item
- [ ] Error handling: inline message, cart preserved on failure
- [ ] Responsive layout (mobile-friendly)
- [ ] Load products via `google.script.run.getActiveProducts()` on page load

### Step 5 — Docs: `SETUP.md` + `GOOGLE_SITES_BUILD.md`
- [ ] Add cart endpoint to SETUP.md: `<webapp-url>?action=cart`
- [ ] Add Google Sites cart page instructions to GOOGLE_SITES_BUILD.md
- [ ] Note that `ImageUrl` is an optional new column in Products sheet

---

## Acceptance Criteria

- [ ] Cart page loads products from the sheet
- [ ] Out-of-stock products cannot be added
- [ ] Quantities adjust correctly; total updates live
- [ ] Placing an order creates a row in Orders sheet + rows in OrderItems sheet
- [ ] Confirmation email is sent with itemized list + payment links
- [ ] Success screen shows Order Number, Receipt Code, and payment links
- [ ] Page is embeddable in Google Sites iframe

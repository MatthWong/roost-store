# Shopping Cart — Requirements

**Feature**: Shopping Cart for Roost Store Google Sites  
**Date**: 2026-05-13  
**Type**: New Feature (Brownfield)  
**Source**: shopping-cart-requirement-questions.md answers

---

## Intent Analysis

- **Request Type**: New Feature
- **Scope**: Multiple components (new HTML page + 3 existing .gs files modified)
- **Complexity**: Moderate
- **Depth Level**: Standard

---

## Functional Requirements

### FR-1: Product Catalog Display
- The cart page loads all active standard products from the Products sheet (`IsActive` not false, `InventoryCount > 0`)
- Each product card displays: Name, Description, Price (formatted from PriceCents), and optional image (shown if `ImageUrl` column exists and is non-empty, otherwise a placeholder)
- Products with `InventoryCount = 0` are shown as "Out of Stock" and cannot be added to cart

### FR-2: Add to Cart
- Customer can add any in-stock product to the cart
- Each line item has a quantity selector (minimum 1)
- Customer can remove a line item from the cart
- Cart is session-only — cleared when the browser tab is closed (no localStorage)

### FR-3: Cart Summary
- Cart panel shows all line items: product name, quantity, unit price, line total
- Cart shows overall total (sum of all line totals)
- Cart is visible alongside the product grid (sidebar or bottom panel)

### FR-4: Checkout Form
- Customer provides: Full Name, School Email
- Item details are inferred from cart contents (no duplicate form fields)
- Customer must agree to a brief note that payment links will be emailed to complete the order

### FR-5: Order Submission
- On "Place Order", the cart page calls Apps Script (`submitCartOrder`) via `google.script.run`
- Apps Script creates a row in the Orders sheet with:
  - `OrderNumber` (generated, format `RS-YYYYMMDD-NNNN`)
  - `ReceiptCode` (generated)
  - `Status` = `Pending`
  - `OrderType` = `Cart Order`
  - `ItemSummary` = human-readable list (e.g. "2× Keychain, 1× Water Bottle")
  - `UpdatedAt` = submission timestamp
- Apps Script creates rows in OrderItems sheet (one per line item: OrderNumber, SKU, Name, Quantity, UnitPriceCents)
- Apps Script sends confirmation email containing:
  - Order Number + Receipt Code
  - Itemized list with quantities and prices
  - Square payment link per product (from Products sheet `PaymentLink` column)
  - Status tracker link (pre-filled checker URL)

### FR-6: Post-Submission UI
- On success: cart page shows a confirmation screen with Order Number, Receipt Code, and payment links for each item
- On failure: shows an inline error message; cart contents are preserved so the customer can retry

### FR-7: Cart Hosting
- Served as an Apps Script HtmlService page via `action=cart`
- Embeddable in Google Sites via iframe (same pattern as status checker)
- Can also be opened directly in a new tab

---

## Non-Functional Requirements

### NFR-1: Inventory Safety
- `InventoryCount` is checked server-side at submission time (not just client-side) to prevent overselling
- If a product is out of stock at submission time, the server returns an error per affected item and does not create the order

### NFR-2: Input Validation
- Full Name: required, non-empty
- School Email: required, must contain `@`
- Cart: must have at least one item with quantity >= 1
- All validation performed both client-side (UX) and server-side (safety)

### NFR-3: Compatibility
- Works in modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive layout — usable on mobile screen widths (students on phones)

### NFR-4: Consistency
- Visual style matches Dashboard.html dark ops theme only for ops pages; the cart uses the school's purple/gold storefront palette to match the Google Site

---

## Out of Scope
- Custom orders (engraving, embroidery, heat press) — these continue to use the Google Form
- Cart persistence across sessions (localStorage)
- Real-time inventory decrement (InventoryCount is read-only at submission; manual ops update)
- Multi-currency or tax calculation
- Guest vs. signed-in user distinction

---

## Data Model Changes

### Products sheet — add column:
| Column | Type | Purpose |
|---|---|---|
| `ImageUrl` | String (URL) | Optional product image. Empty = show placeholder. |

### OrderItems sheet — existing schema is sufficient:
`OrderItemID`, `OrderNumber`, `ApparelType`→reuse as `SKU`, `ApparelSize`→reuse as `ProductName`, `Quantity`, `CreatedAt` — plus add `UnitPriceCents` column.

### Orders sheet — no new columns needed (uses existing `OrderType`, `ItemSummary`, `Status`, `PaymentLink`).

---

## Extension Configuration
| Extension | Enabled |
|---|---|
| Security Baseline | No |
| Property-Based Testing | No |

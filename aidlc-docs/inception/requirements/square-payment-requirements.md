# Square Dynamic Payment — Requirements

**Feature**: Dynamic Square Payment Link creation at cart checkout
**Date**: 2026-05-14
**Status**: Approved

---

## Answers Summary

| # | Topic | Answer |
|---|---|---|
| Q1 | Payment scope | A — Single link covering entire cart (all items as line items) |
| Q2 | Creation timing | A — At order submission, inside `submitCartOrder()` |
| Q3 | Fallback | A — Keep `PAYMENT_LINKS` mode; `SQUARE_API` mode generates dynamically |
| Q4 | Pre-fill | B — Name + Email pre-filled on Square Checkout page |
| Q5 | Storage | A — Stored in Orders sheet `PaymentLink` column + shown in email + success screen |
| Q6 | Failure | B — Degrade gracefully: create order, omit link, instruct customer to contact store |
| Q7 | Reference | A — Order number included as `reference_id` and `customer_note` in Square payment |
| Q8 | Environment | B — Sandbox by default; configurable via `SQUARE_ENVIRONMENT` Script Property |

---

## Functional Requirements

### FR-1 — Single Cart Payment Link
When `INTEGRATION_MODE = SQUARE_API`, calling `submitCartOrder()` must call the Square Payment Links API (`POST /v2/online-checkout/payment-links`) to generate one checkout URL covering all cart line items before sending the confirmation email.

### FR-2 — Line Items in Square Checkout
The Square payment request must include one line item per cart item with: product name, quantity (string), and `base_price_money` in cents.

### FR-3 — Customer Pre-fill
The Square payment request must include `pre_populated_data.buyer_email` and `pre_populated_data.buyer_address.first_name` / `last_name` derived from the customer's submitted name.

### FR-4 — Order Reference
The Square payment request must include `order.reference_id` and `order.customer_note` both set to the generated order number (e.g. `RS-20260514-0001`).

### FR-5 — Link Persistence
The generated Square checkout URL must be written to the `PaymentLink` column of the new Orders sheet row.

### FR-6 — Email Integration
`sendCartConfirmationEmail_()` must show the single Square checkout URL instead of per-item links when a `paymentUrl` is provided.

### FR-7 — Success Screen Integration
`Cart.html` success screen must show a single "Pay Now" button linking to `result.paymentUrl` when present, replacing per-item payment buttons.

### FR-8 — Graceful Degradation
If the Square API call fails (network error, bad token, invalid location), `submitCartOrder()` must log the error, complete the order row without a payment link, and send a fallback email instructing the customer to contact the store for payment.

### FR-9 — Fallback Mode Unchanged
When `INTEGRATION_MODE = PAYMENT_LINKS`, cart checkout behaviour is unchanged (per-item static links from Products sheet).

### FR-10 — Sandbox/Production Toggle
`squareRequest_()` must derive the base URL from a new `SQUARE_ENVIRONMENT` Script Property (`sandbox` → `https://connect.squareupsandbox.com/v2`, `production` → `https://connect.squareup.com/v2`). Default: `sandbox`.

---

## Non-Functional Requirements

### NFR-1 — Idempotency
Every Square API call must include a unique `idempotency_key` (`Utilities.getUuid()`) to prevent duplicate charges on retry.

### NFR-2 — Security
The Square access token is read only from `PropertiesService.getScriptProperties()` — never embedded in source code or returned to the client.

### NFR-3 — Resilience
Square API errors must not prevent order row creation. All Square call failures are caught, logged via `Logger.log`, and handled per FR-8.

---

## Affected Files

| File | Change Type |
|---|---|
| `integration/apps-script/Config.gs` | Modify — add `environmentProperty`, `getSquareBaseUrl_()` |
| `integration/apps-script/SquareClient.gs` | Modify — update `squareRequest_()`, add `createCartPaymentLink_()` |
| `integration/apps-script/OrderWorkflow.gs` | Modify — update `submitCartOrder()` and `sendCartConfirmationEmail_()` |
| `integration/apps-script/Cart.html` | Modify — update success screen payment section |

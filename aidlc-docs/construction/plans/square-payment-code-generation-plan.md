# Square Dynamic Payment — Code Generation Plan

**Feature**: Dynamic Square Payment Link creation
**Date**: 2026-05-14
**Unit**: square-payment

---

## Files to Change

| File | Path | Change |
|---|---|---|
| `Config.gs` | `integration/apps-script/Config.gs` | Add `environmentProperty`; add `getSquareBaseUrl_()` |
| `SquareClient.gs` | `integration/apps-script/SquareClient.gs` | Update `squareRequest_()` to use `getSquareBaseUrl_()`; add `createCartPaymentLink_()` |
| `OrderWorkflow.gs` | `integration/apps-script/OrderWorkflow.gs` | Update `submitCartOrder()` and `sendCartConfirmationEmail_()` |
| `Cart.html` | `integration/apps-script/Cart.html` | Update success screen payment section |

---

## Execution Steps

### Step 1 — `Config.gs`: Add environment support
- [x] Add `environmentProperty: 'SQUARE_ENVIRONMENT'` key inside `AppConfig.square`
- [x] Add `sandboxBaseUrl` constant (`https://connect.squareupsandbox.com/v2`) inside `AppConfig.square`
- [x] Add `getSquareBaseUrl_()` function: reads `SQUARE_ENVIRONMENT` property; returns sandbox URL if value is `'sandbox'` or property is unset/empty; returns production URL (`AppConfig.square.baseUrl`) if value is `'production'`

### Step 2 — `SquareClient.gs`: Update request helper + add cart link creator
- [x] In `squareRequest_()`, replace `AppConfig.square.baseUrl` with `getSquareBaseUrl_()`
- [x] Add `createCartPaymentLink_(orderNumber, customerName, customerEmail, items)`:
  - Build `line_items` array from `items` — each entry: `{ name, quantity: String(qty), base_price_money: { amount: priceCents, currency: 'USD' } }`
  - Validate all items have `priceCents > 0`; throw if not
  - Split `customerName` into `firstName` / `lastName` (split on last space; if single word, use as first_name)
  - Build payload with `idempotency_key`, `order.location_id`, `order.reference_id = orderNumber`, `order.customer_note = orderNumber`, `order.line_items`, `pre_populated_data.buyer_email`, `pre_populated_data.buyer_address`
  - Call `squareRequest_('/online-checkout/payment-links', 'post', payload)`
  - Return `body.payment_link.url`

### Step 3 — `OrderWorkflow.gs`: Wire into `submitCartOrder()` and email
- [x] After writing OrderItems rows in `submitCartOrder()`, add Square API block:
  - If `isSquareApiEnabled()`: call `createCartPaymentLink_(orderNumber, name, email, items)` inside try/catch
    - On success: write URL to Orders sheet `PaymentLink` column; set `paymentUrl = url`
    - On failure: `Logger.log` the error; set `paymentUrl = null` (graceful degrade)
  - Else: `paymentUrl = null`
- [x] Pass `paymentUrl` to `sendCartConfirmationEmail_()` and include in the returned object
- [x] Update `sendCartConfirmationEmail_()`:
  - Accept optional `paymentUrl` field on `data`
  - If `data.paymentUrl`: replace per-item link block with a single "Pay for your order: `<url>`" line
  - If not: replace per-item link block with "Contact the store to arrange payment." fallback line
  - Keep all other email content unchanged

### Step 4 — `Cart.html`: Update success screen
- [x] In the success screen render function, detect `result.paymentUrl`:
  - If present: show one `<a href="..." target="_blank">` "Pay Now" button (styled with existing button classes)
  - If absent and `result.items` have `paymentLink`: keep existing per-item link buttons
  - If neither: show a `<p>Contact the store to arrange payment.</p>` message
- [x] Ensure `esc()` is applied to any URL rendered into `href` attributes

---

## Dependency Order

Step 1 must complete before Step 2 (Step 2 calls `getSquareBaseUrl_()`).
Steps 3 and 4 are independent of each other; both depend on Steps 1–2 being logically complete.

---

## Script Properties Required (for deployment)

| Property | Value | Notes |
|---|---|---|
| `INTEGRATION_MODE` | `SQUARE_API` | Enables dynamic payment creation |
| `SQUARE_PERSONAL_ACCESS_TOKEN` | `<token>` | From Square Developer Dashboard |
| `SQUARE_LOCATION_ID` | `<location>` | From Square Developer Dashboard |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` | Default: `sandbox` if omitted |

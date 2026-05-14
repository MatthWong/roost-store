# Fallback-First Integration Setup (Google Sites + Square Payment Links)

## Primary Mode (Default)
- Integration mode: PAYMENT_LINKS
- Payments: Square Payment Links
- Custom orders: Google Form + file upload
- Tracking: Google Sheet + Apps Script status endpoint
- Club operations: Protected Google Sheets tabs with role-based sharing

## 1) Prepare Google Assets
1. Create a Google Form for custom orders and link responses to this spreadsheet.
  - Use exact field text and section logic in integration/docs/GOOGLE_FORMS_SETUP_TEXT.md.
  - Important: Google Forms usually creates a tab named `Form Responses 1`.
  - If an `Orders` tab already exists, delete or rename the old `Orders` tab first, then rename `Form Responses 1` to `Orders`.
2. Create remaining tabs/headers described in ../config/sheet-schema.md (except `Orders`, which is now the form response tab).
3. Fill StoreHours and ClubRoster.
4. Add Products and PaymentLinks rows.
5. Ensure OrderItems tab exists with headers:
- OrderItemID, OrderNumber, ApparelType, ApparelSize, Quantity, CreatedAt
6. In the `Orders` tab, append these operational headers (to the right of form response columns if needed):
- OrderNumber
- TemporaryOrderID
- PermanentOrderNumber
- ReceiptCode
- Status
- QuoteRequired
- ItemSummary
- PickupWindow
- DuplicateWarning
- ImageFileURL
- ImageFileName
- ImageUploadedAt
- PaymentLink
- IsPaid
- UpdatedAt
7. Ensure custom form question titles map to these expected fields where possible:
- Order Type
- Full Name / Customer Name
- School Email / Customer Email
- Engraving Item Description
- Engraving Quantity
- Engraving Text
- Engraving Design Image Upload
- Engraving Placement Choice
- Engraving Review Confirmation
- Embroidery Apparel Type 1..3
- Embroidery Size 1..3
- Embroidery Qty 1..3
- Embroidery Design Image Upload
- Embroidery Placement Choice
- Embroidery Review Confirmation
- Heat Press Apparel Type 1..3
- Heat Press Size 1..3
- Heat Press Qty 1..3
- Heat Press Design Image Upload
- Heat Press Placement Choice
- Heat Press Review Confirmation
- Custom Item Description
- Custom Item Quantity
- Quote Request
- Additional Notes

Important:
- Use unique section-prefixed question titles so Google Forms does not generate duplicate response columns when the same kind of field appears in multiple sections.
- If you already linked a form with repeated titles, rename the questions first and then relink or recreate the response sheet so the headers regenerate cleanly.
- The script accepts the final unique labels in [OrderWorkflow.gs](../apps-script/OrderWorkflow.gs), so the sheet and form should stay in lockstep.

## 2) Add Apps Script
1. Open the Google Sheet -> Extensions -> Apps Script.
2. Create files and paste all scripts from ../apps-script.
3. Add HTML files from integration/apps-script/:
   - `StatusChecker.html`
   - `Dashboard.html`
   - `Cart.html`
4. In Script Properties, set:
- INTEGRATION_MODE=PAYMENT_LINKS
- ALLOWED_SCHOOL_DOMAIN=<your school domain>
- STATUS_CHECKER_URL=<webapp-url>?action=checker

Optional now, required later for Square API mode:
- SQUARE_PERSONAL_ACCESS_TOKEN=<token>
- SQUARE_LOCATION_ID=<location-id>
- SQUARE_ENVIRONMENT=sandbox  (use 'production' for live payments; omit to default to sandbox)

## 3) Configure Trigger
1. In Apps Script -> Triggers -> Add Trigger.
2. Function: onFormSubmit
3. Event source: From spreadsheet
4. Event type: On form submit
5. Reauthorize script after trigger creation so file upload metadata can be processed.

## 4) Deploy Web App (Status + Products)
1. Deploy -> New Deployment -> Web app.
2. Execute as: Me
3. Who has access: Anyone with link (or your domain, based on policy)
4. Save deployment URL.

Status endpoint example:
- <webapp-url>?action=status&orderNumber=RS-20260510-1234&receiptCode=AB12CD34

Checker page URL (recommended for Google Sites embed):
- <webapp-url>?action=checker

Submission email behavior:
- On each successful form submission, Apps Script sends a confirmation email to the submitter.
- The email includes Order Number, Receipt Code, current status, and `STATUS_CHECKER_URL` (if configured).
- Primary recipient is `School Email`.
- If `School Email` is blank, Apps Script falls back to the logged-in respondent email (`Email Address` from Google Forms, if available).
- If `School Email` and logged-in respondent email differ, Apps Script sends to `School Email` and CCs the logged-in respondent email.

Status checker behavior:
- Customers can check status using either a temporary (`TMP-...`) or permanent (`RS-...`) order number with the matching receipt code.
- After Apps Script changes, redeploy the web app so the embedded checker uses the latest status lookup logic.

Note on order IDs:
- New custom orders may start with a temporary ID format (`TMP-...`) before a permanent order number (`RS-...`) is assigned.

Products endpoint example:
- <webapp-url>?action=products

Ops dashboard URL (embed in members-only Google Sites page):
- <webapp-url>?action=dashboard

Ops dashboard data endpoint (JSON, used by dashboard auto-refresh):
- <webapp-url>?action=dashboard-data

Shopping cart URL (embed in Google Sites storefront page):
- <webapp-url>?action=cart

Note: The cart page reads from the Products sheet. Add an optional `ImageUrl` column to Products to show product images in the cart.

Ops status update endpoint (OFFICER/SPONSOR only):
- <webapp-url>?action=update-status&orderNumber=TMP-20260513-12345&newStatus=Under+Review

Ops dashboard role behavior:
- MEMBER: can view all queues; no status update controls shown.
- OFFICER / SPONSOR: can view all queues, advance order status via dropdown, mark orders as paid, and cancel orders.
- Role is read from the `Role` column in the ClubRoster sheet (MEMBER, OFFICER, SPONSOR).
- `updateOrderStatus` and `cancelOrderAndGetDashboard` are gated server-side to OFFICER/SPONSOR — MEMBERs cannot call these functions directly.

Cancellation behavior:
- Any order in any active queue can be cancelled by an OFFICER or SPONSOR.
- Click "Cancel Order" on an order card, enter a reason, then click "Confirm Cancellation".
- The order `Status` is set to `Cancelled` and it disappears from the dashboard immediately.
- A cancellation email is automatically sent to the customer with the reason provided.

## 5) Connect to Google Sites
1. Embed product pages and Square payment links.
2. Add a status-check page with order number + receipt code input.
3. Connect status page with Embed URL: <webapp-url>?action=checker.
  - Do not embed <webapp-url>?action=status directly for end users because it returns JSON.
4. Add an ops dashboard page restricted to DECA members (see GOOGLE_SITES_BUILD.md Section 10).
  - Embed URL: <webapp-url>?action=dashboard
  - Restrict page access to DECA members/officers/sponsors only via Google Sites page permissions.
4. Build the full Google Site using the page blueprint and publish checklist in integration/docs/GOOGLE_SITES_BUILD.md.

Google Site build guide:
- integration/docs/GOOGLE_SITES_BUILD.md

Google Forms exact text guide:
- integration/docs/GOOGLE_FORMS_SETUP_TEXT.md

## 6) Google Sheets Operations View
1. Use separate tabs/views in Google Sheets for operational roles:
- MEMBER view tab: limited fields (OrderNumber, item count, status)
- OFFICER/SPONSOR view tab: full order details
2. Configure protected ranges so only sponsor/officers can edit status fields.
3. Share the sheet with DECA members as Viewer/Commenter, and officers/sponsor as Editor.
4. Allow sponsor to manage ClubRoster and status updates.
5. Create dedicated "Custom Orders" view/tab that includes:
- OrderNumber
- OrderType
- ItemSummary
- Status
- QuoteRequired
- PickupWindow
- PaymentLink

Custom status progression for operations:
- Submitted -> Under Review -> Quote Provided -> Quote Accepted -> In Production -> Ready for Pickup -> Picked Up

Note:
- Pickup window is intentionally assigned when status transitions to In Production.

## Switching to Square API (Dynamic Cart Checkout)
When ready to enable live Square payments for the shopping cart:
1. In your [Square Developer Dashboard](https://developer.squareup.com), create an application and copy your access token and location ID.
2. Set Script Properties in Apps Script → Project Settings → Script Properties:
   - `SQUARE_PERSONAL_ACCESS_TOKEN` = your access token
   - `SQUARE_LOCATION_ID` = your location ID
   - `SQUARE_ENVIRONMENT` = `sandbox` for testing, `production` for live payments
   - `INTEGRATION_MODE` = `SQUARE_API`
3. Test in sandbox first:
   - Set `SQUARE_ENVIRONMENT=sandbox` and use sandbox credentials from the Square Developer Dashboard.
   - Place a test cart order and confirm the redirect to Square Checkout occurs and a payment link appears in the Orders sheet.
4. Go live:
   - Swap to production credentials and set `SQUARE_ENVIRONMENT=production`.
5. Validate:
   - `<webapp-url>?action=products` should return `squareApiEnabled: true`.

What changes in Square API mode:
- Cart checkout generates a single Square Checkout link covering all items (instead of per-item static links).
- Customer name and email are pre-filled on the Square payment page.
- The order number is included as a reference on the Square transaction.
- After payment, Square redirects the customer back to their order status page.
- The generated payment URL is saved to the `PaymentLink` column in the Orders sheet.
- If the Square API call fails, the order is still created and the customer is told to contact the store for payment.

Rollback to static payment links:
- Set `INTEGRATION_MODE=PAYMENT_LINKS` (or run `setIntegrationMode('PAYMENT_LINKS')` in the Apps Script editor).
- Cart checkout will revert to showing per-item links from the Products sheet `PaymentLink` column.

## Notes
- Keep API tokens only in Script Properties, never in sheet cells or site HTML.
- Google Sites remains the storefront; operational workflows run in Google Sheets + Apps Script.

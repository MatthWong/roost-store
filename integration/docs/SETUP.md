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
  - Important: Google Forms usually creates a tab named `Form Responses 1`. Rename that tab to `Orders` so Apps Script writes to the correct sheet.
2. Create a Google Sheet and add tabs/headers described in ../config/sheet-schema.md.
3. Fill StoreHours and ClubRoster.
4. Add Products and PaymentLinks rows.
5. Ensure OrderItems tab exists with headers:
- OrderItemID, OrderNumber, ApparelType, ApparelSize, Quantity, CreatedAt
6. Ensure custom form question titles map to these expected fields where possible:
- Order Type
- Full Name / Customer Name
- School Email / Customer Email
- Item Description / Custom Item Description
- Quantity / Qty 1..Qty 8
- Apparel Type 1..8
- Size 1..8
- Design Image Upload

## 2) Add Apps Script
1. Open the Google Sheet -> Extensions -> Apps Script.
2. Create files and paste all scripts from ../apps-script.
3. Add HTML file `StatusChecker.html` from integration/apps-script/StatusChecker.html.
4. In Script Properties, set:
- INTEGRATION_MODE=PAYMENT_LINKS
- ALLOWED_SCHOOL_DOMAIN=<your school domain>

Optional now, required later for Square API mode:
- SQUARE_PERSONAL_ACCESS_TOKEN=<token>
- SQUARE_LOCATION_ID=<location-id>

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

Note on order IDs:
- New custom orders may start with a temporary ID format (`TMP-...`) before a permanent order number (`RS-...`) is assigned.

Products endpoint example:
- <webapp-url>?action=products

## 5) Connect to Google Sites
1. Embed product pages and Square payment links.
2. Add a status-check page with order number + receipt code input.
3. Connect status page with Embed URL: <webapp-url>?action=checker.
  - Do not embed <webapp-url>?action=status directly for end users because it returns JSON.
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

## Switching to Square API Later
When token and permissions are available:
1. Set Script Properties:
- SQUARE_PERSONAL_ACCESS_TOKEN
- SQUARE_LOCATION_ID
2. Change mode:
- Run setIntegrationMode('SQUARE_API') in Apps Script editor, or
- Use web endpoint (authorized ops user):
  - <webapp-url>?action=mode&mode=SQUARE_API
3. Validate:
- <webapp-url>?action=products should show squareApiEnabled=true.

Rollback:
- setIntegrationMode('PAYMENT_LINKS')

## Notes
- Keep API tokens only in Script Properties, never in sheet cells or site HTML.
- Google Sites remains the storefront; operational workflows run in Google Sheets + Apps Script.

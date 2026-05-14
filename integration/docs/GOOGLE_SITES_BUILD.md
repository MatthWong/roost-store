# Google Sites Build Guide - Roost Store

## Objective
Create and publish the Google Site storefront for Roost Store using the fallback-first architecture (Google Sites + Google Forms + Google Sheets + Apps Script + Square Payment Links).

## Prerequisites
- Apps Script Web App deployed and URL saved.
- Google Form for custom orders created.
- Google Sheet configured with schema from integration/config/sheet-schema.md.
- Product and payment link records loaded.

## Site Creation Steps

### 1. Create Site Shell
1. Open Google Sites and create a new blank site.
2. Site name: Roost Store.
3. Header type: Large banner.
4. Theme colors:
   - Primary: Purple
   - Accent: Gold

### 2. Build Navigation Pages
Create these pages in this order:
1. Home
2. Food
3. Merchandise
4. Custom Orders
5. Order Status
6. New Products
7. Contact

Optional staff pages (only if your school policy allows access controls):
1. Operations Summary
2. Sponsor Updates

### 3. Home Page Content
Add sections:
1. Hero section
   - Title: Roost Store
   - Subtitle: DECA Student-Run School Store
   - Button 1: Shop Food (link to Food)
   - Button 2: Shop Merchandise (link to Merchandise)
2. New arrivals strip
   - Use card layout linked to New Products page.
3. How ordering works
   - Step 1: Select items
   - Step 2: Pay with Square link
   - Step 3: Pick up during store hours
4. Custom work callout
   - CTA button: Start Custom Order (link to Google Form)

### 4. Food Page
1. Add section title: Food Menu.
2. Add card grid for each item with:
   - Item name
   - Short description
   - Price
   - Pickup note
   - Buy button linked to Square payment link
3. Add notice: Orders are pickup only.

### 5. Merchandise Page
1. Add section title: School Merchandise.
2. Add card grid for water bottles, earbuds, blankets, t-shirts, and other products.
3. For each card add:
   - Image
   - Description
   - Price
   - Buy button linked to Square payment link

### 6. Custom Orders Page
1. Add section title: Custom Services.
2. Add service cards:
   - Engraving
   - Embroidery
   - Heat Press
   - Custom Item Quote
3. Add a single CTA button linking to the custom-order Google Form.
4. Add requirements block:
   - Embroidery and Heat Press require image upload.
   - Apparel selections include repeated line items for type, size, and quantity.
   - Supported sizes: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL.
   - Custom items require quote review before production.
   - Custom status flow: Submitted -> Under Review -> Quote Provided -> Quote Accepted -> In Production -> Ready for Pickup -> Picked Up.

### 7. Order Status Page
1. Add section title: Check Order Status.
2. Add instruction text:
   - Enter order number and receipt code.
   - If your order is custom, status updates include review and production stages.
3. Add an Embed component for input boxes:
   - Use Google Sites: Insert -> Embed -> By URL.
   - Embed URL: <webapp-url>?action=checker
   - This renders the Apps Script HTML checker with `orderNumber` and `receiptCode` input fields.
4. (Fallback only) If you cannot embed the checker page, add a Button linking to <webapp-url>?action=checker.
5. Add fallback support text with contact email for failed lookups.

Checker note:
- Do not embed `?action=status` directly for end users; that endpoint returns JSON and is intended for API calls.

### 8. New Products Page
1. Add section title: New This Week.
2. Add cards for products tagged as new.
3. Include publish date and short spotlight note.

### 9. Contact Page
1. Add contact email.
2. Add store hours summary.
3. Add pickup location details.
4. Add DECA sponsor contact details.

### 10. Ops Dashboard Page (Members Only)
1. Create a new page: **Operations** (or **Team Dashboard**).
2. Hide the page from the site navigation so casual visitors don't see it:
   - In the Pages panel (right side), hover the page name → click the three-dot menu (⋮) → **Hide from navigation**.
   - The page still exists at its URL but won't appear in the nav bar.
3. **Note on access control**: New Google Sites does not support per-page access restrictions. Access control is enforced by the Apps Script web app itself — anyone who navigates to the page will see an error from the dashboard embed if they are not in the ClubRoster sheet with `IsActive = true`. No order data is ever exposed to unauthorized users.
   - If your school uses Google Workspace and you want to fully hide the page, publish the *entire site* to "Only people in [your domain]" (Publish settings → Who can view → Anyone in your organization). This restricts the whole site to signed-in school accounts.
4. Add a section title: **Order Queue**.
5. Add instruction text:
   - Officers and sponsors can advance order status, mark orders as paid, and cancel orders from this dashboard.
   - Members can view orders but cannot change status or cancel.
   - The dashboard auto-refreshes every 60 seconds.
6. Add an Embed component or Button link:
   - **Recommended**: Use a **Button** component → link to `<webapp-url>?action=dashboard` with "Open in new tab" behavior. This is the most reliable method because the dashboard requires Google identity, which only works in a direct browser tab (not an iframe — modern browsers block third-party cookies in iframes, which prevents Apps Script from identifying the user).
   - **Embed fallback**: If you do embed via Insert → Embed → By URL, the page will display an "Open Dashboard in New Tab" button automatically when identity cannot be determined inside the iframe.
7. Add a note linking to the Google Sheet for detailed order data.

Dashboard queue reference:
| Queue | Order Status |
|---|---|
| Needs Review | Submitted |
| Under Review | Under Review |
| Awaiting Response | Quote Provided |
| In Production | In Production |
| Ready for Pickup | Ready for Pickup |

### 11. Shopping Cart Page
1. Create a new page: **Shop** (or **Order Online**).
2. In the page editor, click **Insert** → **Embed** → **By URL**.
3. Embed URL: `<webapp-url>?action=cart`
4. Recommended embed height: 700 px or taller so the product grid and cart panel are visible without excessive scrolling.
5. The cart page automatically loads products from the **Products** sheet. To add or update products, edit the sheet — no site republishing needed.
6. Optional: add an `ImageUrl` column to the Products sheet with direct image URLs to show product photos in the cart.
7. The cart is public — no sign-in required. Customers enter their name and school email at checkout.
8. After a successful order, the customer receives a confirmation email with:
   - Order Number + Receipt Code
   - Itemized list with quantities and prices
   - A single Square Checkout link for the entire cart (when `INTEGRATION_MODE=SQUARE_API`) — the page automatically redirects to Square after placing the order
   - Per-item static Square payment links (when `INTEGRATION_MODE=PAYMENT_LINKS`)
   - Pre-filled status tracker link
9. Square API mode setup (for dynamic cart checkout):
   - Set `INTEGRATION_MODE=SQUARE_API`, `SQUARE_PERSONAL_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, and `SQUARE_ENVIRONMENT` (`sandbox` or `production`) in Script Properties.
   - See SETUP.md "Switching to Square API" section for full steps.

## Integration Checklist
- Every product card has a working Square payment link.
- Custom Orders button opens the Google Form.
- Order Status page links to the status checker endpoint/page.
- Shopping Cart page embeds `<webapp-url>?action=cart` and loads products from the Products sheet.
- Cart checkout redirects to Square Checkout (`SQUARE_API` mode) or displays per-item payment links (`PAYMENT_LINKS` mode).
- Ops Dashboard page is restricted to DECA members and opens via `<webapp-url>?action=dashboard`.
- Ops Dashboard "Mark as Paid" button works for Ready for Pickup orders (OFFICER/SPONSOR only).
- Ops Dashboard "Cancel Order" button cancels the order and emails the customer (OFFICER/SPONSOR only).
- Navigation works on desktop and mobile.
- Theme colors are consistently purple and gold.

## Publish Checklist
1. Click Publish in Google Sites.
2. Publish URL suggestion: roost-store.
3. Viewer setting: anyone in school domain or anyone with link (per policy).
4. Re-test all external links after publish.

## Post-Publish Validation
1. Submit one test custom order.
2. Confirm row appears in Orders sheet.
3. Confirm order ID and receipt code are generated.
4. Confirm status lookup is accessible from Order Status page.
5. Confirm at least one food and one merchandise Square checkout flow opens correctly.
6. Confirm the Ops Dashboard page is visible to logged-in DECA members and restricted from public access.
7. Confirm OFFICER/SPONSOR can advance an order status from the dashboard.
8. Confirm MEMBER sees orders but no status update, paid, or cancel controls.
9. Place a test cart order — confirm confirmation email is received with a payment link.
10. If `INTEGRATION_MODE=SQUARE_API`: confirm cart redirects to Square Checkout and `PaymentLink` column is populated in the Orders sheet.
11. Confirm OFFICER/SPONSOR can mark a Ready for Pickup order as paid — `IsPaid` column updates to `TRUE` in the Orders sheet.
12. Confirm OFFICER/SPONSOR can cancel any active order — order disappears from dashboard and customer receives a cancellation email with the stated reason.

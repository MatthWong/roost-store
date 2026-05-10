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
3. Add an Embed component:
   - Embed URL: Apps Script status endpoint base URL.
   - If using JSON endpoint only, add button link to a hosted status checker page or Apps Script HTML view.
4. Add fallback support text with contact email for failed lookups.

### 8. New Products Page
1. Add section title: New This Week.
2. Add cards for products tagged as new.
3. Include publish date and short spotlight note.

### 9. Contact Page
1. Add contact email.
2. Add store hours summary.
3. Add pickup location details.
4. Add DECA sponsor contact details.

## Integration Checklist
- Every product card has a working Square payment link.
- Custom Orders button opens the Google Form.
- Order Status page links to the status checker endpoint/page.
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

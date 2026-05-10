# User Stories

## Story Organization
- Approach: Hybrid Persona-Based + Journey-Based
- Granularity: Medium (12-18 stories)
- Acceptance Criteria Detail: Standard (4-6 per story)
- MVP vs Post-MVP: MVP stories now + tagged post-MVP placeholders

## INVEST Validation Summary
- Independent: Stories are scoped by role and business capability
- Negotiable: UI presentation specifics are flexible while preserving required outcomes
- Valuable: Every story ties to customer value or operational control
- Estimable: Stories are implementation-sized for MVP delivery
- Small: Stories can be delivered incrementally across storefront, ordering, and operations
- Testable: Each story includes measurable acceptance criteria

## MVP Stories

### US-01: Browse Product Categories (Student/Teacher)
As a student or teacher customer,
I want to browse food, merchandise, and custom services,
so that I can quickly find what I need.

Acceptance Criteria:
- Category navigation is available from the storefront homepage.
- Each product/service listing shows name, short description, and price context where applicable.
- Site branding uses school purple and gold consistently.
- Navigation is mobile-friendly and readable on common school devices.

Persona Mapping: Student Customer, Teacher Customer

### US-02: Purchase with Square Payment Links (Student/Teacher)
As a customer,
I want each purchasable item to provide a Square Payment Link,
so that I can complete checkout securely.

Acceptance Criteria:
- Each active purchasable item has an associated payment link.
- Clicking checkout opens the corresponding Square Payment Link.
- If a payment link is missing, the item is marked unavailable for purchase.
- Order reference data is captured for status tracking workflow.

Persona Mapping: Student Customer, Teacher Customer

### US-03: Submit Engraving Orders (Student/Teacher)
As a customer,
I want to submit a custom engraving request with item description and quantity,
so that I can personalize items with engraved text or designs.

Acceptance Criteria:
- A Google Form is available for engraving-order submission.
- Form requests: item description (customer-supplied), quantity, optional file upload for design.
- Form explains that final output may vary due to material/media selection after submission.
- Submission creates a trackable order entry in Google Sheets with order type marked as "Engraving".
- Order is routed to staff for review and production planning.

Persona Mapping: Student Customer, Teacher Customer

### US-03b: Submit Embroidery Orders with Image Design (Student/Teacher)
As a customer,
I want to submit an embroidery request with apparel type selection, design image, and placement preview,
so that I can embroider custom designs on selected clothing.

Acceptance Criteria:
- A Google Form is available for embroidery-order submission.
- Form provides apparel type selector: short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo.
- Form allows specifying quantity for each apparel type.
- Form allows file upload for design image.
- Form provides image resizing controls (zoom in/out) before preview.
- Form provides image repositioning controls (drag/position on apparel mock-up) before preview.
- Form displays preview showing design placement on each selected apparel type.
- Customer must confirm preview before submission.
- Form explains that final output may vary due to material/media selection after submission.
- Submission creates a trackable order entry in Google Sheets with order type "Embroidery", apparel selections, and image metadata.
- Order is routed to staff for review and production planning.

Persona Mapping: Student Customer, Teacher Customer

### US-03c: Submit Heat Press Orders with Image Design (Student/Teacher)
As a customer,
I want to submit a heat press printing request with apparel type selection, design image, and placement preview,
so that I can apply custom designs to selected clothing using heat press printing.

Acceptance Criteria:
- A Google Form is available for heat press-order submission.
- Form provides apparel type selector: short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo.
- Form allows specifying quantity for each apparel type.
- Form allows file upload for design image.
- Form provides image resizing controls (zoom in/out) before preview.
- Form provides image repositioning controls (drag/position on apparel mock-up) before preview.
- Form displays preview showing design placement on each selected apparel type.
- Customer must confirm preview before submission.
- Form explains that final output may vary due to material/media selection after submission.
- Submission creates a trackable order entry in Google Sheets with order type "Heat Press", apparel selections, and image metadata.
- Order is routed to staff for review and production planning.

Persona Mapping: Student Customer, Teacher Customer

### US-03d: Submit Custom Item Orders with Quote Requests (Student/Teacher)
As a customer,
I want to submit custom item requests with descriptions, quantities, and optional quote requests,
so that I can ask for personalized items beyond standard offerings.

Acceptance Criteria:
- A Google Form is available for custom-item submission.
- Form requests: custom item description (free-form text), quantity, optional quote-request checkbox.
- If quote requested, customer can provide additional notes/specifications.
- Submission creates a trackable order entry in Google Sheets with order type "Custom Item".
- Quote requests are flagged in the sheet for staff manual review and response.
- Staff can respond via order-status updates or direct communication as documented in operations workflow.

Persona Mapping: Student Customer, Teacher Customer

### US-04: Compute Next Pickup Window (Customer)
As a customer,
I want pickup timing aligned to actual store open hours,
so that I know when my order can be collected.

Acceptance Criteria:
- System uses StoreHours sheet configuration to compute next available pickup window.
- Orders placed after close are assigned to the next open day/time window.
- Pickup window is written to the order record.
- Customer-facing status details include the computed pickup window.

Persona Mapping: Student Customer, Teacher Customer

### US-05: Track Order by Order Number and Receipt Code (Customer)
As a customer,
I want to check order readiness using my order number and receipt code,
so that I can confirm pickup timing.

Acceptance Criteria:
- A status endpoint/page accepts order number and receipt code.
- Valid credentials return current status and pickup window.
- Invalid lookup attempts return a safe not-found response without exposing other data.
- Status values shown to customers are limited to Pending, Processing, Ready for Pickup, Picked Up.

Persona Mapping: Student Customer, Teacher Customer

### US-06: Limited Operations View for Members (DECA Member)
As a DECA member,
I want a limited operations view,
so that I can help fulfill orders without accessing sensitive customer data.

Acceptance Criteria:
- Member view exposes only order number, order summary/count, and status.
- Member view is accessible only to active roster users in the school domain.
- Members cannot edit protected admin-only fields.
- Pickup verification workflow uses order number and receipt code confirmation.

Persona Mapping: DECA Member (Operations - Limited View)

### US-07: Full Operations View for Officers/Sponsor (Officer/Sponsor)
As an officer or sponsor,
I want full operations visibility,
so that I can manage fulfillment and exception handling.

Acceptance Criteria:
- Officer/sponsor view includes full order details required for fulfillment.
- Sponsor and officers can update order status values.
- Status updates write UpdatedAt timestamp to the order record.
- Non-authorized users are blocked from full-view actions.

Persona Mapping: DECA Officer, Sponsor/Teacher Admin

### US-08: Sponsor-Managed Club Roster Access (Sponsor)
As a sponsor,
I want to manage active club roster membership,
so that only current DECA students can access operations views.

Acceptance Criteria:
- ClubRoster sheet stores email, role, and active flag.
- Access checks validate school domain and active roster status.
- Sponsor can activate/deactivate members.
- Deactivated users immediately lose operations privileges.

Persona Mapping: Sponsor/Teacher Admin

### US-09: Manage Products and Services Quickly (Officer/Sponsor)
As an officer or sponsor,
I want to add/edit/disable products and services in Google Sheets,
so that the storefront stays current.

Acceptance Criteria:
- Product catalog data comes from structured Google Sheets tabs.
- Inactive products are excluded from storefront products feed.
- Payment link mapping is maintained per SKU.
- Product updates are reflected without code changes.

Persona Mapping: DECA Officer, Sponsor/Teacher Admin

### US-10: Highlight New Products (Customer)
As a customer,
I want newly added items to be clearly highlighted,
so that I can discover new offerings quickly.

Acceptance Criteria:
- New products are marked with a visible "New" indicator.
- A dedicated New Products section exists on the storefront.
- Homepage messaging can call out newly added products.
- Sponsor/officers can control which products are marked new.

Persona Mapping: Student Customer, Teacher Customer, Sponsor/Teacher Admin

### US-11: MVP Analytics for Club Insights (Member/Officer/Sponsor)
As a DECA operations user,
I want basic analytics on usage and product interest,
so that we can improve offerings and operations.

Acceptance Criteria:
- Analytics view tracks web usage summary metrics.
- Product popularity indicators are available.
- Conversion indicators are available at MVP level.
- Access is restricted to approved club users.

Persona Mapping: DECA Member, DECA Officer, Sponsor/Teacher Admin

### US-12: Operate in Fallback Mode with Future API Switch (Officer/Sponsor)
As an officer or sponsor,
I want fallback mode to run now with a future-ready API switch,
so that we can launch immediately and upgrade later without redesign.

Acceptance Criteria:
- Default integration mode is PAYMENT_LINKS.
- Square API mode activates only when token and location are configured.
- Switching mode does not require structural changes to store operations workflow.
- Mode summary endpoint reports current mode and readiness flags.

Persona Mapping: DECA Officer, Sponsor/Teacher Admin

## Post-MVP Placeholder Stories

### PM-01: Square API Catalog and Inventory Synchronization
As an operations admin,
I want real-time product/inventory synchronization from Square API,
so that storefront availability aligns automatically with Square records.

Placeholder Acceptance Criteria:
- API mode reads catalog and inventory from Square endpoints.
- Availability reconciliation jobs are monitored for failures.
- Fallback path remains available for rollback.

Persona Mapping: Sponsor/Teacher Admin, DECA Officer

### PM-02: Enhanced Notifications
As a customer,
I want optional status notifications,
so that I receive updates without manually checking status.

Placeholder Acceptance Criteria:
- Notification preferences can be captured.
- Status transitions can trigger approved notifications.
- Notification logs are auditable.

Persona Mapping: Student Customer, Teacher Customer

### PM-03: Advanced Analytics Segmentation
As a sponsor,
I want trend and segmentation analytics,
so that club decisions are based on richer demand patterns.

Placeholder Acceptance Criteria:
- Analytics includes time-based and category-based trend views.
- Reports can be filtered by defined periods and product groups.
- Access controls remain role-aware.

Persona Mapping: Sponsor/Teacher Admin, DECA Officer

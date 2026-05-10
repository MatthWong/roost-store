# Requirements Document

## Intent Analysis Summary
- User request: Build a school store web experience for DECA using Google Sites theme/colors (purple and gold), with food ordering for in-store pickup, merchandise sales, custom service requests (embroidery, engraving, heat press clothing printing), Square-backed inventory/purchases, restricted club order views, sponsor-managed student access, new product promotion, and customer analytics.
- Request type: New Project
- Scope estimate: System-wide (catalog, checkout flow, order management, role-based access, analytics, integrations)
- Complexity estimate: Moderate to High
- Delivery strategy selected by user: MVP-first

## Product Vision
Create a student- and teacher-friendly school store platform operated by the DECA chapter that supports online discovery and ordering, in-person pickup logistics, transparent order status tracking, controlled operations access for club members, and sustainable admin workflows for frequent product updates.

## Primary Users
- Students (customers)
- Teachers (customers)
- DECA club members (operations users)
- DECA officers (elevated operations users)
- School sponsor/teacher (system owner and approver)

## Confirmed Decisions From Clarifying Answers
- Platform: Google Sites
- Authentication: Google Workspace (school accounts)
- Rollout approach: MVP first
- Primary commerce integration: Square Payment Links (fallback-first architecture)
- Future-ready switch: Square API mode when Personal Access Token and permissions are available
- Order tracking status model: Simple (Pending, Processing, Ready for Pickup, Picked Up)
- Product highlight pattern: New badge + New Products section + homepage banner/carousel
- Analytics dashboard access: Any club member
- Expected scale: Small (50-100 active users)
- Launch timeline: ASAP (1-2 weeks)
- Extension configuration: Security Baseline = Off, Property-Based Testing = Off

## Functional Requirements

### FR-01 Catalog and Navigation
- The website shall present clear, mobile-friendly navigation for:
  - Food items
  - School-branded merchandise (water bottles, earbuds, blankets, t-shirts)
  - Custom order services (embroidery, engraving, heat press printing)
  - New products section
  - Order tracking page
- The website shall use school colors (purple and gold) consistently.

### FR-02 Food Ordering and Pickup
- Customers shall be able to place online orders for food items.
- Food orders shall be configured for in-store pickup only.
- Pickup windows shall map to the next available store-open period.
- Store hours shall be configurable and used to compute pickup availability.
- Some items may be made at pickup; customer messaging shall reflect that pickup can occur anytime during open hours.

### FR-03 Merchandise Ordering
- Customers shall be able to purchase standard merchandise products online.
- Product pages shall include image, price, availability, and pickup details.

### FR-04 Custom Service Orders
Customers shall be able to submit custom order requests for embroidery, engraving, heat press printing, and custom items.

**Engraving Orders:**
- Customer shall provide the item to be engraved (customer-supplied description).
- Customer shall specify quantity for the engraving order.
- Design file upload is optional; text-based engraving instructions may be provided as alternative.

**Embroidery Orders:**
- Customer shall select apparel type(s) from list: short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo.
- Customer shall specify quantity for each selected apparel type.
- Customer shall upload design file (image).
- System shall provide image resizing and repositioning controls before submission.
- System shall provide preview showing design placement on selected apparel type(s).
- Customer shall confirm design placement via preview before final submission.

**Heat Press Printing Orders:**
- Customer shall select apparel type(s) from list: short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo.
- Customer shall specify quantity for each selected apparel type.
- Customer shall upload design file (image).
- System shall provide image resizing and repositioning controls before submission.
- System shall provide preview showing design placement on selected apparel type(s).
- Customer shall confirm design placement via preview before final submission.

**Custom Item Orders:**
- Customer shall provide free-form custom item description.
- Customer shall specify quantity.
- Customer shall have option to request a quote before finalizing order.
- Quote requests shall be routed to staff for manual review and response.

**General Custom Order Requirements:**
- All custom order types shall accept file uploads (images for embroidery/heat press, optional for engraving).
- The system shall support limited preview behavior with a clear disclaimer that final output may vary because material/media may be selected after submission.
- Custom orders shall allow staff-side review before production proceeds.
- All custom order submissions shall create trackable order entries in Google Sheets.

### FR-05 Checkout and Payment
- Checkout shall use Square Payment Links as the default mechanism for all purchasable items.
- Payment state shall be tied to order record status.

### FR-06 Inventory Synchronization
- Primary mode shall support product and payment-link management through Google Sheet tabs used by Google Sites.
- The solution shall include a switchable integration mode that enables Square API product/inventory synchronization when Square credentials and permissions are available.

### FR-07 Order Status Tracking
- Customers shall be able to track order status using order number and purchase confirmation.
- Customer-visible statuses shall be:
  - Pending
  - Processing
  - Ready for Pickup
  - Picked Up

### FR-08 Club Operations Dashboard
- A protected operations view shall allow club users to view placed orders.
- Role-based visibility:
  - Regular member: order number, order count/summary, status only
  - Officer: full order details
  - Sponsor/teacher: full order details and administration capabilities
- Customer pickup verification shall require order number and receipt confirmation.

### FR-09 Access Management
- Sponsor/teacher shall manually manage club-member access.
- Only current students in DECA (plus sponsor) shall be authorized for protected operations views.
- The member allowlist shall be editable by sponsor.

### FR-10 Product and Service Administration
- Product/service management tools shall be simple and fast for frequent updates.
- Admin editing capabilities shall be limited to sponsor/teacher and officers.
- Admin flow shall support adding, editing, enabling/disabling products and services.

### FR-11 New Product Promotion
- The system shall support all three highlight methods:
  - New badge with date window
  - Dedicated New Products section
  - Homepage banner/carousel callout

### FR-12 Analytics Dashboard
- The system shall provide a dashboard for web usage analytics accessible to club members.
- Dashboard shall include:
  - Web traffic and page usage
  - Product popularity
  - Conversion indicators
  - Business metrics (sales trends, peak times, new vs returning behavior where available)

## Non-Functional Requirements

### NFR-01 Usability
- User experience shall be simple for students and teachers.
- Navigation depth should remain minimal and clear from homepage.
- Design shall be responsive for phones and laptops.

### NFR-02 Performance
- Core pages (home, category, product list, order tracking) should load quickly under school network conditions.
- The system shall support small audience usage (50-100 active users) without major degradation.

### NFR-03 Maintainability
- Product updates, pricing updates, and service updates shall be easy for authorized staff.
- Store-open schedule management shall be editable without code-heavy changes.

### NFR-04 Reliability
- Orders must persist reliably with recoverable status after temporary integration issues.
- Inventory and payment state mismatches should be detectable and reconcilable.

### NFR-05 Privacy and Data Handling
- Customer data collected shall include:
  - Required: name, email, student ID number
  - Optional: phone number
- Data exposure in operations views shall be minimized by role.

### NFR-06 Security Posture (Project Decision)
- Security baseline extension was explicitly opted out for this phase.
- Minimum practical controls should still be used in implementation (authenticated access, role checks, least privilege on order views).

## Constraints and Assumptions
- Primary implementation direction uses Google Sites as requested.
- Some advanced workflows (fine-grained auth, dynamic order workflows, robust role-based dashboards) may require companion components outside native Google Sites features (for example: Google Apps Script web app, Google Forms, Google Sheets views, or embedded dashboards).
- MVP-first scope means first release prioritizes core ordering and tracking workflows.
- Sponsor approval for Square API may not be available at launch; therefore the baseline implementation must run without Square API permissions.

## MVP Scope (Approved)
- In scope for MVP:
  - Catalog browsing for food and merchandise
  - Custom order request submission with file upload and limited preview disclaimer
  - Square Payment Links as primary checkout path
  - Google Form + Google Sheet operational workflow
  - Shared status endpoint/page for order readiness by order number + receipt code
  - Prebuilt Square API toggle path ready for future enablement
  - Pickup scheduling based on store open windows
  - Simple customer order tracking statuses
  - Restricted club operations view with defined role visibility
  - New product highlighting methods
  - Basic analytics dashboard accessible to club members
- Deferred to later iterations if timeline risk emerges:
  - Deep automation of custom order pre-press previews
  - Advanced notification workflows
  - Additional analytics segmentation

## Acceptance Criteria (High-Level)
- Students and teachers can browse products/services and place eligible orders.
- Food pickup windows align with configured store-open schedule.
- Customers can check status with order number and receipt confirmation flow.
- Club members can access protected order views according to role visibility rules.
- Sponsor can maintain member access list and product/service catalog updates.
- New products are clearly surfaced in at least three approved channels.
- Analytics dashboard is visible to club members and tracks agreed metrics.
- Purple/gold design theme is consistently applied.

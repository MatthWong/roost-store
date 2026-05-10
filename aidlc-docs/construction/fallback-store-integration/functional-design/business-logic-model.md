# Business Logic Model - Custom Order Workflows

## Unit Scope
This model defines business flow for custom order processing in the fallback-store-integration unit:
- Engraving
- Embroidery
- Heat Press
- Custom Item (quote-required)

## Workflow Overview

### 1. Intake Flow
1. Customer opens hybrid custom order Google Form.
2. Customer selects custom order type.
3. Form routes user to conditional section based on type.
4. Customer provides required fields and optional fields by type.
5. For embroidery/heat press, customer adds one or more apparel line items (type, size, quantity).
6. Customer uploads one design image (PNG/JPG/SVG, max 5MB) when required.
7. Form performs client-side field validation.
8. On submit, Apps Script trigger creates a temporary tracking record.

### 2. Review and Approval Flow
1. New submission enters status Submitted.
2. Sponsor/officer reviews in custom operations queue.
3. Order status moves to Under Review.
4. If quote-driven path applies, status moves to Quote Provided.
5. Customer response acceptance moves order to Quote Accepted.
6. Design and fulfillment review approval moves order to In Production.
7. System assigns permanent order number at approval milestone.
8. System assigns pickup window only when order enters In Production.

### 3. Fulfillment Flow
1. Production updates occur while status is In Production.
2. When complete, status becomes Ready for Pickup.
3. Pickup verification uses order number and receipt confirmation.
4. On pickup completion, status becomes Picked Up.

### 4. Notification Flow
Email notifications are sent on transition into:
- Under Review
- Quote Provided
- Quote Accepted
- In Production
- Ready for Pickup

## Order-Type Specific Logic

### Engraving
- Customer supplies item description and quantity.
- No strict engraving text constraints; manual sponsor/officer review governs exceptions.
- At least one engraving payload required: text or image.

### Embroidery
- Apparel line item model supports repeated combinations:
  - Apparel type: short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo
  - Size: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL
  - Quantity: minimum 1 per line item
- Design image required.
- Placement confirmation required via simplified preview/placement confirmation step.

### Heat Press
- Uses same apparel line item and size model as embroidery.
- Design image required.
- Placement confirmation required.

### Custom Item
- Free-form item description and quantity required.
- Quote is always required before production.
- Payment link generated after quote acceptance.

## Data Persistence Logic

### Primary Record (Orders)
- One row per custom order submission.
- Stores order-level metadata (customer info, order type, status, temporary ID/permanent order number, payment state, pickup window, image metadata references).

### Detail Records (OrderItems)
- One row per apparel type-size-quantity combination.
- Linked to parent order by order_id.
- Supports multi-line apparel orders without widening Orders sheet schema.

### Image Metadata
- Persist in Orders row:
  - file_url (Drive link)
  - file_name
  - uploaded_at

## Key State Machine

### Canonical Status Sequence
Submitted -> Under Review -> Quote Provided -> Quote Accepted -> In Production -> Ready for Pickup -> Picked Up

### Conditional Path Rules
- Non-quote paths can skip quote states operationally while preserving status model compatibility.
- Custom item orders always include quote states.

## ID and Pickup Logic
- On submission: generate temporary tracking ID.
- On sponsor/officer approval: assign permanent order number.
- Pickup window assignment deferred until In Production.

## Duplicate Protection Logic
- On submission, system checks recent order signature (customer + order type + timestamp window).
- If similar record exists in recent window, warn user.
- User may explicitly confirm and continue.

## Error Path Logic
- Unsupported image format/validation failure: reject immediately and show user-facing error.
- Form submission failure: rely on Google Forms autosave and offer fallback email escalation instructions.

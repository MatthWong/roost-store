# Business Rules - Custom Order Workflows

## Rule Set Summary
This document captures authoritative business constraints for custom order processing.

## BR-01 Form Architecture
- A single hybrid form must be used.
- Conditional sections must render by selected custom order type.

## BR-02 Supported Order Types
- Allowed custom order types:
  - Engraving
  - Embroidery
  - Heat Press
  - Custom Item

## BR-03 Apparel Types and Sizes
- Allowed apparel types for embroidery/heat press:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Allowed sizes:
  - XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL

## BR-04 Apparel Line Item Quantities
- Minimum quantity per apparel size line item: 1.
- Minimum total quantity per order: 1.
- No maximum quantity enforced.

## BR-05 Engraving Input Rules
- Engraving item description is free-form and unrestricted.
- No hard text-length or character blacklist enforced at input stage.
- Sponsor/officer manual review is mandatory before fulfillment confirmation.

## BR-06 Image Upload Rules
- Allowed formats: PNG, JPG, SVG.
- Max upload size: 5MB.
- Max image count per order: 1.
- Transparent background is allowed.
- No minimum/maximum resolution or DPI threshold is enforced.
- Unsupported file input must be rejected immediately with customer-facing error.

## BR-07 Placement and Preview Rules
- Interactive in-form JavaScript resizing/repositioning is not supported by native Google Forms.
- Customer must prepare image externally.
- Form must capture placement choice confirmation before submission.
- Simplified preview/confirmation is acceptable for MVP.

## BR-08 Required Field Rules

### Engraving Required Fields
- customer_name
- customer_email
- item_description
- quantity
- at least one of:
  - engraving_text
  - design_image

### Embroidery Required Fields
- customer_name
- customer_email
- at least one apparel line item (type, size, quantity)
- design_image
- placement_choice_confirmation

### Heat Press Required Fields
- customer_name
- customer_email
- at least one apparel line item (type, size, quantity)
- design_image
- placement_choice_confirmation

### Custom Item Required Fields
- customer_name
- customer_email
- item_description
- quantity
- quote_required = true

## BR-09 Status Lifecycle Rules
- Canonical status sequence:
  - Submitted
  - Under Review
  - Quote Provided
  - Quote Accepted
  - In Production
  - Ready for Pickup
  - Picked Up
- Non-quote orders may operationally bypass quote-specific states.
- Custom item orders must pass through quote steps.

## BR-10 Notification Rules
- Email notifications must trigger on entry to:
  - Under Review
  - Quote Provided
  - Quote Accepted
  - In Production
  - Ready for Pickup

## BR-11 Payment Rules
- Food/merchandise use standard upfront payment path.
- Quote-based custom orders use deferred payment path.
- Payment links for custom orders are auto-generated after quote acceptance.

## BR-12 ID and Pickup Rules
- Submission generates temporary tracking ID.
- Permanent order number is generated after sponsor/officer approval.
- Pickup window is not assigned at submission.
- Pickup window must be assigned only when status transitions to In Production.

## BR-13 Operations Visibility Rules
- Custom orders are shown in a dedicated Custom Orders operations tab.
- Tab must include apparel type-size-quantity breakdown.
- Role-based access remains governed by club roster policy.

## BR-14 Duplicate Submission Rules
- System warns on potential duplicate custom order in recent submission window.
- Customer may confirm and proceed.
- Duplicate warning does not hard-block submission.

## BR-15 Failure Handling Rules
- Form submission failure path should preserve customer inputs via Google Forms autosave.
- Fallback path must provide support escalation via email.

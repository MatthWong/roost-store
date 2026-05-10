# Custom Orders Functional Design - Clarifications

## Purpose
Resolve remaining ambiguities from completed answers so functional design artifacts can be generated without assumptions.

---

## Clarification Questions

### CQ1 - Image Manipulation Feasibility Decision
Your answer for Q2.1/Q2.2 was conditional: try in-form JavaScript first, then fallback.

Note: Native Google Forms does not support custom JavaScript controls for image resize/reposition.

[Answer]: A
Confirm primary approach:
- Option A: Use external image editor guidance workflow (upload prepared image, then simplified placement confirmation in form).
- Option B: Use dedicated Apps Script web app preview/manipulation tool, then submit metadata to form/sheet.

### CQ2 - Custom Status Sequence
You selected custom statuses (Q4.1 = B), but exact ordered sequence was not specified.

[Answer]: A
Confirm exact status sequence for custom orders:
- Option A: Submitted -> Under Review -> Quote Provided -> Quote Accepted -> In Production -> Ready for Pickup -> Picked Up
- Option B: Submitted -> Under Review -> In Production -> Ready for Pickup -> Picked Up (quote statuses only when quote requested)
- Option C: Provide custom ordered list

### CQ3 - Notification Trigger Statuses
You selected email notifications (Q4.4 = B), but trigger statuses were not specified.

[Answer]: A
Which status transitions should send email?
- Option A: Under Review, Quote Provided, Quote Accepted, In Production, Ready for Pickup
- Option B: Quote Provided, Ready for Pickup only
- Option C: Provide custom trigger list

### CQ4 - Quantity Minimums
You specified no max quantity (Q5.1), but minimums were not defined.

[Answer]: A
Confirm minimum quantity rules:
- Option A: Minimum 1 per selected size line item and minimum 1 total item per order
- Option B: Minimum 1 total item per order, size-level minimum can be 0
- Option C: Provide custom minimum rules

### CQ5 - Engraving Text Constraints
Q5.3 indicates manual review, but input constraints are still open.

[Answer]: A
Confirm engraving text validation:
- Option A: No strict character constraints; manual review handles exceptions
- Option B: Max 50 characters, basic symbol filtering, manual review
- Option C: Provide custom text constraints

### CQ6 - Pickup Window Rule for Custom Orders
Q6.1 selected temporary ID flow, but pickup window timing rule was not specified.

[Answer]: A
Confirm pickup window calculation rule:
- Option A: Do not assign pickup window at submission; assign only after status moves to In Production
- Option B: Assign estimated pickup window at submission, then update when approved
- Option C: Use fixed SLA by order type (for example engraving 3 days, embroidery 5 days, heat press 4 days)

### CQ7 - Required vs Optional Fields
Q7.4 says "confirm later" for required/optional fields.

[Answer]: A, custom item always requires quote
Confirm required fields for each order type:
- Option A: Use recommended defaults below
  - Engraving required: customer name, email, item description, quantity, engraving text or image (at least one)
  - Embroidery/Heat Press required: customer name, email, at least one apparel type-size-qty line, design image, placement choice
  - Custom Item required: customer name, email, item description, quantity, quote request yes/no
- Option B: Provide custom required/optional matrix

---

## Next Step
After these answers are filled, functional design artifacts will be generated immediately:
- business-logic-model.md
- business-rules.md
- domain-entities.md
- frontend-components.md

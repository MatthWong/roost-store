# Functional Design Plan - Custom Order Workflows

## Unit: fallback-store-integration
## Focus: Engraving, Embroidery, Heat Press, and Custom Item Order Processing

---

## Functional Design Checklist

- [x] Form Structure Design - Capture requirements for each custom order type form layout
- [x] Image Manipulation Approach - Determine how resize/reposition will be implemented
- [x] Data Storage Model - Define sheet structure for apparel selections and image metadata
- [x] Order Routing Logic - Design fulfillment workflow for each order type
- [x] Quote Request Handling - Design quote request processing and response workflow
- [x] Status Tracking - Define status model for custom orders
- [x] Validation Rules - Define business rules and error handling
- [x] API Integration - Map which endpoints handle each custom order type

---

## Clarification Questions

### Section 1: Form Structure and Google Forms Constraints

**Q1.1 - Form Architecture Decision**: Google Forms has limitations with complex multi-field interactions. For custom order intake, you have options:

[Answer]: C
Should we use: 
- **Option A**: Single consolidated Google Form with all custom order types (engraving, embroidery, heat press, custom item) as different sections users navigate through, OR
- **Option B**: Separate Google Forms for each custom order type (4 forms), each optimized for that specific type, OR
- **Option C**: Hybrid approach (e.g., one form for all order types but with conditional sections that show/hide based on order type selection)?

**Q1.2 - Apparel Type and Size Selection in Forms**: For embroidery and heat press, customers must select apparel type(s), then size(s) for each type, then quantity for each size. Google Forms doesn't have native multi-select with cascading size + quantity fields.

[Answer]: Dropdown for single apparel type, then show size checkboxes (S, M, L, XL, 2XL) + quantity field for each size + "add another" to select multiple combinations
How should customers specify apparel types, sizes, and quantities?
- **Option A**: Multiple checkboxes for each apparel type (short-sleeve t-shirt, long-sleeve t-shirt, hoodie, polo). For each checked type, show size checkboxes (S, M, L, XL, 2XL) + quantity field for each size
- **Option B**: Dropdown for single apparel type + size selection (cascading dropdown: select type, then see available sizes), with quantity field + "add another" to select multiple combinations
- **Option C**: Text instructions asking customer to list selections (e.g., "Short-sleeve t-shirt: 2x Small, 1x Large; Hoodie: 1x Medium")
- **Option D**: Link to embedded Google Sheet where customer enters table (Apparel Type | Size | Qty), then pastes selection into form
- **Option E**: Simplified: Allow only single apparel type per order (no multi-type selection), just size + qty per order

**Q1.2a - Available Apparel Sizes**: Which sizes should be available for all apparel types?

[Answer]: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL
- **Option A**: S, M, L, XL, 2XL (standard 5-size range)
- **Option B**: XS, S, M, L, XL, 2XL, 3XL (extended 7-size range)
- **Option C**: Let staff manually specify sizes (form allows free-form size entry)
- **Option D**: Size options differ by apparel type (e.g., hoodies have different size range than polos)

---

**Q1.3 - Image Upload in Forms**: Google Forms supports file uploads. 

[Answer]: What image format(s) and size limits should we enforce?
- Supported formats: PNG, JPG, SVG? (or others?) PNG, JPG, SVG
- Max file size per image? (e.g., 2MB, 5MB, 10MB?) 5MB
- Can customer upload multiple design images for a single order, or just one? single image

---

### Section 2: Image Manipulation and Preview Approach

**Q2.1 - Image Resizing/Repositioning in Forms**: Google Forms doesn't natively support image editing (resize, reposition on apparel mock-up). You specified customers should resize and reposition before preview.

[Answer]: Which approach should we use? Try option E, then B
- **Option A**: Google Forms → Google Apps Script → Open custom web app (HTML/JavaScript) in new tab/window where customer manipulates image (resize, drag on apparel mock-up), then returns data to form
- **Option B**: Accept image upload in Forms, then provide instructions "please resize in image editor before uploading" + guide them to external tool (Canva, Photoshop, etc.)
- **Option C**: Link to a dedicated custom tool/webpage (built separately from Forms) for image manipulation, customer then copies/pastes result back into form
- **Option D**: Store uploaded image as-is in form, staff reviews and communicates sizing requests to customer before production
- **Option E**: Use JavaScript in Google Form (if possible) to provide basic image controls within the form itself?

**Q2.2 - Preview Rendering for Embroidery/Heat Press**: You want customers to confirm design placement via preview before submitting.

[Answer]: How should the preview work? A, if possible, C if javascript not possible
- **Option A**: Web app generates HTML preview (mock apparel image with customer's uploaded image overlaid at resizing/repositioning) + customer confirms before final form submission
- **Option B**: Staff generates preview after form submission, sends to customer via email for confirmation before production
- **Option C**: Simplified preview during form submission (image thumbnail + text showing "Design will be placed on: [apparel type]") + customer confirms
- **Option D**: No preview—customer confirms design location choice in form (via checkbox: "I confirm design placement on..."), staff handles preview after submission

**Q2.3 - Apparel Mock-Up for Preview**: If preview is embedded, what format should the apparel mock-up be? Preview should show each selected apparel type + size combination separately so customer can confirm design placement for each.

[Answer]: B
- **Option A**: Generic apparel outlines (simple rectangle shapes for each apparel type) with customer's image overlay; show one preview per size (e.g., small, medium, large show same design placement)
- **Option B**: Realistic apparel photos (stock images of each apparel type/size combo) with customer's image overlay
- **Option C**: Text-only description (no visual preview) - customer confirms via text instructions listing apparel types/sizes selected
- **Option D**: Link to preview tool (e.g., Canva mock-up or print-on-demand tool) + customer uses that to visualize

---

### Section 3: Data Storage and Metadata

**Q3.1 - Sheet Structure for Apparel Selections**: Current Orders sheet structure stores "order type" but not individual apparel selections with size breakdown or image metadata. With apparel type + size + quantity model:

[Answer]: B
For orders with multiple apparel type/size combinations (e.g., 2x short-sleeve t-shirt Small, 1x hoodie Medium), should we:
- **Option A**: Add columns to Orders sheet for each apparel type + size combo (short_sleeve_small_qty, short_sleeve_medium_qty, ..., hoodie_medium_qty, etc.) + image URL column
- **Option B**: Create separate "OrderItems" sheet with one row per apparel type/size combination in an order (order_id, apparel_type, size, qty) + image URL in Orders sheet
- **Option C**: Store full apparel selections as JSON text in a single "apparel_data" column in Orders sheet (e.g., `{"short_sleeve_tshirt": {"S": 2, "L": 1}, "hoodie": {"M": 1}}`)
- **Option D**: Keep Orders sheet flat and store detailed apparel data only in form response archive (no denormalization to Orders sheet)

**Q3.2 - Image Metadata Storage**: How should we store image information?

[Answer]: A
- **Option A**: Store uploaded file URL in Orders sheet (Google Drive link) + filename + timestamp
- **Option B**: Store Base64-encoded image data directly in the sheet (if file size manageable)
- **Option C**: Store image in Google Drive folder + store folder link only in Orders sheet
- **Option D**: Store image filename only, assume staff downloads from form responses archive

**Q3.3 - Engraving Item Tracking**: For engraving, customer provides item description (free-form text).

[Answer]: 
- Should we add validation/standard list of engraving-eligible items, or accept any free-form text? accept any free-form text
- Example: Should we restrict to known items (water bottle, keychain, trophy) or allow anything? no restriction
- If restriction, how should we handle edge cases or custom items customers request? allow review from sponsor before confirming order

---

### Section 4: Order Routing and Fulfillment Workflow

**Q4.1 - Custom Order Status Model**: Food orders use: Pending, Processing, Ready for Pickup, Picked Up. Should custom orders use the same statuses?

[Answer]: B
- **Option A**: Same status values (Pending, Processing, Ready for Pickup, Picked Up)
- **Option B**: Custom order-specific statuses (Submitted, Under Review, Quote Provided, Quote Accepted, In Production, Ready for Pickup, Picked Up)
- **Option C**: Hybrid (initial status subset for all orders + custom extensions for quote/design phase)
- If custom statuses, please specify the exact status values and their sequence

**Q4.2 - Quote Request Handling**: For custom items, customer can request a quote. 

[Answer]: How should the quote workflow work? A
- **Option A**: Quote-only order (customer submits + staff emails quote + customer responds to confirm + order moves to fulfillment) OR pay-later custom orders?
- **Option B**: Customer inputs estimated budget in form, staff quotes back if similar, otherwise custom quote email exchange
- **Option C**: Staff email address field in form (customer provides email + form has predefined quote response template)
- **Option D**: Quote request flag in sheet → staff manually tracks quote requests in separate system/email
- Should there be a time limit for quote expiration?

**Q4.3 - Design Review and Approval**: For embroidery/heat press with customer's design image, should staff approve the design before production?

[Answer]: B
- **Option A**: Staff automatically approves all designs (customer confirms placement in preview, that's sufficient)
- **Option B**: Staff reviews each design, sends feedback/approval to customer via email before production
- **Option C**: Simple automated check (e.g., image size > threshold triggers "large design—may need adjustment" flag, but staff can override)
- If staff review required, how long should approval typically take?

**Q4.4 - Order Notification for Customers**: Should customers be notified when their custom order status changes?

[Answer]: B
- **Option A**: No notifications (customer checks status manually via order tracking page)
- **Option B**: Email notifications when status changes to key milestones (Accepted/In Production/Ready for Pickup)
- **Option C**: Optional customer notification preference (checkbox in form: "Notify me via email")
- Which statuses should trigger notifications?

---

### Section 5: Validation Rules and Business Logic

**Q5.1 - Quantity Constraints**: Should we enforce minimum/maximum quantities per order?

[Answer]: no max quantity enforced
- For engraving: Min qty, max qty? (e.g., 1-100?)
- For embroidery: Min qty per size, max per size? Min/max per apparel type? Max total items (sum of all sizes/types) per order?
- For heat press: Min qty per size, max per size? Min/max per apparel type? Max total items per order?
- For custom items: Min qty, max qty?

**Q5.2 - Image Requirements**: For embroidery/heat press, are there requirements for image quality, resolution, or format suitability?

[Answer]: 
- Minimum/maximum resolution (e.g., 300x300px minimum)? no minimum or maximum
- Any format restrictions beyond PNG/JPG? allow vector format for embroidery
- Should we reject transparent backgrounds or accept them? accept
- DPI requirements for print quality? no requirement

**Q5.3 - Engraving Text Validation**: If engraving accepts text (not images), any character limits or forbidden characters?

[Answer]:  All engraving orders should be reviewed and approved
- Max characters for engraving text? 
- Forbidden characters or symbols? 
- Font/style choices offered to customers in form, or free-form and staff decides?

**Q5.4 - Price Estimation**: Should the form provide price estimates for custom orders? Consider pricing model with apparel type + size + quantity:

[Answer]: A
- **Option A**: No price shown in form (staff manually quotes after design review)
- **Option B**: Fixed price per order type (e.g., $15 for engraving, $25 for embroidery, $30 for heat press) regardless of apparel type/size/qty
- **Option C**: Price per apparel type/size combo (e.g., small $3, medium $3, large $4, XL $5 for each apparel type) + base fee
- **Option D**: Tiered pricing based on total quantity across all sizes/types (e.g., 1-5 items: $5/item, 6-10: $4/item, 11+: $3/item)
- **Option E**: Hybrid - base fee per apparel type + per-item cost based on size
- Should estimate be shown before or after design submission?

---

### Section 6: Integration with Existing Workflows

**Q6.1 - OrderWorkflow.gs Integration**: When a custom order form is submitted, OrderWorkflow.gs.onFormSubmit() handler will process it.

[Answer]: C
For custom orders, should the handler:
- **Option A**: Auto-generate order number and receipt code immediately (same as food/merchandise)
- **Option B**: Defer order number until staff reviews design (if required)
- **Option C**: Generate temporary tracking ID, convert to permanent order number after staff approval
- Should default pickup window calculation be same as food orders, or custom timeframe for each order type?

**Q6.2 - Operations View for Custom Orders**: In the operations dashboard (Member/Officer/Sponsor views), should custom orders appear with apparel type/size/qty breakdown?

[Answer]: C
- **Option A**: Yes, all custom orders visible to all roles (like food orders); show summary of apparel selections (e.g., "2x Short-sleeve t-shirt S, 1x Hoodie M")
- **Option B**: Only show custom orders to officers/sponsor (not regular members); detailed view shows full apparel breakdown
- **Option C**: Create separate "Custom Orders" tab in operations view (distinct from food/merchandise orders); show apparel breakdown
- **Option D**: Hide customer personal data for custom orders differently than food orders?

**Q6.3 - Payment for Custom Orders**: How should payment work?

[Answer]: D
- **Option A**: Payment required upfront (before order accepted/submitted) via Square Payment Link
- **Option B**: Payment only after quote acceptance (for quote-request orders)
- **Option C**: Different payment model: deposit upfront ($X), balance due at pickup
- **Option D**: Quote-based custom orders deferred payment, food/merchandise orders require upfront payment
- Should payment links be auto-generated for custom orders, or manually created per order? auto-generated

---

### Section 7: Error Handling and Edge Cases

**Q7.1 - Form Submission Errors**: If form submission fails (e.g., network error, file upload timeout):

[Answer]:
- Should customer see error message and retry, or should form auto-save progress? auto-save
- If auto-save, how long should form recovery data persist? indefinitely
- Any fallback (e.g., customer emails form data if form fails)? yes, customer can e-mail if form fails

**Q7.2 - Image File Corruption/Unsupported Format**: If customer uploads unsupported file:

[Answer]: 
- Should form reject immediately with error, or should Apps Script validate and notify later? reject immediately with error
- Should staff be notified of invalid uploads, or just customer? just customer

**Q7.3 - Duplicate Order Detection**: Should system prevent duplicate custom order submissions (same customer, same order type, within short timeframe)?

[Answer]: C
- **Option A**: No prevention—allow duplicates, staff handles manually
- **Option B**: Prevent duplicates within 5 minutes (likely accidental resubmission)
- **Option C**: Warn customer "similar order submitted recently" but allow if customer confirms

**Q7.4 - Incomplete Form Submission**: Google Forms typically requires all fields. For optional fields (e.g., engraving text alternative to image):

[Answer]:
- Should image upload be optional (customer can submit text description instead)? yes
- Should apparel type be mandatory, or optional (with free-form description fallback)? optional with free-form fallback
- Which fields are truly required vs optional? confirm later

---

## Completion Check

When all [Answer]: tags are filled:

✓ Form structure decisions finalized  
✓ Image manipulation approach chosen  
✓ Data storage model defined  
✓ Order routing and status model confirmed  
✓ Quote handling workflow specified  
✓ Validation rules established  
✓ Integration points clarified  
✓ Error handling approach decided  

---

**Next Step**: Please provide answers to all questions above. Ensure each [Answer]: has a clear selection or response. If any answer is unclear, we'll clarify before generating functional design artifacts.

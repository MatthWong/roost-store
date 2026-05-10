# Frontend Components - Custom Order Workflows

## Scope
Frontend components cover Google Form structure, supporting guidance UI, and status-facing pages for custom orders.

## Component Hierarchy
- CustomOrderEntryPage
  - OrderTypeSelector
  - CustomerInfoSection
  - EngravingSection
  - EmbroiderySection
    - ApparelLineItemRepeater
      - ApparelTypeSelect
      - ApparelSizeSelect
      - QuantityInput
  - HeatPressSection
    - ApparelLineItemRepeater
  - CustomItemSection
  - ImageUploadSection
  - PlacementConfirmationSection
  - QuoteSection
  - ValidationSummary
  - SubmitAction
- CustomOrderStatusPage
  - OrderLookupForm
  - OrderStatusTimeline
  - NotificationHint

## Component Definitions

### CustomOrderEntryPage
- Responsibility: Orchestrates conditional rendering for selected order type.
- Inputs: None.
- Outputs: Form submission payload.

### OrderTypeSelector
- Responsibility: Select one of Engraving, Embroidery, Heat Press, Custom Item.
- Validation: Required.
- State: selectedOrderType.

### CustomerInfoSection
- Fields:
  - customer_name (required)
  - customer_email (required)
  - customer_phone (optional)

### EngravingSection
- Fields:
  - item_description (required)
  - quantity (required, min 1)
  - engraving_text (optional if image present)
- Validation:
  - engraving_text OR image_file is required.

### EmbroiderySection
- Fields:
  - apparel line items repeater (required at least one)
- Validation:
  - each line requires apparel_type, apparel_size, quantity >= 1.

### HeatPressSection
- Same line-item model and validations as EmbroiderySection.

### ApparelLineItemRepeater
- Behavior:
  - Add/remove line item rows.
  - Each row is one type-size-quantity tuple.
- Allowed apparel_type values:
  - short-sleeve t-shirt
  - long-sleeve t-shirt
  - hoodie
  - polo
- Allowed size values:
  - XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL

### CustomItemSection
- Fields:
  - item_description (required)
  - quantity (required, min 1)
  - quote_required (required, forced true)

### ImageUploadSection
- Accepts one file.
- Allowed formats: PNG, JPG, SVG.
- Max file size: 5MB.
- UX copy includes external image preparation guidance.

### PlacementConfirmationSection
- Captures user-confirmed placement instruction (required for embroidery/heat press).
- Simplified preview model:
  - image thumbnail
  - placement selection text
  - acknowledgement checkbox

### QuoteSection
- Shown for quote-relevant paths.
- Shows quote-process expectation copy.
- No live price estimate shown in form.

### ValidationSummary
- Aggregates all validation failures and displays actionable messages.

### SubmitAction
- Handles final submit.
- Duplicate warning flow:
  - show warning for likely duplicate
  - allow explicit user confirmation to continue

## State Model (Conceptual)
- selectedOrderType: string
- customerInfo: object
- engravingData: object
- apparelItems: array of {apparelType, size, quantity}
- imageMeta: {name, type, size, url}
- placementChoice: string
- quoteRequired: boolean
- validationErrors: array

## Interaction Flows

### Flow A: Embroidery/Heat Press
1. Select order type.
2. Enter customer info.
3. Add one or more apparel line items.
4. Upload design image.
5. Confirm placement (simplified preview).
6. Submit.
7. Receive temporary tracking ID.

### Flow B: Engraving
1. Select engraving.
2. Enter customer info.
3. Enter item description and quantity.
4. Provide engraving text and/or image.
5. Submit and receive temporary tracking ID.

### Flow C: Custom Item
1. Select custom item.
2. Enter customer info.
3. Enter item description and quantity.
4. Quote required is always true.
5. Submit and receive temporary tracking ID.

## API/Backend Integration Points
- Form submit trigger:
  - OrderWorkflow.onFormSubmit
- Order create/update data access:
  - OrderDataService.addOrder
  - OrderDataService.addOrderItem
  - OrderDataService.updateOrderStatus
- Status page lookup endpoint:
  - WebApp.doGet?action=status

## Error and Recovery UX
- Invalid file format/size: immediate blocking error.
- Submission/network issues: rely on Google Forms autosave and show fallback support email instructions.

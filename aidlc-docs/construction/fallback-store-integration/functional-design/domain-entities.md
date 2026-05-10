# Domain Entities - Custom Order Workflows

## Entity Diagram (Text)
- CustomOrder (1) -> (many) OrderItem
- CustomOrder (1) -> (many) StatusEvent
- CustomOrder (0..many) -> NotificationEvent
- CustomOrder (0..1) -> PaymentRequest

## Entity: CustomOrder
Represents one customer custom-order request.

### Fields
- order_id: string (temporary tracking ID at submission)
- permanent_order_number: string | null
- order_type: enum(Engraving, Embroidery, HeatPress, CustomItem)
- customer_name: string
- customer_email: string
- customer_phone: string | null
- item_description: string | null
- engraving_text: string | null
- quote_required: boolean
- quote_amount: number | null
- quote_expiration_at: datetime | null
- status: enum(Submitted, UnderReview, QuoteProvided, QuoteAccepted, InProduction, ReadyForPickup, PickedUp)
- pickup_window_start: datetime | null
- pickup_window_end: datetime | null
- image_file_url: string | null
- image_file_name: string | null
- image_uploaded_at: datetime | null
- placement_choice: string | null
- notify_by_email: boolean
- created_at: datetime
- updated_at: datetime

### Validation
- Must contain customer_name and customer_email.
- Must contain one of allowed order_type values.
- CustomItem must have quote_required=true.
- Engraving must have at least one of engraving_text or image_file_url.

## Entity: OrderItem
Represents one apparel type-size-quantity line item for embroidery/heat press.

### Fields
- order_item_id: string
- order_id: string (FK -> CustomOrder.order_id)
- apparel_type: enum(ShortSleeveTShirt, LongSleeveTShirt, Hoodie, Polo)
- apparel_size: enum(XS, S, M, L, XL, XXL, XXXL, XXXXL, XXXXXL)
- quantity: integer
- created_at: datetime

### Validation
- quantity >= 1
- apparel_type required for embroidery/heat press
- apparel_size required for embroidery/heat press

## Entity: StatusEvent
Tracks lifecycle transitions for auditing and notifications.

### Fields
- status_event_id: string
- order_id: string (FK)
- from_status: string | null
- to_status: string
- changed_by: string
- changed_at: datetime
- note: string | null

### Validation
- to_status must be valid status value.
- changed_at required.

## Entity: NotificationEvent
Tracks outbound customer notifications.

### Fields
- notification_id: string
- order_id: string (FK)
- trigger_status: string
- channel: enum(Email)
- recipient: string
- sent_at: datetime
- delivery_state: enum(Sent, Failed)
- error_message: string | null

### Validation
- trigger_status must be one of configured notification statuses.
- recipient must be valid email.

## Entity: PaymentRequest
Represents deferred payment link generation for custom orders.

### Fields
- payment_request_id: string
- order_id: string (FK)
- payment_mode: enum(DeferredQuoteBased)
- payment_link_url: string
- amount: number
- generated_at: datetime
- paid_at: datetime | null
- payment_state: enum(Pending, Paid, Expired, Cancelled)

### Validation
- created only after QuoteAccepted for quote-based custom orders.

## Aggregates and Ownership
- Aggregate root: CustomOrder.
- OrderItem, StatusEvent, NotificationEvent, PaymentRequest are child entities linked by order_id.

## Persistence Mapping

### Orders Sheet (CustomOrder)
- One row per order.
- Contains order-level and image metadata fields.

### OrderItems Sheet (OrderItem)
- One row per apparel type-size-qty line item.

### Optional Event Sheets
- StatusEvents sheet for audit timeline.
- Notifications sheet for delivery tracking.
- PaymentRequests sheet for payment-link lifecycle.

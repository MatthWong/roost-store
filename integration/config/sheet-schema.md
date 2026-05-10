# Google Sheet Schema

Use one spreadsheet with these tabs and headers in row 1.

## Orders
- Timestamp
- CustomerName
- CustomerEmail
- StudentID
- PhoneOptional
- OrderType
- ItemSummary
- TotalAmount
- SquareReference
- OrderNumber
- TemporaryOrderID
- PermanentOrderNumber
- ReceiptCode
- Status
- QuoteRequired
- PaymentLink
- PickupWindow
- DuplicateWarning
- ImageFileURL
- ImageFileName
- ImageUploadedAt
- UpdatedAt

Notes:
- Custom-order lifecycle statuses: Submitted, Under Review, Quote Provided, Quote Accepted, In Production, Ready for Pickup, Picked Up.
- `OrderNumber` may start as temporary ID (`TMP-...`) and later be replaced with permanent ID (`RS-...`) at production approval.

## Products
- ProductID
- SKU
- Name
- Description
- PriceCents
- IsFood
- IsNew
- PaymentLink
- InventoryCount
- IsActive

## PaymentLinks
- SKU
- PaymentLink

## OrderItems
- OrderItemID
- OrderNumber
- ApparelType
- ApparelSize
- Quantity
- CreatedAt

## StoreHours
- DayOfWeek
- OpenTime
- CloseTime
- IsOpen

Notes:
- DayOfWeek uses JavaScript format: 0=Sunday, 1=Monday, ..., 6=Saturday.
- OpenTime/CloseTime use 24-hour HH:mm format.

## ClubRoster
- Email
- Role
- IsActive

Role recommendations:
- MEMBER
- OFFICER
- SPONSOR

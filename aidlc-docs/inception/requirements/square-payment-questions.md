# Square Dynamic Payment — Clarifying Questions

Please answer each question below by filling in the letter after `[Answer]:`.

---

## Question 1
How should the Square payment link be generated?

A) One payment link for the **entire cart** — a single Square Checkout session with all items as line items (customer pays one total)
B) One payment link **per product** — each unique product gets its own Square Payment Link created via API
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
When should the Square payment link be created?

A) **At order submission** — created server-side inside `submitCartOrder()` before the confirmation email is sent (customer gets a ready-to-pay link immediately)
B) **On demand** — created when an ops user manually triggers it from the dashboard (useful if you want to review before charging)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
What should happen to the existing `PAYMENT_LINKS` (static sheet) mode?

A) **Keep as fallback** — if `INTEGRATION_MODE` is `PAYMENT_LINKS`, use static links from the sheet; if `SQUARE_API`, generate dynamically
B) **Replace entirely** — dynamic generation is always used; remove the fallback sheet lookup for cart orders
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
What customer information should be pre-filled in the Square Checkout?

A) **Email only** — pre-fill the customer's school email on the Square payment page
B) **Name + Email** — pre-fill both
C) **Nothing** — let the customer fill in their details on Square's side
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
Where should the generated Square payment link be stored/shown?

A) **Stored in the Orders sheet** (in the `PaymentLink` column) AND displayed in the confirmation email and success screen
B) **Displayed only** — shown in the confirmation email and success screen, not stored in the sheet
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
What should happen if the Square API call fails at checkout time (network error, invalid token, etc.)?

A) **Fail the order** — surface an error to the customer; do not create the order row
B) **Degrade gracefully** — create the order row anyway, skip the Square link, notify customer to contact the store for payment
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
Do you want the Square Checkout to include an **order reference / note** visible to the store on Square's dashboard?

A) Yes — include the order number (e.g. `RS-20260514-0001`) as a note/reference in the Square payment
B) No — keep it minimal, no extra metadata
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
Which Square API environment should be used?

A) **Production** (`connect.squareup.com`) — live payments
B) **Sandbox** (`connect.squareupsandbox.com`) — test environment; configurable via a new Script Property
C) Other (please describe after [Answer]: tag below)

[Answer]: B

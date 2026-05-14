# Shopping Cart — Requirements Clarification Questions

Please answer each question by filling in the `[Answer]:` tag.

---

## Question 1
Where should the shopping cart be hosted / rendered?

A) Embedded in Google Sites as an Apps Script HtmlService page (same pattern as the status checker and ops dashboard — no separate hosting needed)
B) A standalone web page hosted elsewhere (e.g., GitHub Pages, Netlify)
C) Directly inside Google Sites using native Google Sites components only (no embed)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Which products should be available to add to the cart?

A) Standard fixed-price products from the Products sheet only (food, merch)
B) Custom order types only (engraving, embroidery, heat press)
C) Both standard products AND custom orders in the same cart
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
How should checkout / payment work from the cart?

A) Cart creates the order record, then shows the customer a Square payment link to complete payment (one link per item or one combined link)
B) Cart creates the order record only — payment is handled separately by the ops team after review (suitable for custom orders / quote flow)
C) Different per product type: standard products get a Square payment link immediately; custom orders go through the quote flow
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 4
Should a customer be able to add multiple different products in a single cart session?

A) Yes — full multi-item cart (e.g., 1 keychain + 2 t-shirts in one order)
B) No — one product type per order (customer checks out separately for each product)
C) Yes for standard products, but custom orders must always be a separate order
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
What customer information should be collected at checkout?

A) Same fields as the existing Google Form (Full Name, School Email, Order Type, item details)
B) Minimal — just name and email, with item details implied by what's in the cart
C) Use Google Form as-is — the cart just pre-fills the form before submission
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
Should the cart persist if the customer closes the browser tab?

A) Yes — save cart in browser localStorage so it survives tab closes and refreshes
B) No — session only, cart clears when the tab is closed (simpler implementation)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
Should customers be able to adjust quantity of items in the cart?

A) Yes — quantity selector per line item (e.g., 3× Laser Keychain)
B) No — one unit per line item, customer adds the same item again to get more
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
How should the cart integrate with the existing order tracking system?

A) Cart submission calls the same Apps Script backend that the Google Form trigger uses — creates a row in the Orders sheet with an OrderNumber + ReceiptCode, then sends the confirmation email
B) Cart submission writes to the Orders sheet directly via a new Apps Script endpoint, but does NOT send the Google Form confirmation email (ops team is notified separately)
C) Cart creates a pending record; ops team manually approves before it becomes a full order
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
Should the cart display product images?

A) Yes — load images from a URL stored in the Products sheet (add an ImageUrl column)
B) No — text only (name, description, price)
C) Optional — show image only if an ImageUrl is provided, otherwise show a placeholder
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 10
Should there be any inventory / stock limit enforcement in the cart?

A) Yes — use the InventoryCount column in the Products sheet; prevent adding to cart if stock is 0
B) No — allow any quantity regardless of InventoryCount (ops team manages stock manually)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Security Extensions
Should security extension rules be enforced for this feature?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this feature?

A) Yes — enforce all PBT rules as blocking constraints
B) Partial — enforce PBT rules only for pure functions and data transformations
C) No — skip all PBT rules
X) Other (please describe after [Answer]: tag below)

[Answer]: C

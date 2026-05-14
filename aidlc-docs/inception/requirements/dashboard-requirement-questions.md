# Ops Order Dashboard — Requirement Questions

Please answer each question below by filling in the `[Answer]:` tag with the letter of your choice (e.g. `[Answer]: A`).
Add any extra notes after your letter if needed.

---

## Question 1
Where should the dashboard be accessed from?

A) A new `action=dashboard` page served by the same Apps Script web app (same deployment URL, ops-only)
B) A separate Google Sites page that embeds the dashboard via the web app URL
C) Both — a standalone URL and an embeddable version
X) Other (please describe after [Answer]: tag below)

[Answer]: B: Can you make a Google Sites page that is only accessible by members to view, but only officers and sponsors can take action?

---

## Question 2
Which order queues should the dashboard show? (Select all that apply — list the letters)

A) Needs Review — orders in `Submitted` status waiting for an ops member to start review
B) Awaiting Customer Response — orders in `Quote Provided` status waiting for the customer to accept
C) Ready for Pickup — orders in `Ready for Pickup` status waiting for the customer to collect
D) In Production — orders currently being worked on
E) All of the above
X) Other (please describe after [Answer]: tag below)

[Answer]: E

---

## Question 3
What actions should ops members be able to take directly from the dashboard?

A) View-only — just see the queue, take action manually in the sheet
B) One-click status advance — a button to move the order to the next logical status
C) Full status dropdown — choose any valid next status from a dropdown
D) View-only now, with actions added later
X) Other (please describe after [Answer]: tag below)

[Answer]: Officers and sponsor should have full status drop down and ops members should only have view access

---

## Question 4
What order information should be shown in each queue card/row?

A) Minimal — Order Number, Order Type, Customer Name, current Status, timestamp
B) Standard — everything in A plus Item Summary, Pickup Window, Duplicate Warning flag
C) Full detail — everything in B plus image thumbnail link and line items
X) Other (please describe after [Answer]: tag below)

[Answer]: B: hover or click for more details

---

## Question 5
How should the dashboard handle authorization?

A) Reuse the existing ClubRoster + ALLOWED_SCHOOL_DOMAIN check (same as `debug-status` and `mode` endpoints)
B) Add a separate ops-only password/PIN stored in Script Properties
C) Google account login only (no ClubRoster check) — anyone on the school domain
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
Should the dashboard auto-refresh, or require a manual reload?

A) Manual reload only (simplest)
B) Auto-refresh every 60 seconds
C) Auto-refresh with a configurable interval (set via Script Properties)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
What should the visual style be?

A) Match the existing StatusChecker purple-and-gold school color scheme
B) A distinct ops/admin look (e.g. dark sidebar, neutral tones) to visually distinguish from the customer-facing page
C) Plain, functional — no styling needed
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 8 — Security Extension
Should security extension rules be enforced for this feature?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for ops-facing tools)
B) No — skip security rules (suitable for internal PoC/prototype)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

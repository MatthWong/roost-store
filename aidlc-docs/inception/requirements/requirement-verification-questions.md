# Requirements Verification Questions

Please answer the following questions to clarify and complete the requirements for the Roost Store website.

---

## Question 1: Technology Stack & Platform
What technology platform would you prefer for building this website?

A) Google Sites (static site builder, limited customization)
B) Google no-code platform (visual development)
C) Traditional web stack (Next.js/React frontend, Node.js backend)
D) Headless CMS with ecommerce integration (Shopify, WooCommerce with custom frontend)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: User Authentication
How should students and club members authenticate to access restricted features (order tracking, club member view)?

A) Username and password authentication
B) Google Workspace (school Google accounts)
C) School district SSO (if available)
D) Email verification code (passwordless)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3: MVP Scope vs Full Feature Set
Which approach would you prefer?

A) MVP first - focus on core features (browsable catalog, food ordering, pickup, basic order tracking)
B) Phased approach - core features first, then custom orders, then analytics
C) Full feature set - all features implemented from day one
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: Custom Order Workflow
For custom orders (embroidery, engraving, heat press printing), how should the workflow work?

A) Customers submit order via form with details, admin reviews and approves/rejects, customer is notified with price quote
B) Simplified - customers fill out details, automatic order confirmation with estimated timeline
C) Advanced - customers upload designs, see preview, approve before manufacturing
D) Other (please describe after [Answer]: tag below)

[Answer]: D: Customers can upload their designs and have a limited preview, but printing medium is ordered after submission, so final design is not always available during order process.

---

## Question 5: Order Status Tracking
What level of detail should customers see for order status?

A) Simple (Pending, Processing, Ready for Pickup, Picked Up)
B) Detailed (Pending, Payment Confirmed, Manufacturing, Quality Check, Ready for Pickup, Picked Up)
C) Real-time with notifications (status updates via email/text, estimated ready time updated dynamically)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6: Food Item Pickup
For food item orders placed online and picked up in-store:

A) Order same-day for pickup at specific time window (e.g., today 2-4 PM)
B) Order in advance for future pickup dates (e.g., order today for pickup tomorrow or later)
C) Both options
D) Other (please describe after [Answer]: tag below)

[Answer]: D: School Store has varying hours per week, so pickup should be the next time the school store is open.  For example, school store may only be open M, W, F 8:30am - 12pm.  If order is placed on Monday afternoon, pickup should be Wednesday between 8:30am - 12pm.  Some items will be prepared at pick, so the customer can arrive during any open hours.

---

## Question 7: Club Member Access
For the club member view of all placed orders:

A) Dashboard showing all orders with customer info (name, item count, status, pickup time)
B) View only order count and statuses, no customer details
C) Different access levels (sponsor/teacher can see everything, regular members see limited info)
D) Other (please describe after [Answer]: tag below)

[Answer]: D:  Different access levels (sponsor/teacher can see everything, regular members see limited info).  Regular members should see Order Number, Order Count, Statuses.  Customer needs to confirm the order number and show receipt for proof of purchase.  Officers and sponsor/teacher can see everything.

---

## Question 8: Club Member Management
How should club members be added to the "restricted access" list?

A) Admin manually approves/manages student list through dashboard
B) Students request access and teacher approves
C) Automatic - any student can request access and is auto-approved by the system
D) CSV/bulk upload from school roster
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9: New Product Highlighting
How should new products be highlighted on the website?

A) "New" badge with date (automatically removes after X days)
B) Dedicated "New Products" section that admin manually manages
C) Banner or carousel at top of homepage
D) All of the above
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 10: Product/Service Management Ease
Who should be able to add/update products and services?

A) Sponsor/teacher only (upload via form or file)
B) Multiple authorized club members (some students + teacher)
C) Teacher only
D) Simplified admin panel with drag-and-drop, image upload, pricing
E) Other (please describe after [Answer]: tag below)

[Answer]: D, it should only be available to sponsor/teacher and officers

---

## Question 11: Analytics Dashboard
Who should have access to the analytics dashboard?

A) Sponsor/teacher only
B) Designated club officers (president, secretary, etc.)
C) Any club member
D) Restricted to teacher only with specific metrics
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 12: Analytics Metrics
Which analytics would be most valuable to track?

A) Basic (page views, visitors, top products, conversion rate)
B) Detailed (user journey, time on page, device/browser, traffic sources, product performance)
C) Business metrics (revenue by product, popular items, peak shopping times, new vs returning customers)
D) All of the above
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 13: Square Integration
How should Square integration work?

A) Square payment processing only (payments handled at checkout)
B) Full inventory sync (products in Square = products on website)
C) Both payment processing and inventory management
D) Consider different integration (e.g., Square for payments only, separate inventory system)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 14: Data Privacy & Student Information
What student data needs to be stored?

A) Minimal (name, email for order pickup)
B) Standard (name, email, phone number)
C) Full (name, email, phone, grade level, dietary preferences)
D) Other (please describe after [Answer]: tag below)

[Answer]: D: name, email, ID number, phone number optional

---

## Question 15: Performance & Scale
How many students/teachers do you expect to use this system?

A) Small (< 500 students actively using)
B) Medium (500-1500 students)
C) Large (1500+ students)
D) Unsure/flexible
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 16: Timeline & Launch
What's your timeline for launching this website?

A) ASAP (next 1-2 weeks)
B) Next 1 month
C) Next 1-3 months
D) No specific deadline, build incrementally
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Extension Opt-In Question 1: Security Baseline
This project involves student data, authentication, and financial transactions through Square. Should comprehensive security standards be enforced?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications handling student data)
B) No — skip all SECURITY rules (suitable for PoCs or prototypes)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Extension Opt-In Question 2: Property-Based Testing
This project has business logic around orders, inventory, pricing, and custom order workflows. Should property-based testing be enforced to ensure logical correctness?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic and data transformations)
B) Partial — enforce PBT rules only for critical business logic (orders, pricing, inventory)
C) No — skip all PBT rules (suitable for simpler applications)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

**Please fill in all [Answer]: fields above and let me know when complete.**

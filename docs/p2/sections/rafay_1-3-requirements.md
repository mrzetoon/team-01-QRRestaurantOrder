# P2 sections owned by Rafay Alvi (@MuhammadAlvi03)

> Commit this file from your own GitHub account on branch `p2/requirements` and open a pull request; another member reviews it.

## 1 Introduction



### 1.1 Purpose of this document and of the system

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>This document is version 1.0 of the requirements and design baseline for the QR Code Restaurant Menu &amp; Ordering System (QRMOS). It grows the P1 baseline (version 0.1) under change control: sections 1 to 3 are carried forward with requirement IDs preserved, and sections 4 to 9 add use-case analysis, analysis models and the high-level design that P3 will implement. It follows ISO/IEC/IEEE 29148 [R1] and is written for the team, the CS 3354 instructor, and the restaurant manager deciding whether to adopt the system.</p>
<p>QRMOS addresses the wait and the errors in ordering at a sit-down restaurant. A diner currently waits for a server to bring a menu, waits again to place the order, and depends on the server copying it correctly onto a ticket for the kitchen; at busy times this is where most delay and wrong orders come from. Printed menus also cannot show that an item has sold out or that a price has changed. QRMOS lets a diner scan a QR code on the table, read the current menu on their own phone, customize items, send the order straight to the staff tagged with the table number, and pay the bill through a payment gateway. Staff see orders arrive in real time and update their status; the manager keeps the menu current.</p></td>
</tr>
</tbody>
</table>

### 1.2 Scope

| **In scope — we will build this**                                                      | **Out of scope — we will not, and why**                                                                                                                     |
|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A unique QR code per table that opens the menu for that table                          | Storing or processing card numbers ourselves — card entry happens only on the payment gateway's hosted page, which keeps card data out of our system \[R5\] |
| Digital menu by category with description, price, photo and availability               | Integration with the restaurant's POS or accounting system — vendor APIs differ and need credentials we cannot get                                          |
| Item customization (options, quantity, special note) and a cart                        | Takeout, delivery and table reservations — off-premises ordering is a different problem with different actors                                               |
| Order submission tagged with the table number, plus order status for the diner         | Customer accounts, loyalty points and reviews — not needed to order, and they add personal data we would have to protect                                    |
| Live staff order queue with status updates (Received → Preparing → Ready → Served)     | Native iOS/Android apps — a mobile web page needs no install, which is the point of scanning a code                                                         |
| Menu management, sold-out flags, table setup, and staff login with Manager/Staff roles | Multi-restaurant (franchise) management, inventory tracking and sales analytics                                                                             |
| Paying the table's bill online through an external payment gateway (hosted checkout)   | Splitting a bill between diners, tips and refunds — staff handle these at the till as today                                                                 |

|                                                                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Why the exclusions were excluded:** each excluded item either brings legal or security obligations (storing card data, customer accounts) or depends on systems we do not control (POS), so including it would put the MUST requirements at risk inside one semester. None of them is needed for the core value: a diner can order from the table and the kitchen receives it correctly. |

### 1.3 Definitions, acronyms and abbreviations

| **Term or abbreviation** | **Meaning as used in this project**                                                                                                                                            |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| QRMOS                    | QR Code Restaurant Menu & Ordering System — the system specified here.                                                                                                         |
| QR code                  | Quick Response code: a 2-D barcode \[R4\] printed on a table card that a phone camera turns into a web link (URL).                                                             |
| QR-nn                    | **Not** a QR code: the identifier of a Quality Requirement in section 3.2 (template convention). Recorded here because the two meanings collide in this project.               |
| Table session            | The period from a diner opening a table's link until they close it or it expires; all orders in it carry that table number.                                                    |
| Order                    | One submission of a cart from one table, with its own order number. All orders of a table session are grouped on one table check (CR-11, interview \[R9\]).                    |
| Order status             | Where an order is in its life: Awaiting confirmation (until a server confirms it, CR-13), Received, Preparing, Ready, Served, or Cancelled.                                    |
| Modifier / option        | A choice attached to a menu item, e.g. size, spice level, add extra cheese (+\$1.00).                                                                                          |
| Sold out                 | An item that is shown on the menu but cannot be ordered right now. Different from **removed**, which means the item no longer appears at all.                                  |
| Staff / Manager          | Staff = server or kitchen employee who processes orders. Manager = owner or shift lead who can also edit the menu, tables and accounts.                                        |
| Real time                | In this document: visible on the other screen within 3 seconds without a page reload (QR-01).                                                                                  |
| POS                      | Point of sale: the restaurant's existing till / card terminal. Outside QRMOS.                                                                                                  |
| Payment gateway          | An outside service (e.g. Stripe, Square) that shows its own card-entry page, charges the card and tells QRMOS approved or declined. A supporting actor in UC-07.               |
| «include» / «extend»     | Use case links: «include» = a step the base use case always uses (Log In, Browse Menu); «extend» = optional behaviour added only in some cases (Customize Item, Cancel Order). |
| FR, CON, UC, MoSCoW      | Functional requirement; constraint requirement; use case; priority scale MUST / SHOULD / COULD / WON'T.                                                                        |
| Analysis object          | An object found while analysing a use case (e.g. TableMenu, OrderBook). Named after the problem, never after a technology (section 5).                                         |
| TUCBW / TUCEW / TUCCW    | This use case begins with / ends with / continues with — where an expanded use case starts, stops, or hands over.                                                              |
| QAS                      | Quality-attribute scenario: stimulus, environment, response and a measurable response measure (section 6.1).                                                                   |
| ADR                      | Architecture decision record: one decision, the alternatives, and what it costs us (section 7).                                                                                |
| Spike                    | A small, time-boxed program built only to answer one design question with a measurement (section 8).                                                                           |
| Trust boundary           | A line in the deployment view where data passes between zones we trust differently (section 6.4).                                                                              |

### 1.4 References

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>[R1] ISO/IEC/IEEE 29148:2018, Systems and software engineering — Life cycle processes — Requirements engineering.</p>
<p>[R2] CS 3354 Fall 2026 syllabus, P1 template and P2 project description; course textbook Chapters 4–8.</p>
<p>[R3] W3C, Web Content Accessibility Guidelines (WCAG) 2.1, Level AA.</p>
<p>[R4] ISO/IEC 18004:2015, QR Code bar code symbology specification.</p>
<p>[R5] PCI Security Standards Council, PCI DSS v4.0 (cited to justify keeping card entry on the gateway's page, CON-02).</p>
<p>[R6] Team brainstorm notes, 10 Oct 2026, /docs/elicitation/2026-10-10-brainstorm.md.</p>
<p>[R7] S. E. Şeker, CS 3354 Lessons 13–14, Use Case Analysis and Object Interaction Modelling (expanded use cases, scenario tables, checks K1–K6).</p>
<p>[R8] Spike 01 README and raw results, /spikes/spike-01-live-orders/ (section 8).</p>
<p>[R9] Restaurant manager interview, <mark>[date]</mark>, by <mark>[interviewer name]</mark>; notes in /docs/elicitation/2026-11-08-restaurant-manager-interview.md.</p></td>
</tr>
</tbody>
</table>

## 2 Overall Description



### 2.1 Product perspective and context

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image1.png" style="width:7in;height:2.74276in" /></p>
<p><strong>Figure 1. Context diagram.</strong> Everything inside the dark box is ours to build: the customer menu pages, the staff order queue, the manager pages, and the logic and data behind them. The boundary sits at the phone browser on one side and the hosting/database service on the other: we use the phone camera, the cloud host and the payment gateway but build none of them, so they are drawn as external systems. The customer types card details only on the gateway's own page; QRMOS sends the amount and receives approved or declined, so card data never enters our box. The existing POS is drawn on purpose with <strong>no</strong> interface, which makes that exclusion visible instead of silent.</p></td>
</tr>
</tbody>
</table>

### 2.2 Stakeholders and how you reached them

| **Stakeholder**             | **Role in relation to the system**                                                                    | **What they need from it**                                                                                                           | **How you learned this**                                                                                                                                                                                         |
|-----------------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| S1 Customer (diner)         | Primary user; scans the code and orders                                                               | Order without waiting; see real prices and what is sold out; know the order was received                                             | Confirmed by the manager interview \[R9\]: customers mostly want fast service; sold-out items and wrong orders happen at busy times. Reported by the manager, not asked of diners directly.                      |
| S2 Server                   | User; delivers food, handles problems at the table                                                    | Fewer trips to take orders; orders clearly tagged by table                                                                           | Confirmed in part by the manager \[R9\]: wants a server to confirm each order before the kitchen (CR-13) and a clear alert when a payment fails (CR-16). Servers not interviewed directly.                       |
| S3 Kitchen staff            | User; prepares food from the order queue                                                              | Legible orders with every option and note, in arrival order                                                                          | Confirmed in part by the manager \[R9\]: the kitchen cancels single items, not whole orders (CR-12). Kitchen staff not interviewed directly.                                                                     |
| S4 Manager / owner          | Pays for and operates the system; edits menu                                                          | Change menu and sold-out items instantly; faster table turnover; a build cost within budget and running cost under about \$400/month | Confirmed by the manager interview \[R9\]: uses Square, restaurant pays the fee; wants one check per table (CR-11), English and Spanish (CR-14), listed allergens (CR-15) and one shared cart per table (CR-17). |
| S5 CS 3354 instructor & TAs | **Never uses it**; assesses the project                                                               | Testable, traceable requirements; repository access; on-time milestones                                                              | Read from the syllabus and P1 template \[R2\]                                                                                                                                                                    |
| S6 Development team         | Builds and maintains it this term                                                                     | Scope that fits the term; the itemized estimate of \$43,263 (2.6), inside the \$75,000 ceiling (C3)                                  | Agreed at the weekly team meeting (Saturdays, 2:00 pm, Microsoft Teams); minutes in /docs/meetings                                                                                                               |
| S7 Payment gateway provider | **Never uses the screens**; external service that processes card payments (supporting actor in UC-07) | Requests in its API format, a merchant account for the restaurant, its per-transaction fee                                           | Assumed from providers' public developer documentation; which provider is open question Q1                                                                                                                       |

### 2.3 User characteristics

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Customers.</strong> Any adult or teenager in the restaurant, from tech-comfortable students to older diners who rarely scan QR codes. They use their own phone (any size, iOS or Android, any modern browser), often one-handed, in dim light and in a hurry to order before the rest of the table. They cannot be assumed to read English fluently, to have good eyesight, or to know restaurant terms. Some will use screen readers or large text, so the menu must work with both (QR-04). They will not create an account or install anything.</p>
<p><strong>Staff (servers and kitchen).</strong> Know the menu and the restaurant's routine very well but have no training in this system and no time to read instructions during service. They will look at a shared tablet or screen from a distance, sometimes with wet or gloved hands, so the order queue needs large text and large buttons. Turnover is high, so a new staff member must be productive after a short demo.</p>
<p><strong>Manager.</strong> Comfortable with a laptop and with editing a spreadsheet-like list, but not a programmer. Edits the menu occasionally, usually before opening, and sets up tables once. Needs to print QR codes on an ordinary office printer.</p></td>
</tr>
</tbody>
</table>

### 2.4 Constraints

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>C1 — Web application, no install.</strong> Customers must reach the menu through a phone web browser; no native app. Source: project definition agreed by the team and stated in our proposal.</p>
<p><strong>C2 — Time.</strong> The system must be specified, designed, built and tested within the Fall 2026 term, by the P3 deadline. Source: syllabus [R2].</p>
<p><strong>C3 — Budget.</strong> Total cost for building the system, its hardware and the first year of hosting must stay between $8,000 and $75,000. Our estimate is about $43,300 (see 2.6). Source: CS 3354 project instructions [R2].</p>
<p><strong>C4 — No card data in our system.</strong> Payment must go through an external payment gateway's hosted page; QRMOS must never collect, transmit or store card numbers. Source: scope decision in 1.2 and PCI DSS [R5].</p>
<p><strong>C5 — Instructor access.</strong> All source code and documents must live in a repository the instructor can open. Source: P1 template section 4.4 [R2].</p></td>
</tr>
</tbody>
</table>

### 2.5 Assumptions and dependencies

| **\#** | **Assumption or dependency**                                                                                                     | **What breaks if it does not hold**                                                                                                     |
|--------|----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| A1     | Most diners carry a smartphone with a camera, a browser and mobile data or Wi-Fi.                                                | Diners without a phone cannot order; the restaurant must keep paper menus and server ordering as a fallback, and adoption numbers fall. |
| A2     | The restaurant has a reliable internet connection during service.                                                                | Orders are delayed or lost and the staff queue shows stale data; QR-01 cannot be met.                                                   |
| A3     | The restaurant has at least one tablet or PC that stays open on the staff order screen.                                          | No one sees incoming orders, so UC-03 has no actor at the moment orders arrive.                                                         |
| A4     | (Dependency) A paid cloud hosting and database plan (about \$50/month) stays available and priced as quoted for the first year.  | We lose the demo environment and must migrate mid-project, threatening C2 and the P3 demo.                                              |
| A5     | (Dependency) The restaurant's Square merchant account (interview \[R9\]) offers a hosted checkout page we can send customers to. | Online payment (UC-07) cannot go live; diners pay the server as today, and FR-16/FR-17 slip to a later release (see Q1).                |
| A6     | A QR code on a table is only scanned by people sitting at that table.                                                            | Someone could photograph a code and send fake orders from outside; we would need staff confirmation of orders (see Q4).                 |

### 2.6 Feasibility summary

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 13%" />
<col style="width: 65%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Feasibility gate</strong></th>
<th><strong>Verdict</strong></th>
<th><strong>Evidence behind the verdict</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Technical</td>
<td>Feasible</td>
<td>Every piece is a common web feature. Spike 01 measured live order delivery on our planned design: push reached the staff screen in 0.3 s at the 95th percentile with 150 ms network delay, well inside QR-01 (section 8).</td>
</tr>
<tr class="even">
<td>Operational</td>
<td>Feasible, with one risk</td>
<td>It copies the existing workflow (order → server check → kitchen → serve) and only moves where the order is typed. The manager interview [R9] confirmed the problems it targets and asked for a server confirmation step (CR-13), which keeps staff in control. Risk: older diners may not want to scan; A1 fallback keeps paper menus.</td>
</tr>
<tr class="odd">
<td>Schedule</td>
<td>Feasible if scope holds</td>
<td>MUST items are 9 of 27 functional requirements (33%); the interview added seven SHOULD items (CR-11 to CR-17), which can be dropped first if work runs late. The plan to P3 in 10.2 has dated owners; risk R3 (scope creep) is handled by change control (0.2).</td>
</tr>
<tr class="even">
<td>Economic / resource</td>
<td>Feasible</td>
<td><p>Estimated total about $43,300, within the $8,000–$75,000 budget (C3):</p>
<p>• Development labour: 6 people × 10 weeks × 10 h = 600 h at an assumed $60/h = $36,000</p>
<p>• Cloud hosting and database, paid plan: $50/month × 12 = $600</p>
<p>• Domain name: $20/year</p>
<p>• Payment gateway: no monthly fee assumed; the restaurant pays a per-transaction fee (about 3% per payment, to confirm in Q1)</p>
<p>• Two staff tablets for the order screen: 2 × $350 = $700</p>
<p>• Printed, laminated QR table cards: 20 tables × $5 = $100</p>
<p>• Usability-test participant gift cards: 10 × $20 = $200</p>
<p>• Contingency 15% = $5,643 → total $43,263</p>
<p>Running cost after year 1: about $4,200/year (hosting $600, domain $20, maintenance about 10% of build $3,600). Rates are estimates to confirm (Q7).</p></td>
</tr>
</tbody>
</table>

## 3 Specific Requirements



### 3.1 Functional requirements

| **ID** | **Requirement — one “shall” sentence**                                                                                                              | **Priority** | **Source**         | **Acceptance criterion**                                                                                                                                      |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------|--------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-01  | The system shall generate a QR code for each registered table that encodes a URL unique to that table.                                              | MUST         | S4                 | Register tables 1–3, generate codes, scan each with a phone: each opens the menu showing its own table number, and no two codes decode to the same URL.       |
| FR-02  | The system shall display the menu, grouped by category, to anyone who opens a valid table URL without asking them to log in or install an app.      | MUST         | S1, C1             | Open a table URL in a fresh private browser on iOS Safari and Android Chrome: the menu appears and no login or install prompt is shown.                       |
| FR-03  | The system shall show each menu item's name, description, price and availability.                                                                   | MUST         | S1, S4             | Load a 20-item test menu: every item on screen matches the database record in all four fields.                                                                |
| FR-04  | The system shall prevent a customer from adding a sold-out item to the cart.                                                                        | SHOULD       | S1, S3             | Mark one item sold out: its Add button is disabled, and a direct add request to the server is rejected.                                                       |
| FR-05  | The system shall let a customer choose an item's defined options, quantity and a special note of up to 200 characters before adding it to the cart. | MUST         | S1, S3             | Add a burger with size Large, quantity 2 and a 200-character note: the cart shows all three; a 201st character cannot be typed.                               |
| FR-06  | The system shall let a customer change the quantity of, or remove, any cart item before submission, recalculating the total after each change.      | SHOULD       | S1                 | Change 2 → 3 and remove one item: the displayed total equals the hand-calculated total after each step.                                                       |
| FR-07  | The system shall submit the cart as one order tagged with the table number of the URL it was opened from.                                           | MUST         | S2, S3             | Submit from table 5's URL: the order in the database and on the staff screen shows table 5.                                                                   |
| FR-08  | The system shall show the customer a confirmation with an order number after a successful submission.                                               | SHOULD       | S1                 | After submitting, the confirmation number on the phone matches the order number on the staff screen.                                                          |
| FR-09  | The system shall add each new order to the staff order queue, in submission-time order, without the staff member reloading the page.                | MUST         | S2, S3             | With the staff screen open, submit 3 orders from 3 phones: all 3 appear in the right order with no reload (timing tested in QR-01).                           |
| FR-10  | The system shall let a staff member move an order's status from Received to Preparing to Ready to Served, or to Cancelled.                          | MUST         | S2, S3             | Step one order through every status and cancel another: each change is saved with a timestamp; skipping or reversing a status is refused.                     |
| FR-11  | The system shall show the customer the current status of each order submitted from their device in the current table session.                       | SHOULD       | S1                 | Change an order's status on the staff screen: the customer's page shows the new status within 3 seconds without a reload.                                     |
| FR-12  | The system shall let a manager add, edit and remove menu items, including name, description, price, category, options and photo.                    | MUST         | S4                 | Add, edit and delete one item: each change appears on a freshly loaded customer menu.                                                                         |
| FR-13  | The system shall let a staff member or manager mark a menu item sold out or available again.                                                        | SHOULD       | S2, S3, S4         | Mark an item sold out on the staff screen: a freshly loaded customer menu shows it as sold out; mark it available and it can be added again.                  |
| FR-14  | The system shall require a staff or manager account to log in with a username and password before any staff or manager page is shown.               | MUST         | S2, S3, S4 (CR-01) | Open every staff/manager page in a logged-out browser: each redirects to the login page.                                                                      |
| FR-15  | The system shall let a manager add, rename and deactivate tables, and a deactivated table's URL shall stop accepting orders.                        | COULD        | S4 (found via 3.5) | Deactivate table 4 and scan its code: the page says the table is not active and the Submit action is unavailable.                                             |
| FR-16  | The system shall let a customer pay all unpaid orders of their table session through the external payment gateway's hosted payment page.            | SHOULD       | S1, S4             | Submit two orders from table 3 and choose Pay: the gateway page shows the combined total; a test card payment succeeds.                                       |
| FR-17  | The system shall mark the paid orders as Paid only after the payment gateway confirms the payment as approved.                                      | SHOULD       | S4                 | Pay with a test card the gateway declines: orders stay Unpaid and the customer is told; pay with an approved test card: orders show Paid on the staff screen. |
| FR-18  | The system shall record a cart only once when the customer resubmits it after a failed submission.                                                  | SHOULD       | S1, S3 (CR-04)     | Cut the connection just after Submit, then retry twice: the staff queue shows exactly one order for that cart.                                                |
| FR-19  | The system shall show, for each active order in the staff queue, the time elapsed since it was received.                                            | SHOULD       | S2, S3 (CR-05)     | Submit an order and wait 5 minutes: the staff queue shows 5 min for it, within ±1 min.                                                                        |
| FR-20  | The system shall show the customer a receipt with the amount, time and payment reference after an approved payment.                                 | SHOULD       | S1 (CR-06)         | Pay with an approved test card: the receipt shows the amount paid, the time and the gateway's reference.                                                      |
| FR-21  | The system shall group all orders of a table session on one table check, shown to staff and used for the bill.                                      | SHOULD       | S4 (CR-11)         | Submit two orders from table 4: the staff screen shows one check for table 4 listing both, and the bill totals both.                                          |
| FR-22  | The system shall let a staff member cancel a single order line with a reason, recalculating the order total.                                        | SHOULD       | S3 (CR-12)         | Cancel one of three lines with reason "86'd": the other two stay, the total drops by that line's price, and the reason is recorded.                           |
| FR-23  | The system shall show each new order to servers as Awaiting confirmation and send it to the kitchen only after a server confirms it.                | SHOULD       | S2, S4 (CR-13)     | Submit an order: the kitchen view does not show it until a server confirms; after confirming, it appears as Received.                                         |
| FR-24  | The system shall show the customer menu in English or Spanish, as the customer chooses.                                                             | SHOULD       | S1, S4 (CR-14)     | Switch the language to Spanish: every category, item name and description shown is the Spanish text entered by the manager.                                   |
| FR-25  | The system shall show each menu item's common allergens.                                                                                            | SHOULD       | S1, S4 (CR-15)     | Tag an item with milk and nuts: both allergens appear on the item for the customer.                                                                           |
| FR-26  | The system shall alert staff with the table and amount when a customer's payment fails.                                                             | SHOULD       | S2, S4 (CR-16)     | Pay with a test card the gateway declines: the staff screen shows an alert with the table number and amount within 3 s.                                       |
| FR-27  | The system shall let every phone at the same table add to and see one shared cart.                                                                  | SHOULD       | S1, S4 (CR-17)     | Open table 2 on two phones and add one item on each: both phones show both items and the same total.                                                          |

### 3.2 Quality requirements

| **ID** | **Requirement — with threshold, condition and method**                                                                                                                       | **Priority** | **Source** | **How it will be verified**                                                                                               |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|------------|---------------------------------------------------------------------------------------------------------------------------|
| QR-01  | **Performance.** 95% of submitted orders shall appear on an open staff order screen within 3 seconds of submission, under 20 tables ordering at the same time.               | MUST         | S2, S3     | Scripted test sends 100 orders from 20 simulated clients; compare submit and display timestamps; pass if ≥ 95 are ≤ 3 s.  |
| QR-02  | **Performance.** The customer menu shall show its first category of items within 3 seconds of opening a table URL in 95% of loads on a mid-range phone over a 4G connection. | MUST         | S1         | 20 loads with Chrome DevTools "Fast 4G" throttling and a mid-range phone profile; record time to first item.              |
| QR-03  | **Usability.** At least 8 of 10 first-time users shall place an order of 2 items, one with an option chosen, in under 2 minutes without help.                                | SHOULD       | S1         | Moderated test with 10 students outside the team; timed from scan to confirmation screen; results in /docs/usability.     |
| QR-04  | **Accessibility.** The customer menu, cart and confirmation pages shall meet WCAG 2.1 Level AA \[R3\].                                                                       | SHOULD       | S1, R3     | Zero serious/critical issues reported by axe DevTools, plus a full order completed using VoiceOver and TalkBack.          |
| QR-05  | **Security.** 100% of staff and manager server endpoints shall reject requests without a valid session, and manager-only endpoints shall reject Staff-role sessions.         | MUST         | S4         | Automated test calls every endpoint logged-out, as Staff and as Manager; pass only if every expected 401/403 is returned. |
| QR-06  | **Availability.** The system shall be reachable at least 99% of the time during a 7-day trial from 11:00 to 22:00 daily.                                                     | COULD        | S4         | An uptime monitor checks the menu URL every 5 minutes; uptime % computed from its log.                                    |

### 3.3 Constraint requirements

| **ID** | **Constraint — one sentence**                                                                                                    | **Source** | **Why it cannot be negotiated**                                                       |
|--------|----------------------------------------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------|
| CON-01 | The customer interface shall run in the phone's web browser without installing any app.                                          | C1         | It is the defining idea of the product; a diner will not install an app for one meal. |
| CON-02 | The system shall not collect, transmit or store card numbers; card entry shall happen only on the payment gateway's hosted page. | C4, R5     | Handling card data ourselves triggers full PCI DSS compliance the team cannot meet.   |
| CON-03 | The total cost of building the system, its hardware and the first year of hosting shall not exceed \$75,000.                     | C3, R2     | It is the budget ceiling set for the project; anything above it cannot be funded.     |
| CON-04 | All source code and documents shall be kept in a repository the instructor can access.                                           | C5, R2     | Required by the course for grading and contribution evidence.                         |

### 3.4 Initial use cases

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image2.png" style="width:6.6in;height:4.37982in" /></p>
<p><strong>Figure 2. Use case diagram (revised by CR-03).</strong> Seven actor-goal use cases (blue) and four included or extending parts (grey). «include»: Place Order always includes Browse Menu; UC-03 to UC-06 include Log In. «extend»: Customize Item extends Place Order when an item has options; Cancel Order extends Process Incoming Orders when the kitchen cannot make an order. The Payment Gateway is a supporting actor of UC-07: it never starts a use case. Manager is a specialised Staff actor.</p></td>
</tr>
</tbody>
</table>

**High-level use cases (expanded turn by turn in section 4 where marked)**

| **ID** | **Use case · actor**                           | **Begins with (TUCBW)**                            | **Ends with (TUCEW)**                                  | **Level**     |
|--------|------------------------------------------------|----------------------------------------------------|--------------------------------------------------------|---------------|
| UC-01  | Place Order · Customer                         | the customer scans the QR code on the table        | the customer reads the order confirmation              | Expanded, 4.2 |
| UC-02  | Track Order Status · Customer                  | the customer opens the status of their orders      | the customer reads the current status                  | High-level    |
| UC-03  | Process Incoming Orders · Staff                | a new order appears in the staff queue             | the staff member sees the order leave the active queue | Expanded, 4.3 |
| UC-04  | Update Item Availability · Staff               | a staff member marks an item sold out or available | the staff member sees the new availability             | High-level    |
| UC-05  | Manage Menu · Manager                          | the manager opens the menu editor                  | the manager sees the saved change                      | High-level    |
| UC-06  | Set Up Tables & QR Codes · Manager             | the manager adds, renames or deactivates a table   | the manager sees the table list and its printable code | High-level    |
| UC-07  | Pay Bill · Customer (Payment Gateway supports) | the customer chooses to pay                        | the customer reads the receipt                         | Expanded, 4.4 |

### 3.5 Requirements to use case traceability

| **Requirement ID** | **Use case(s) that realise it**                | **If blank — why, and what you will do**                                      |
|--------------------|------------------------------------------------|-------------------------------------------------------------------------------|
| FR-01              | UC-06 (used by UC-01)                          |                                                                               |
| FR-02              | UC-01                                          |                                                                               |
| FR-03              | UC-01                                          |                                                                               |
| FR-04              | UC-01, UC-04                                   |                                                                               |
| FR-05              | UC-01                                          |                                                                               |
| FR-06              | UC-01                                          |                                                                               |
| FR-07              | UC-01                                          |                                                                               |
| FR-08              | UC-01                                          |                                                                               |
| FR-09              | UC-03                                          |                                                                               |
| FR-10              | UC-03                                          |                                                                               |
| FR-11              | UC-02                                          | Only requirement behind UC-02; if FR-11 were dropped, UC-02 would go with it. |
| FR-12              | UC-05                                          |                                                                               |
| FR-13              | UC-04                                          |                                                                               |
| FR-14              | Log In «include» of UC-03, UC-04, UC-05, UC-06 |                                                                               |
| FR-15              | UC-06, UC-01 (alt 2a)                          | Added in this revision — see below.                                           |
| FR-16              | UC-07                                          |                                                                               |
| FR-17              | UC-07                                          |                                                                               |
| FR-18              | UC-01 (alt 13a)                                | Added by CR-04.                                                               |
| FR-19              | UC-03 (step 0)                                 | Added by CR-05.                                                               |
| FR-20              | UC-07 (step 7)                                 | Added by CR-06.                                                               |
| FR-21              | UC-03, UC-07                                   | Added by CR-11.                                                               |
| FR-22              | UC-03 (alt 6a)                                 | Added by CR-12.                                                               |
| FR-23              | UC-03 (steps 2–3)                              | Added by CR-13.                                                               |
| FR-24              | UC-01 (step 2)                                 | Added by CR-14.                                                               |
| FR-25              | UC-01 (step 4)                                 | Added by CR-15.                                                               |
| FR-26              | UC-07 (alt 6a)                                 | Added by CR-16.                                                               |
| FR-27              | UC-01 (steps 8–10)                             | Added by CR-17.                                                               |
| QR-01 … QR-06      | —                                              | Non-functional: traced to components and decisions in section 9 instead.      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>What the matrix revealed, and what we changed because of it:</strong></p>
<p>1. <strong>UC-06 had nothing to trace to except FR-01.</strong> FR-01 says "each registered table", but no requirement let anyone register a table. We added FR-15 (add, rename, deactivate tables) and the alternative flow 2a in UC-01.</p>
<p>2. <strong>UC-02 rests on one SHOULD requirement (FR-11).</strong> We kept it, but recorded that dropping FR-11 removes the whole use case.</p>
<p>3. <strong>Role restriction first appeared as a functional requirement.</strong> It reached no use case of its own, which showed it is a security quality, so it moved to QR-05.</p>
<p>4. <strong>Ordering again from the same table</strong> (a second round of drinks) has no requirement saying how it relates to the first order. Rather than invent an answer we raised it as Q2.</p>
<p>5. <strong>Online payment had no use case.</strong> Adding FR-16 and FR-17 needed a new goal, UC-07 Pay Bill, with the payment gateway as a supporting actor; CON-02 keeps card data on the gateway's page.</p>
<p>6. <strong>Login was repeated in four use cases.</strong> We made it one «include» (Log In) shared by UC-03 to UC-06, and split optional behaviour into «extend» parts (Customize Item, Cancel Order).</p></td>
</tr>
</tbody>
</table>

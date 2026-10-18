# P1 sections — Member 4 — Modelling lead

> Draft content for the P1 document. Upload this file from **your own** GitHub account.

![Context diagram](../diagrams/context.png)

## 2.1 Product perspective and context

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

## 3.4 Initial use cases

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image2.png" style="width:6.2in;height:4.11437in" /></p>
<p><strong>Figure 2. Use case diagram.</strong> Seven actor-goal use cases (blue), plus four shared or optional parts (grey). <strong>«include»</strong> marks behaviour a use case always uses: Place Order always includes Browse Menu, and UC-03 to UC-06 all include Log In, so login is written once instead of four times. <strong>«extend»</strong> marks optional behaviour that runs only under a condition: Customize Item extends Place Order when an item has options, and Cancel Order extends Process Incoming Orders when the kitchen cannot make an order. The <strong>Payment Gateway</strong> is a supporting actor: it never starts a use case but takes part in UC-07 Pay Bill. Manager is a specialised Staff actor.</p></td>
</tr>
</tbody>
</table>

**Expanded use case 1 of 2 — UC-01 Place Order**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 76%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Field</strong></th>
<th><strong>Content</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Identifier and name</td>
<td>UC-01 Place Order</td>
</tr>
<tr class="even">
<td>Primary actor</td>
<td>Customer</td>
</tr>
<tr class="odd">
<td>Supporting actors</td>
<td>Staff (receives the order through UC-03)</td>
</tr>
<tr class="even">
<td>Preconditions — what must be true before it starts</td>
<td><p>1. The table is active and its QR code is on the table (UC-06).</p>
<p>2. The menu has at least one available item.</p>
<p>3. The customer's phone has a camera and internet access (A1).</p></td>
</tr>
<tr class="odd">
<td>Trigger — what starts it</td>
<td>The customer scans the QR code on their table.</td>
</tr>
<tr class="even">
<td>Main success scenario — numbered steps</td>
<td><p>1. Customer scans the table's QR code.</p>
<p>2. System opens the menu for that table, showing the table number and the categories (Browse Menu «include»).</p>
<p>3. Customer opens a category and selects an item.</p>
<p>4. System shows the item's description, price and options.</p>
<p>5. Customer chooses quantity and adds the item to the cart; if the item has options, Customize Item «extend» lets them pick options and type a note.</p>
<p>6. Steps 3–5 repeat until the customer has everything they want.</p>
<p>7. Customer opens the cart; System shows each item, its options, quantity and the total.</p>
<p>8. Customer submits the order.</p>
<p>9. System saves the order with the table number and status Received, and places it in the staff queue.</p>
<p>10. System shows a confirmation with the order number. The use case ends.</p></td>
</tr>
<tr class="odd">
<td>Alternative and exception flows</td>
<td><p><strong>2a. Table code not active:</strong> System shows "This table is not taking orders — please ask your server"; no ordering is possible. Ends.</p>
<p><strong>3a. Item is sold out:</strong> System shows it greyed out and disables Add (FR-04); customer picks another item.</p>
<p><strong>5a. Note longer than 200 characters:</strong> System stops accepting characters at 200.</p>
<p><strong>7a. Customer edits the cart:</strong> customer changes a quantity or removes an item; System recalculates the total (FR-06). If the cart becomes empty, Submit is disabled.</p>
<p><strong>8a. An item sold out after it was added:</strong> System refuses that line, tells the customer which item, and keeps the rest of the cart for resubmission.</p>
<p><strong>9a. Connection lost during submit:</strong> System shows "Order not sent — try again" and keeps the cart. A retry must not create a duplicate order.</p>
<p><strong>*a. Customer leaves without submitting:</strong> the cart is discarded when the session expires; no order exists.</p></td>
</tr>
<tr class="even">
<td>Postconditions — what is true when it succeeds</td>
<td>An order exists with a unique number, table number, items, options, notes, timestamp and status Received; it is visible in the staff queue; the customer holds its number.</td>
</tr>
<tr class="odd">
<td>Requirements realised</td>
<td>FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, FR-15 (2a); QR-01, QR-02, QR-03, QR-04</td>
</tr>
</tbody>
</table>

**Expanded use case 2 of 2 — UC-03 Process Incoming Orders**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 76%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Field</strong></th>
<th><strong>Content</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Identifier and name</td>
<td>UC-03 Process Incoming Orders</td>
</tr>
<tr class="even">
<td>Primary actor</td>
<td>Staff member (server or kitchen); Manager may also act</td>
</tr>
<tr class="odd">
<td>Supporting actors</td>
<td>Customer (sees status changes through UC-02)</td>
</tr>
<tr class="even">
<td>Preconditions — what must be true before it starts</td>
<td><p>1. The staff member is logged in (Log In «include», FR-14).</p>
<p>2. The staff order screen is open on the restaurant device (A3).</p></td>
</tr>
<tr class="odd">
<td>Trigger — what starts it</td>
<td>A new order arrives in the staff queue.</td>
</tr>
<tr class="even">
<td>Main success scenario — numbered steps</td>
<td><p>1. System adds the new order to the queue in submission order, showing table number, items, options, notes and time (FR-09).</p>
<p>2. Staff member reads the order and marks it Preparing.</p>
<p>3. System saves the status with a timestamp and updates the customer's view (FR-10, FR-11).</p>
<p>4. When the food is ready, staff member marks the order Ready.</p>
<p>5. Server takes the food to the table and marks the order Served.</p>
<p>6. System moves the order from the active queue to the completed list. The use case ends.</p></td>
</tr>
<tr class="odd">
<td>Alternative and exception flows</td>
<td><p><strong>2a. Kitchen cannot make an item</strong> (ingredient ran out) — Cancel Order «extend»: staff member marks the order Cancelled; System shows the cancellation to the customer; staff member marks the item sold out (UC-04) so it cannot be ordered again. Whether a single item can be cancelled instead is open (Q3).</p>
<p><strong>2b. Order looks fake</strong> (e.g. table is empty): staff member checks the table and cancels the order if no one is there (see A6, Q4).</p>
<p><strong>3a. Staff tries to skip or reverse a status:</strong> System refuses and keeps the current status (FR-10).</p>
<p><strong>3b. Staff device loses its connection:</strong> System shows an "Offline" banner; on reconnection it reloads the queue so no order submitted in the meantime is missed.</p>
<p><strong>3c. Session expired:</strong> System returns to the login page; after login the queue reopens unchanged.</p></td>
</tr>
<tr class="even">
<td>Postconditions — what is true when it succeeds</td>
<td>The order's status is Served (or Cancelled) with a timestamp for every change; the customer's view shows the same status.</td>
</tr>
<tr class="odd">
<td>Requirements realised</td>
<td>FR-09, FR-10, FR-11, FR-13 (2a), FR-14; QR-01, QR-05</td>
</tr>
</tbody>
</table>

![Use case diagram](../diagrams/usecase.png)

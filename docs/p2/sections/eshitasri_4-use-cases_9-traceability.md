# P2 sections owned by Eshitasri Punuganti (@peshi24)

> Commit this file from your own GitHub account on branch `p2/use-cases` and open a pull request; another member reviews it.

## 4 Use-Case Analysis



### 4.1 Which use cases we expanded, and why

| **Use case**                  | **Why it earns an expanded description**                                                                                             |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| UC-01 Place Order             | Carries the most requirements (FR-01 to FR-08, FR-18, FR-24, FR-25, FR-27) and every customer quality requirement; specified at P1.  |
| UC-03 Process Incoming Orders | Where orders from many tables meet one staff screen (QR-01, QAS-1); changed most by the interview (CR-11 to CR-13); specified at P1. |
| UC-07 Pay Bill                | The only use case with an outside party and with money at stake (FR-16, FR-17, CON-02); the riskiest to get wrong.                   |

UC-02 and UC-04 to UC-06 have one obvious path each and stay at the high level in 3.4.

### 4.2 UC-01 Place Order

| **Field**                      | **Content**                                                                                                                                                                                                    |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary / supporting actors    | Customer / none (the order reaches staff through UC-03)                                                                                                                                                        |
| Preconditions (may be assumed) | The table is registered and its QR card is on the table. The customer's phone can open web links.                                                                                                              |
| TUCBW · TUCEW                  | The customer scans the QR code on the table · the customer reads the order confirmation.                                                                                                                       |
| TUCCW                          | UC-02 Track Order Status, if the customer follows the order; UC-07 Pay Bill, if they choose to pay.                                                                                                            |
| Postcondition                  | An order exists with a new number, the table number, every line, the total, the time and status Awaiting confirmation; it is on the table check and last in the staff queue; the customer has seen its number. |
| Invariant                      | The total shown always equals the sum of the line prices at the current menu prices.                                                                                                                           |
| Requirements realised          | FR-01 to FR-08, FR-15 (2a), FR-18 (13a), FR-23, FR-24, FR-25, FR-27; QR-01 to QR-04                                                                                                                            |

| **Customer · input and action**                                                                                                   | **QRMOS · system response**                                                                                                                                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|                                                                                                                                   | \(0\) The table card shows the table number and a QR code with "Scan to see the menu and order".                                                                                                                                                |
| \(1\) The customer scans the QR code.                                                                                             |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(2\) The system shows the menu for that table in the chosen language (English or Spanish): restaurant name, table number, categories, each item's name, price and whether it is sold out, and the table's shared cart (Browse Menu «include»). |
| \(3\) The customer selects an item.                                                                                               |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(4\) The system shows the item's description, photo, allergens, price, its options with their price changes, quantity 1 and an empty note.                                                                                                     |
| \(5\) The customer chooses options, a quantity and, optionally, a note (Customize Item «extend», only when the item has options). |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(6\) The system shows the line price for those choices.                                                                                                                                                                                        |
| \(7\) The customer adds the line to the cart.                                                                                     |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(8\) The system shows the number of lines in the table's cart and its total, including lines added from other phones at the table. Steps 3–8 repeat until the customer has everything.                                                         |
| \(9\) The customer opens the cart.                                                                                                |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(10\) The system lists every line with its options, note, quantity and line price, and the total.                                                                                                                                              |
| \(11\) The customer submits the order.                                                                                            |                                                                                                                                                                                                                                                 |
|                                                                                                                                   | \(12\) The system checks that every item is still available and that the table is still taking orders.                                                                                                                                          |
|                                                                                                                                   | \(13\) The system records the order on the table's check with the next order number, status Awaiting confirmation and the time, and places it last in the staff queue.                                                                          |
|                                                                                                                                   | \(14\) The system shows the confirmation: order number, lines, total and status Awaiting confirmation.                                                                                                                                          |
| \(15\) The customer reads the confirmation. (acknowledgment)                                                                      |                                                                                                                                                                                                                                                 |

| **Alternate** | **Condition**                                      | **What happens**                                                                                                 |
|---------------|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| 2a            | The table is deactivated.                          | The system says the table is not taking orders and to ask a server; no ordering is possible. Ends. (FR-15)       |
| 3a            | The item is sold out.                              | It is shown as sold out and cannot be selected; the customer picks another item. (FR-04)                         |
| 5a            | The note passes 200 characters.                    | The system accepts no more characters. (FR-05)                                                                   |
| 10a           | The customer changes a quantity or removes a line. | The system recalculates the total and shows the cart again; if it is empty, submitting is not offered. (FR-06)   |
| 12a           | An item sold out after it was added.               | The system names the item, removes that line and shows the cart again; the customer may submit the rest. (FR-04) |
| 12b           | The table was deactivated after the scan.          | As 2a; the cart is kept so a server can take it. (FR-15)                                                         |
| 13a           | The order cannot reach the restaurant.             | The system says "Order not sent — try again" and keeps the cart; a retry records the order only once. (FR-18)    |
| \*a           | The customer leaves without submitting.            | The cart is discarded when the table session expires; no order exists.                                           |

### 4.3 UC-03 Process Incoming Orders

| **Field**                      | **Content**                                                                                                                                                        |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary / supporting actors    | Staff member (a server confirms; kitchen staff prepare; a manager may act) / Customer, who sees the new status through UC-02                                       |
| Preconditions (may be assumed) | The staff member is logged in (Log In «include», FR-14). The staff queue is open on the restaurant tablet (A3).                                                    |
| TUCBW · TUCEW                  | A new order appears in the staff queue · the staff member sees the order leave the active queue.                                                                   |
| TUCCW                          | UC-04 Update Item Availability, after alternate 6a.                                                                                                                |
| Postcondition                  | The order is Served (or Cancelled with a reason), and every status change is recorded with time and staff member.                                                  |
| Invariant                      | An order's status only moves forward (Awaiting confirmation → Received → Preparing → Ready → Served) or to Cancelled; the kitchen never sees an unconfirmed order. |
| Requirements realised          | FR-09, FR-10, FR-13 (6a), FR-14, FR-19, FR-21, FR-22, FR-23; QR-01, QR-05                                                                                          |

| **Staff member · input and action**                                         | **QRMOS · system response**                                                                                                                                                 |
|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|                                                                             | \(0\) The staff queue shows every active order oldest first, grouped by table check, each with table number, lines with options and notes, status, and time since received. |
|                                                                             | \(1\) The system adds the new order to its table's check, marked Awaiting confirmation, without the staff member reloading.                                                 |
| \(2\) A server reads the order and confirms it.                             |                                                                                                                                                                             |
|                                                                             | \(3\) The system records the confirmation with the time and the server, marks the order Received and shows it to the kitchen.                                               |
| \(4\) A kitchen staff member marks the order Preparing.                     |                                                                                                                                                                             |
|                                                                             | \(5\) The system records the change with the time and the staff member, and shows the order as Preparing.                                                                   |
| \(6\) The kitchen staff member marks the order Ready.                       |                                                                                                                                                                             |
|                                                                             | \(7\) The system records the change and shows the order as Ready.                                                                                                           |
| \(8\) The server marks the order Served.                                    |                                                                                                                                                                             |
|                                                                             | \(9\) The system records the change and moves the order from the active queue to the table's completed list.                                                                |
| \(10\) The staff member sees the queue without that order. (acknowledgment) |                                                                                                                                                                             |

| **Alternate** | **Condition**                                                                           | **What happens**                                                                                                                                                                        |
|---------------|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2a            | The server finds the order wrong or fake (no one at the table) — Cancel Order «extend». | The server cancels the order with a reason; the kitchen never sees it; the customer is told. (FR-23, A6)                                                                                |
| 6a            | The kitchen cannot make one item — Cancel Order «extend».                               | The staff member cancels that line with a reason; the system recalculates the order total, keeps the other lines and tells the customer. TUCCW UC-04 to mark the item sold out. (FR-22) |
| 4b            | The staff member tries to skip or reverse a status.                                     | The system refuses and keeps the current status. (FR-10)                                                                                                                                |
| 1a            | The staff tablet has lost its connection.                                               | The system shows that the queue is offline; when the connection returns it shows every order received meanwhile (QAS-2).                                                                |
| \*a           | The staff member's session has expired.                                                 | The system asks them to log in again and then shows the same queue.                                                                                                                     |

### 4.4 UC-07 Pay Bill

| **Field**                      | **Content**                                                                                                                |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| Primary / supporting actors    | Customer / Payment Gateway (outside our system)                                                                            |
| Preconditions (may be assumed) | The restaurant has a merchant account with the payment gateway (A5).                                                       |
| TUCBW · TUCEW                  | The customer chooses to pay · the customer reads the receipt.                                                              |
| Postcondition                  | An approved payment with the gateway's reference is recorded against the bill, and every order on the bill is Paid.        |
| Invariant                      | No order is ever Paid without an approved result from the gateway (FR-17); card details never pass through QRMOS (CON-02). |
| Requirements realised          | FR-16, FR-17, FR-20, FR-21, FR-26; CON-02; QR-05                                                                           |

| **Customer · input and action**                                                                     | **QRMOS · system response**                                                                                                               |
|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
|                                                                                                     | \(0\) The order status page lists the customer's orders for this table session with each status, which are unpaid, and the option to pay. |
| \(1\) The customer chooses to pay.                                                                  |                                                                                                                                           |
|                                                                                                     | \(2\) The system shows the bill: every unpaid order of this table session with its total, and the amount due.                             |
| \(3\) The customer confirms the amount.                                                             |                                                                                                                                           |
|                                                                                                     | \(4\) The system passes the amount and the bill reference to the payment gateway and sends the customer to the gateway's checkout.        |
| \(5\) The customer enters card details on the gateway's own page and approves. (outside our system) |                                                                                                                                           |
|                                                                                                     | \(6\) The system receives the approved result, records the payment against the bill and marks the bill's orders Paid.                     |
|                                                                                                     | \(7\) The system shows the receipt: amount paid, time, gateway reference and the orders covered.                                          |
| \(8\) The customer reads the receipt. (acknowledgment)                                              |                                                                                                                                           |

| **Alternate** | **Condition**                               | **What happens**                                                                                                                                            |
|---------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2a            | Nothing is unpaid in this table session.    | The system says there is nothing to pay. Ends.                                                                                                              |
| 5a            | The customer cancels on the gateway's page. | The customer returns to the bill; the orders stay unpaid. Ends.                                                                                             |
| 6a            | The gateway declines the payment.           | The system says the payment was declined and to try again or ask a server; staff see an alert with the table and amount; orders stay unpaid. (FR-17, FR-26) |
| 6b            | No result arrives within 2 minutes.         | The system says it could not confirm the payment and to ask a server; staff see the same alert as 6a; orders stay unpaid until a result arrives. (FR-26)    |

### 4.5 Self-review log

Each use case was checked against the ten review questions \[R7\] by a member who did not write it: UC-01 by Isaiah Bueno-Hernandez, UC-03 by Xuan Mai Tran, UC-07 by Rafay Alvi.

| **\#** | **Review question**                             | **UC-01**                            | **UC-03**                                           | **UC-07**                     |
|--------|-------------------------------------------------|--------------------------------------|-----------------------------------------------------|-------------------------------|
| 1      | Actor is a role, not a person or "user"         | Pass                                 | Pass                                                | Pass                          |
| 2      | There is a step (0)                             | Fixed — P1 had none                  | Fixed — P1 had none                                 | Pass                          |
| 3      | Every row holds one turn                        | Fixed — P1 step 9 split into 12–13   | Fixed — P1 step 5 split; confirm step added (CR-13) | Pass                          |
| 4      | Every actor-supplied item is a domain attribute | Fixed — note had no home (D1)        | Fixed — cancel reason (D2)                          | Pass                          |
| 5      | Ends with a perceivable acknowledgment          | Pass                                 | Fixed — P1 ended silently                           | Fixed — receipt added (FR-20) |
| 6      | Preconditions are assumptions, not failures     | Fixed — CR-09                        | Pass                                                | Pass                          |
| 7      | Postcondition can become a test                 | Pass                                 | Pass                                                | Pass                          |
| 8      | Alternates named by their step                  | Pass                                 | Pass                                                | Pass                          |
| 9      | No background processing                        | Pass                                 | Fixed — customer-view update removed                | Pass                          |
| 10     | No technology, store or widget                  | Fixed — "button", "database" removed | Fixed — "Offline banner"                            | Fixed — "Stripe" removed      |

## 9 Traceability

| **Requirement**                   | **Use case**          | **Analysis objects**                       | **Component(s)** | **Scenario / decision** |
|-----------------------------------|-----------------------|--------------------------------------------|------------------|-------------------------|
| FR-01 QR per table (MUST)         | UC-06, UC-01          | Table                                      | C5               | —                       |
| FR-02 menu, no login (MUST)       | UC-01                 | TableMenu, Menu                            | C1, C4           | ADR-01                  |
| FR-03 item details (MUST)         | UC-01                 | Menu, MenuItem                             | C1, C4           | —                       |
| FR-04 no sold-out items           | UC-01, UC-04          | Menu                                       | C4, C6           | ADR-05                  |
| FR-05 options, note (MUST)        | UC-01                 | MenuItem, Cart                             | C1, C4           | —                       |
| FR-06 edit cart                   | UC-01                 | Cart                                       | C1               | ADR-05                  |
| FR-07 submit with table (MUST)    | UC-01                 | TableMenu, OrderBook                       | C6, C9           | ADR-04                  |
| FR-08 confirmation                | UC-01                 | OrderBook                                  | C6, C1           | —                       |
| FR-09 live queue (MUST)           | UC-03                 | StaffQueue                                 | C6, C7, C2       | QAS-1, ADR-02           |
| FR-10 status changes (MUST)       | UC-03                 | OrderBook                                  | C6               | QAS-2                   |
| FR-11 customer status             | UC-02                 | —                                          | C7, C1           | ADR-02                  |
| FR-12 edit menu (MUST)            | UC-05                 | —                                          | C4, C2           | —                       |
| FR-13 mark sold out               | UC-04                 | —                                          | C4, C2           | —                       |
| FR-14 staff login (MUST)          | Log In «include»      | —                                          | C3               | QAS-3                   |
| FR-15 tables                      | UC-06, UC-01 2a       | Table                                      | C5               | —                       |
| FR-16 pay online                  | UC-07                 | TableMenu, OrderBook, Bill, PaymentGateway | C1, C6, C8       | ADR-03, QAS-4           |
| FR-17 Paid only if approved       | UC-07                 | OrderBook, Payment, Bill                   | C6, C8           | ADR-03                  |
| FR-18 no duplicate order          | UC-01 13a             | OrderBook                                  | C6, C9           | ADR-04                  |
| FR-19 time since received         | UC-03                 | StaffQueue                                 | C2, C6           | —                       |
| FR-20 receipt                     | UC-07                 | Payment                                    | C1, C6           | —                       |
| FR-21 table check                 | UC-03, UC-07          | StaffQueue, OrderBook, Bill                | C6, C2           | —                       |
| FR-22 cancel one line             | UC-03 6a              | OrderBook                                  | C6, C2           | —                       |
| FR-23 server confirms             | UC-03                 | StaffQueue, OrderBook                      | C6, C2, C7       | QAS-1                   |
| FR-24 English/Spanish             | UC-01                 | Menu, MenuItem                             | C4, C1           | —                       |
| FR-25 allergens                   | UC-01                 | MenuItem                                   | C4, C1           | —                       |
| FR-26 payment-failure alert       | UC-07 6a              | Payment                                    | C8, C7, C2       | ADR-03                  |
| FR-27 shared cart                 | UC-01                 | Cart                                       | C6, C7           | ADR-05                  |
| QR-01 / QR-02 speed               | UC-01, UC-03          | —                                          | C7, C1           | QAS-1, ADR-02, spike 01 |
| QR-05 security · CON-02 card data | all staff UCs · UC-07 | —                                          | C3 · C8          | QAS-3, ADR-03           |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Gap analysis.</strong></p>
<p>1. <strong>FR-11, FR-12, FR-13 have no analysis objects</strong>, because UC-02, UC-04 and UC-05 were left at the high level (4.1). They still reach a component. Action: expand UC-02 in P3 if FR-11 testing shows the status view needs its own objects.</p>
<p>2. <strong>QR-03 (usability) and QR-04 (accessibility) reach no component decision</strong>; they are tested on C1 in P3 (usability test, axe and screen-reader checks).</p>
<p>3. <strong>QR-06 (availability) has no scenario</strong>: it is COULD priority and depends on the host's uptime. Recorded, not acted on.</p>
<p>4. <strong>C7 now also carries shared-cart updates (FR-27) and payment alerts (FR-26)</strong>, beyond the order pushes the spike measured. P3 re-runs the spike with cart traffic added (10.2).</p>
<p>5. <strong>FR-23 adds a human step before the kitchen.</strong> QR-01 measures delivery to the staff screen, which still holds; the time a server takes to confirm is outside the system and is not measured.</p>
<p>6. <strong>Every MUST requirement reaches at least one component</strong>, and every requirement realised by UC-01, UC-03 and UC-07 is traced through analysis objects to a component.</p></td>
</tr>
</tbody>
</table>

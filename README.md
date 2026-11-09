# P2 sections owned by Xuan Mai Tran (@keasark)

> Commit this file from your own GitHub account on branch `p2/analysis-models` and open a pull request; another member reviews it.

## 5 Analysis Models



### 5.1 Conceptual domain model

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image3.png" style="width:6.9in;height:2.09448in" /></p>
<p><strong>Figure 3. Conceptual domain model (analysis), revised after the interview.</strong> Fifteen concepts with attributes and multiplicities, no operations and no technology. The payment gateway is outside our boundary and is not modelled: we keep only what it tells us (Payment.result and gatewayReference). A TableCheck groups every order of a table session (CR-11) and is what a Bill is drawn from; the Cart belongs to the table session, so all phones at the table share it (CR-17). A declined attempt is still a Payment, which is why a Bill has 0..* payments.</p></td>
</tr>
</tbody>
</table>

| **Item an actor supplies or reads** | **Use case step** | **Home in the domain model**                                      |
|-------------------------------------|-------------------|-------------------------------------------------------------------|
| table link (from the QR code)       | UC-01 (1)         | Table.tableLink                                                   |
| item, options, quantity, note       | UC-01 (3), (5)    | CartLine.chosenOptions, quantity, note → OrderLine                |
| order number, status, total         | UC-01 (14)        | Order.orderNumber, status, total                                  |
| status chosen, cancel reason        | UC-03 (2)–(6), 2a | StatusChange.newStatus, reason                                    |
| time since received                 | UC-03 (0)         | Order.receivedAt (elapsed time is derived)                        |
| amount due, orders covered          | UC-07 (2), (3)    | Bill.amountDue; Bill covers Order                                 |
| receipt: amount, time, reference    | UC-07 (7)         | Payment.amount, recordedAt, gatewayReference                      |
| card details                        | UC-07 (5)         | None — entered on the gateway's page only (CON-02)                |
| chosen language                     | UC-01 (2)         | TableSession.language; MenuItem name and description per language |
| allergens                           | UC-01 (4)         | MenuItem.allergens                                                |
| server's confirmation               | UC-03 (2)         | StatusChange (newStatus Received, by a StaffMember)               |
| cancelled line, reason              | UC-03 6a          | OrderLine.cancelled, cancelReason                                 |

### 5.2 Analysis objects

| **Object**     | **What it is for (one line)**                                                               | **Inside?** | **Domain concept**                  |
|----------------|---------------------------------------------------------------------------------------------|-------------|-------------------------------------|
| TableMenu      | Runs ordering and paying for one table on the diner's phone; in control of UC-01 and UC-07. | Inside      | TableSession                        |
| Table          | Says whether this table is taking orders.                                                   | Inside      | Table                               |
| Menu           | Holds the categories and items with prices and availability.                                | Inside      | Menu, MenuCategory                  |
| MenuItem       | Knows its price and how each option changes it.                                             | Inside      | MenuItem, Option                    |
| Cart           | Holds the lines every phone at the table has chosen and their total, until submitted.       | Inside      | Cart, CartLine                      |
| OrderBook      | Keeps every order, numbers new ones, and builds bills.                                      | Inside      | Order, OrderLine                    |
| StaffQueue     | The active orders as staff see them, grouped by table check, oldest first.                  | Inside      | TableCheck, Order (status ≠ Served) |
| Bill           | The unpaid orders of one table session and their total.                                     | Inside      | Bill                                |
| Payment        | One payment attempt and its result.                                                         | Inside      | Payment                             |
| PaymentGateway | Takes the card payment and reports the result.                                              | Outside     | — (supporting actor)                |

### 5.3 UC-01 Place Order — scenario table and analysis sequence diagram

**Trivial steps (no row):** (0) the card is physical; (3), (9) the customer only selects; (4), (10) show data the TableMenu already holds; (15) the customer reads. **Non-trivial:** (1)–(2) open the table and fetch the menu; (5)–(8) price and add a line; (11)–(14) check, record and queue the order.

| **Step** | **Subject** | **Subject action**                                               | **Other data / objects**                  | **Object acted upon** |
|----------|-------------|------------------------------------------------------------------|-------------------------------------------|-----------------------|
| 1        | Customer    | opens the menu for the table                                     | table link                                | TableMenu             |
| 2        | TableMenu   | asks whether the table is taking orders                          | table number                              | Table                 |
| 3        | TableMenu   | asks for the categories, items, prices and availability          | —                                         | Menu                  |
| 4        | TableMenu   | shows the table number, the menu and an empty cart               | menu                                      | Customer              |
| 5        | Customer    | chooses options, quantity and a note for an item                 | options, quantity, note                   | TableMenu             |
| 6        | TableMenu   | asks the item for its price with those options                   | options, quantity                         | MenuItem              |
| 7        | TableMenu   | shows the line price                                             | line price                                | Customer              |
| 8        | Customer    | adds the line to the cart                                        | —                                         | TableMenu             |
| 9        | TableMenu   | adds the line                                                    | item, options, quantity, note, line price | Cart                  |
| 10       | Cart        | recalculates the total                                           | lines                                     | Cart (itself)         |
| 11       | TableMenu   | shows the number of lines and the total                          | total                                     | Customer              |
| 12       | Customer    | submits the cart                                                 | —                                         | TableMenu             |
| 13       | TableMenu   | asks whether every item is still available                       | items in the cart                         | Menu                  |
| 14       | TableMenu   | asks whether the table still takes orders                        | table number                              | Table                 |
| 15       | TableMenu   | asks to record an order for the table                            | table number, lines, total                | OrderBook             |
| 16       | OrderBook   | gives the order the next number and status Awaiting confirmation | —                                         | OrderBook (itself)    |
| 17       | OrderBook   | places the order at the end of the queue                         | order                                     | StaffQueue            |
| 18       | TableMenu   | empties the cart                                                 | —                                         | Cart                  |
| 19       | TableMenu   | shows the confirmation: number, lines, total, status             | order number, status                      | Customer              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image4.png" style="width:6.9in;height:5.73317in" /></p>
<p><strong>Figure 4. UC-01 analysis sequence diagram.</strong> Messages 1–19 match the table rows one for one; each message name is a short form of that row's action. TableMenu is in control throughout; returns are dashed and unnumbered. Rows 10 and 16 are self-calls (case D). OrderBook stays active from message 15 until it returns the order number, after placing the order in the StaffQueue (17).</p></td>
</tr>
</tbody>
</table>

### 5.4 UC-07 Pay Bill — scenario table and analysis sequence diagram

**Trivial steps (no row):** (0) the status page already holds the orders; (8) the customer reads. **Outside our system (no row):** (5) the customer types card details on the gateway's page. **Non-trivial:** (1)–(4) build and show the bill; (6) record the result and mark orders paid; (7) show the receipt.

| **Step** | **Subject**    | **Subject action**                                 | **Other data / objects**                  | **Object acted upon** |
|----------|----------------|----------------------------------------------------|-------------------------------------------|-----------------------|
| 1        | Customer       | chooses to pay                                     | —                                         | TableMenu             |
| 2        | TableMenu      | asks for the bill of this table session            | table session                             | OrderBook             |
| 3        | OrderBook      | collects the unpaid orders and totals them         | unpaid orders                             | Bill                  |
| 4        | TableMenu      | shows the unpaid orders and the amount due         | bill                                      | Customer              |
| 5        | Customer       | confirms the amount                                | amount due                                | TableMenu             |
| 6        | TableMenu      | asks to take the amount for this bill              | amount, bill reference                    | PaymentGateway        |
| 7        | PaymentGateway | reports the payment approved                       | bill reference, gateway reference, amount | TableMenu             |
| 8        | TableMenu      | asks to record the payment on the bill             | bill, gateway reference, amount           | OrderBook             |
| 9        | OrderBook      | records an approved payment                        | amount, reference, time                   | Payment               |
| 10       | OrderBook      | marks the bill's orders Paid                       | bill                                      | Bill                  |
| 11       | TableMenu      | shows the receipt: amount, time, reference, orders | payment                                   | Customer              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><img src="media/image5.png" style="width:6.9in;height:4.13865in" /></p>
<p><strong>Figure 5. UC-07 analysis sequence diagram.</strong> Messages 1–11 match the table rows; names are short forms of each row's action. The PaymentGateway is outside our boundary: we send it the amount (6) and it reports the result (7); its card handling is not modelled. Orders become Paid only at 10, after an approved result (FR-17).</p></td>
</tr>
</tbody>
</table>

### 5.5 Consistency cross-checks K1 to K6

| **Check** | **Rule \[R7\]**                                                                                     | **UC-01**         | **UC-07**      |
|-----------|-----------------------------------------------------------------------------------------------------|-------------------|----------------|
| K1        | Every non-trivial use-case step has a scenario row; trivial ones do not                             | Pass after D3     | Pass           |
| K2        | Every item supplied or shown has a home in an object's responsibility                               | Pass after D1, D9 | Pass after D4  |
| K3        | Every subject and receiver is in the object list, and every listed object is used                   | Pass after D5     | Pass           |
| K4        | One row, one message; message numbers equal step numbers                                            | Pass (19 = 19)    | Pass (11 = 11) |
| K5        | Activation ends when the object finishes; returns dashed and unnumbered; no message above its cause | Pass after D6     | Pass           |
| K6        | No technology in object or message names; outside services stay outside                             | Pass              | Pass after D7  |

**Defect log**

| **\#** | **Check** | **Who disagreed**             | **What disagreed**                                                                            | **Decision**                                                 |
|--------|-----------|-------------------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| D1     | K2        | Use case ↔ domain model       | UC-01 (5) lets the customer type a note; no concept held it.                                  | Added note to CartLine and OrderLine.                        |
| D2     | K2        | Use case ↔ domain model       | UC-03 2a asks for a cancel reason; nowhere to keep it.                                        | Added StatusChange.reason.                                   |
| D3     | K1        | Use case ↔ table              | First table had a row for step (4), which only shows data TableMenu already holds.            | Step (4) marked trivial; row removed and rows renumbered.    |
| D4     | K2        | Use case ↔ object list        | The receipt shows a gateway reference; no inside object kept it.                              | Added gatewayReference to Payment.                           |
| D5     | K3        | Object list ↔ table           | "StaffScreen" was listed but never acted upon.                                                | Removed; StaffQueue is the receiver.                         |
| D6     | K5        | Table ↔ diagram               | OrderBook's bar ended at 16, before it returned the order number.                             | Bar extended to the return after 17.                         |
| D7     | K6        | Object list ↔ diagram         | First draft named the gateway "StripeCheckout" and drew a balance on it.                      | Renamed PaymentGateway, marked outside; no balance modelled. |
| D8     | K3        | Diagram ↔ P1 use case diagram | P1 diagram said payment would not be built, but FR-16/17 and UC-07 need it.                   | CR-03 replaced the P1 diagram.                               |
| D9     | K2        | Use case ↔ domain model       | After the interview, UC-01 (2) offers a language and (4) shows allergens; neither had a home. | Added TableSession.language and MenuItem.allergens.          |
| D10    | K2        | Use case ↔ domain model       | UC-03 6a cancels one line, but cancellation lived only on Order.                              | Added OrderLine.cancelled and cancelReason.                  |

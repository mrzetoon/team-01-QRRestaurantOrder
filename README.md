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
<img width="2027" height="869" alt="conceptual_domain_model" src="https://github.com/user-attachments/assets/54a1eb6b-6c57-4a65-9f61-3529e91d63bd" />
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

<img width="771" height="446" alt="Screenshot 2026-11-08 at 20 12 11" src="https://github.com/user-attachments/assets/f37efa12-9473-4f8a-b228-0810b809ee80" />


### 5.3 UC-01 Place Order — scenario table and analysis sequence diagram

**Trivial steps (no row):** (0) the card is physical; (3), (9) the customer only selects; (4), (10) show data the TableMenu already holds; (15) the customer reads. **Non-trivial:** (1)–(2) open the table and fetch the menu; (5)–(8) price and add a line; (11)–(14) check, record and queue the order.
<img width="1650" height="953" alt="member04_UC-01_scenario_table" src="https://github.com/user-attachments/assets/9a2e96a6-5f1b-429b-8374-28facde3b973" />

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<img width="1607" height="979" alt="member04_UC-01_sequence_diagram" src="https://github.com/user-attachments/assets/5b2485f1-83ec-45cc-a1ca-6ddff83debf2" />

<p><strong>Figure 4. UC-01 analysis sequence diagram (revised). Messages 1–24 correspond to the revised scenario table rows one for one; each message name is a shortened form of the corresponding action. The Customer interacts directly with TableMenu, eliminating the Table and TableSession objects from the sequence diagram. TableMenu controls the main ordering process from message 1 through message 24, while returns are represented by dashed, unnumbered arrows. TableMenu retrieves the menu categories, items, options, and empty cart (4–7), displays the menu to the Customer (8), and handles item selection and pricing (9–12). The Customer adds the selected item to the cart (13), and TableMenu forwards the request to Cart (14). Cart creates a CartLine (15) and recalculates its total through a self-call (16, case D). When the Customer submits the order (18), TableMenu performs an internal session validation (19) before requesting Cart to process the order (20). Cart creates the Order (21), and Order creates an OrderLine for each cart line (22). TableMenu directly notifies the Employee of the new order (23) and confirms the order number, status, and total to the Customer (24). Bill and Payment are not included because they are outside the scope of UC-01.</p></td>
</tr>
</tbody>
</table>

### 5.4 UC-07 Pay Bill — scenario table and analysis sequence diagram

**Trivial steps (no row):** (0) the status page already holds the orders; (8) the customer reads. **Outside our system (no row):** (5) the customer types card details on the gateway's page. **Non-trivial:** (1)–(4) build and show the bill; (6) record the result and mark orders paid; (7) show the receipt.</p></td>
<img width="693" height="274" alt="member04_UC-07_scenario_table" src="https://github.com/user-attachments/assets/ff81ee59-f292-4028-b4b6-620d3b07b76e" />


<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<img width="1620" height="1010" alt="member04_UC07_sequence_diagram" src="https://github.com/user-attachments/assets/24ed8666-e1c0-4f4c-b7dd-1750eb773991" />

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

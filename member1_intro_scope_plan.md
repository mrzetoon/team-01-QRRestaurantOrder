# P1 sections — Member 1 — Project manager

> Draft content for the P1 document. Upload this file from **your own** GitHub account.

## 1.1 Purpose of this document and of the system

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>This document is the Phase 1 (P1) proposal and requirements baseline for the QR Code Restaurant Menu &amp; Ordering System (QRMOS). It follows the section order of ISO/IEC/IEEE 29148 [R1] and is written to provide a detailed report to the restaurant manager to support their decision. It will grow into the full software requirements specification at P2.</p>
<p>QRMOS addresses the wait and the errors in ordering at a sit-down restaurant. A diner currently waits for a server to bring a menu, waits again to place the order, and depends on the server copying it correctly onto a ticket for the kitchen; at busy times this is where most delay and wrong orders come from. Printed menus also cannot show that an item has sold out or that a price has changed. QRMOS lets a diner scan a QR code on the table, read the current menu on their own phone, customize items, and send the order straight to the staff, tagged with the table number. Staff see orders arrive in real time and update their status; the manager keeps the menu current. The problem belongs mainly to diners (waiting), servers and kitchen staff (transcription and running back and forth), and the owner (slow table turnover and menu reprinting costs).</p></td>
</tr>
</tbody>
</table>

## 1.2 Scope

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

## 4.1 Team roles and working agreement

| **Team member**        | **Role for P1 to P2**                                                                              | **How the team makes a decision when it disagrees**                                                                                                                                                                              |
|------------------------|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mohmmad Abuzetoon      | Project manager and repository owner; editor of the final document                                 | Discuss in the weekly meeting or on the team chat. If there is no agreement within 24 hours, majority vote; on a tie, the owner of the affected section decides. Every decision is logged as a GitHub issue labelled "decision". |
| Rafay Alvi             | Functional requirements lead and change control                                                    | Same rule (agreed by all, /docs/team-agreement.md)                                                                                                                                                                               |
| Len Isherwood          | Quality and constraint requirements lead; runs the technical spike                                 | Same rule (agreed by all, /docs/team-agreement.md)                                                                                                                                                                               |
| Xuan Mai Tran          | Modelling lead: diagrams and UC-01; leads P2 design models                                         | Same rule (agreed by all, /docs/team-agreement.md)                                                                                                                                                                               |
| Eshitasri Punuganti    | Use cases and traceability; leads P2 architecture comparison                                       | Same rule (agreed by all, /docs/team-agreement.md)                                                                                                                                                                               |
| Isaiah Bueno-Hernandez | Elicitation and review lead: stakeholder interviews, feasibility, open questions, review checklist | Same rule (agreed by all, /docs/team-agreement.md)                                                                                                                                                                               |

## 4.2 Plan to P2

| **Date** | **What will be finished**                                                                       | **Owner**              |
|----------|-------------------------------------------------------------------------------------------------|------------------------|
| 18 Oct   | P1 submitted on Canvas as one PDF                                                               | Mohmmad Abuzetoon      |
| 23 Oct   | Interview with a restaurant manager and a server; notes in /docs/elicitation                    | Isaiah Bueno-Hernandez |
| 25 Oct   | Technical spike: QR scan → menu → order appears live on a second screen (/spike-01)             | Len Isherwood          |
| 27 Oct   | Q1–Q4 answered or re-dated; requirements revised under change control; revision history updated | Rafay Alvi             |
| 1 Nov    | Two candidate architectures compared and one chosen (P2, Chapter 8)                             | Xuan Mai Tran          |
| 4 Nov    | Class, sequence and state diagrams drafted for UC-01 and UC-03                                  | Eshitasri Punuganti    |
| 6 Nov    | Internal review of the P2 document against the rubric                                           | Isaiah Bueno-Hernandez |
| 8 Nov    | P2 submitted                                                                                    | Mohmmad Abuzetoon      |

## 4.3 Risks

| **\#** | **Risk**                                                                                       | **Likelihood** | **Impact** | **Mitigation — action and owner**                                                                                                                                            |
|--------|------------------------------------------------------------------------------------------------|----------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1     | No restaurant agrees to an interview, so stakeholder needs stay assumptions.                   | Medium         | High       | Isaiah Bueno-Hernandez contacts three local or campus restaurants by 20 Oct; fallback is interviewing two students who have worked in restaurants by 25 Oct.                 |
| R2     | Live order updates do not work on the chosen cloud host (connections time out or are blocked). | Medium         | High       | Len Isherwood builds the 25 Oct spike on the real free host; if WebSockets fail, switch to 3-second polling, which still meets QR-01.                                        |
| R3     | Scope creep — split bills, POS integration or loyalty get added.                               | Medium         | Medium     | Rafay Alvi runs change control: a new requirement needs an issue and a team vote, and is checked against the out-of-scope list in 1.2.                                       |
| R4     | A member becomes unavailable or contribution becomes uneven.                                   | Medium         | High       | Mohmmad Abuzetoon reviews the issue board every Monday, reassigns any task more than 3 days overdue, and reports persistent problems to the instructor as the syllabus asks. |
| R5     | Labour runs over the estimate (more than 600 hours), pushing cost toward the budget ceiling.   | Low            | Medium     | Xuan Mai Tran measures load time on the deployed site weekly from 1 Nov; if it fails, add a keep-alive ping or move to another free host.                                    |

## 4.4 Repository and tooling

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Repository:</strong> https://github.com/mrzetoon/team-01-QRRestaurantOrder (owner @mrzetoon; instructor and TA added as collaborators: <mark>[GitHub usernames]</mark>).</p>
<p><strong>Branches:</strong> main is protected and only changes through pull requests; work happens on feature/&lt;issue-number&gt;-&lt;short-name&gt;. Each pull request needs one review from another member before merge.</p>
<p><strong>Commits:</strong> start with the requirement or issue they touch, e.g. "FR-07: tag order with table number (#12)".</p>
<p><strong>Issues:</strong> every task, requirement change and team decision is an issue, labelled requirement, doc, bug, spike or decision, with an assignee and due date.</p>
<p><strong>Folders:</strong> /docs (P1–P3 documents, diagrams, elicitation notes, meeting minutes), /spike-01, /src (from P2).</p></td>
</tr>
</tbody>
</table>

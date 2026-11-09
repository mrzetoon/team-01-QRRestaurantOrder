# P1 sections — Member 3 — Quality and Constraints Lead

## 2.4   Constraints
<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p> 

**C1 — Web application, no install.** Customers must reach the menu through a phone web browser; no native app. Source: project definition agreed by the team and stated in our proposal.

**C2 — Time.** The system must be specified, designed, built and tested within the Fall 2026 term (particularly, 2 months), by the P3 deadline. Source: syllabus [R2].

**C3 — Budget of $8000 - $75,000 (depends on case-by-case).** hosting and open-source libraries may be used. Source: QR Code Ordering System for Restaurant Businesses (S6). 

**C4 — No card data.** The system must not collect, transmit or store payment card numbers. Source: scope decision in 1.2 and PCI DSS [R5].

**C5 — Instructor access.** All source code and documents must live in a repository the instructor can open. Source: P1 template section 4.4 [R2].
</tr>
</tbody>
</table>

## 3.2   Quality Requirements
| **ID** | **Requirement — with threshold, condition and method** | **Priority** | **Source** | **How it will be verified** |
|--------|--------------------------------------------------------|--------------|------------|-----------------------------|
| QR-01 | Performance. 95% of submitted orders shall appear on an open staff order screen within 3 seconds of submission, under 20 tables ordering at the same time. | MUST | S2, S3 | Scripted test sends 100 orders from 20 simulated clients; compare submit and display timestamps; pass if ≥ 95 are ≤ 3 s. |
| QR-02 | Performance. The customer menu shall show its first category of items within 3 seconds of opening a table URL in 95% of loads on a mid-range phone over a 4G connection. | MUST | S1 | 20 loads with Chrome DevTools "Fast 4G" throttling and a mid-range phone profile; record time to first item. |
| QR-03 | Usability. At least 8 of 10 first-time users shall place an order of 2 items, one with an option chosen, in under 2 minutes without help. | SHOULD | S1 | Moderated test with 10 students outside the team; timed from scan to confirmation screen; results in /docs/usability. |
| QR-04 | Accessibility. The customer menu, cart and confirmation pages shall meet WCAG 2.1 Level AA [R3]. | SHOULD | S1, R3 | Zero serious/critical issues reported by axe DevTools, plus a full order completed using VoiceOver and TalkBack. |
| QR-05 | Security. 100% of staff and manager server endpoints shall reject requests without a valid session, and manager-only endpoints shall reject Staff-role sessions. | MUST | S4 |Automated test calls every endpoint logged-out, as Staff and as Manager; pass only if every expected 401/403 is returned. |
| QR-06 | Availability. The system shall be reachable at least 99% of the time during a 7-day trial from 11:00 to 22:00 daily. | COULD | S4 |Free uptime monitor checks the menu URL every 5 minutes; uptime % computed from its log. |

## 3.3   Constraint requirements
| **ID** | **Constraint — one sentence** | **Source** | **Why it cannot be negotiated** |
|--------|-------------------------------|------------|---------------------------------|
| CON-01 | The customer interface shall run in the phone's web browser without installing any app. | C1 | It is the defining idea of the product; a diner will not install an app for one meal. |
| CON-02 | The system shall not collect, transmit or store payment card data. | C4, R5 | Handling card data triggers PCI DSS compliance the team cannot meet. |
| CON-03 | All source code and documents shall be kept in a repository the instructor can access. | C5, R2 | Required by the course for grading and contribution evidence. |



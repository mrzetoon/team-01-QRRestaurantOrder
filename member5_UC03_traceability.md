# P1 sections — Member 5 — Use cases & traceability

> Draft content for the P1 document. Upload this file from **your own** GitHub account.

## 3.5 Requirements to use case traceability

| **Requirement ID** | **Use case(s) that realise it**                | **If blank — why, and what you will do**                                                                      |
|--------------------|------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| FR-01              | UC-06 (used by UC-01)                          |                                                                                                               |
| FR-02              | UC-01                                          |                                                                                                               |
| FR-03              | UC-01                                          |                                                                                                               |
| FR-04              | UC-01, UC-04                                   |                                                                                                               |
| FR-05              | UC-01                                          |                                                                                                               |
| FR-06              | UC-01                                          |                                                                                                               |
| FR-07              | UC-01                                          |                                                                                                               |
| FR-08              | UC-01                                          |                                                                                                               |
| FR-09              | UC-03                                          |                                                                                                               |
| FR-10              | UC-03                                          |                                                                                                               |
| FR-11              | UC-02                                          | Only requirement behind UC-02. If UC-02 fails, FR-11 does not show up / appear.                               |
| FR-12              | UC-05                                          |                                                                                                               |
| FR-13              | UC-04                                          |                                                                                                               |
| FR-14              | Log In «include» of UC-03, UC-04, UC-05, UC-06 |                                                                                                               |
| FR-15              | UC-06, UC-01 (alt 2a)                          | Added in this revision — see below.                                                                           |
| FR-16              | UC-07                                          |                                                                                                               |
| FR-17              | UC-07                                          |                                                                                                               |
| QR-01 … QR-06      | —                                              | Non-functional by design: they constrain UC-01 and UC-03 rather than realise a use case, so they stay in 3.2. |

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

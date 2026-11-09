# P2 sections — Member 3 — Quality and Constraints Lead

## 8   Prototype Evidence 
<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p> 

**Question.** Can a new order reach the staff screen within 3 seconds for 95% of orders while 20 tables order at once, and does polling every 3 seconds also meet that (as P1 risk R2 assumed)? 

**Spike.** /spikes/spike-01-live-orders (owner Len Isherwood): a throw-away order server and a benchmark that sends 100 orders from 20 simulated tables (all 20 within 1 s of each other, five rounds) to one staff screen fed by push and one fed by polling, with 0, 80 and 150 ms of simulated one-way network delay. Three runs per setting; raw results in results.jsonl [R8]. 
</tr>
</tbody>
</table>
 

| **One-way delay** | **Push p95** | **Push within 3 s** | **Poll 3 s p95** | **Poll 3 s within 3 s** | **Poll 1 s p95** | **Poll 1 s within 3 s** |
|-------------------|--------------|---------------------|------------------|-------------------------|------------------|-------------------------|
| 0 ms              | 5 ms         | 100%                | 2,705 ms         | 100%                    | —                | —                       |
| 80 ms             | 164 ms       | 100%                | 3,037 ms         | 93%                     | —                | —                       |
| 150 ms            | 304 ms       | 100%                | 3,558 ms         | 44%                     | 1,517 ms         |100%                     |

 

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>
 
 **Result.** Push meets QR-01 with a wide margin; 3-second polling does not once real network delay is added (93% and 44% within 3 s, below the 95% target); 1-second polling does. 

**What it changed.** ADR-02 keeps push (confirmed) and changes the fallback from 3-s to 1-s polling (changed). Risk R2 and its mitigation were corrected (CR-07). 

**Limits.** Measured on one machine with simulated delay, without a database in the path, on 29 Oct 2026. P3 repeats the measurement on the deployed host with the real database (10.2). 
</tr>
</tbody>
</table>

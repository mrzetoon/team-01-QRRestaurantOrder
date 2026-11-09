# Spike 01 — Can new orders reach the staff screen within 3 seconds?

**Owner:** Len Isherwood · **Time box:** 1 day · **Linked to:** QR-01, QAS-1, ADR-02, risk R2

## The question
QR-01 requires 95% of orders to appear on an open staff screen within 3 seconds while 20 tables order at once.
P1 risk R2 assumed that if push updates failed we could fall back to polling every 3 seconds "which still meets QR-01".
This spike checks both claims with numbers.

## What we built
- `server.js` — a throw-away order server: `POST /orders` records an order in memory and pushes it over a WebSocket (`/live`) to every open staff screen; `GET /orders?after=N` returns newer orders for polling clients.
- `bench.js` — 20 simulated tables × 5 rounds = 100 orders. In each round all 20 tables submit within 1 second of each other. One simulated staff screen receives orders by **push**, another by **polling**. `NET_MS` adds a simulated one-way network delay (phone → server, server → tablet).
- Latency = time from "customer presses Submit" to "order visible on the staff screen".

## How to run
```
npm install
NET_MS=80 node bench.js                 # 3-second polling, 80 ms one-way delay
NET_MS=150 POLL_MS=1000 node bench.js   # 1-second polling, 150 ms delay
```
Raw output of every run is in `results.jsonl` (3 runs per setting, 100 orders each).

## Result (median of 3 runs, milliseconds)

| One-way network delay | Push p95 | Push within 3 s | Poll every 3 s p95 | Poll 3 s within 3 s | Poll every 1 s p95 | Poll 1 s within 3 s |
|---|---|---|---|---|---|---|
| 0 ms (same machine) | 5 | 100% | 2,705 | 100% | – | – |
| 80 ms (typical 4G/Wi-Fi) | 164 | 100% | 3,037 | 93% | – | – |
| 150 ms (slow mobile) | 304 | 100% | 3,558 | 44% | 1,517 | 100% |

## What it means
1. **Push meets QR-01 with a wide margin** (p95 ≈ 0.3 s even at 150 ms delay), so ADR-02 keeps push as the main channel. **Confirmed.**
2. **Polling every 3 seconds does NOT meet QR-01** once real network delay is added (93% and 44% within 3 s, below the 95% target). The P1 fallback in risk R2 was wrong. **Changed:** the fallback in ADR-02 is now polling every **1 second**, which met QR-01 in all runs at 150 ms delay.

## Limits (what this spike does not show)
- Delay is simulated with timers on one machine; measured in the team's development container on 29 Oct 2026 (Node v22.22.0). Re-run against the deployed host before P3 (task in plan 10.1).
- No database write is included; P3 must re-measure with the real database in the path.
- Not production code: no authentication, validation or persistence. Do not reuse it in `/src`.

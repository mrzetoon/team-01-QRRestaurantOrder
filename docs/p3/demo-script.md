# P3 demonstration — run sheet

Scenario: Table 3 orders (UC-01) → staff process it (UC-03) → the table pays (UC-07).
Rehearse once, standing, with a clock. 8–10 minutes, then questions.

## The night before (on the presenting laptop)
- [ ] Fresh clone, `npm install`, then the whole scenario once.
- [ ] Record the scenario (screen recording, offline) as the fallback.
- [ ] Slides as PDF and in their own format on the laptop.
- [ ] Everyone has read their §8 entry, §4.7 and §5.2.

## Ten minutes before
```bash
# set your own passwords; never show this terminal on the projector
export SEED_MANAGER_PASSWORD='…' SEED_STAFF_PASSWORD='…'
npm run demo          # reseeds the demo data and starts the server; prints the table links
```
- Window A (narrow, "phone 1") and window B (narrow, "phone 2"): the **Table 3** link.
- Window C (wide, "staff tablet"): `/staff`, log in as `server1` (password pasted from a file).
- Browser zoom 125–150 %. Notifications off. Other tabs closed. Repository open in one tab.

## Live run (3–4 minutes)
1. Phone 1: Beef Burger → **Large** → quantity 2 → note "no onions" → Add. *(FR-05, line price from the server)*
2. Phone 2 (same table): Mint Lemonade → Add. Phone 1's cart bar updates by itself. *(FR-27, ADR-05, C7 push)*
3. Phone 1: open cart → Submit. Confirmation shows order **#101**, "Awaiting confirmation". *(FR-08, FR-23)*
4. Staff tablet: #101 is already there, table 3, with the note — no reload. *(FR-09, QR-01; point at "● live")*
5. Show **Kitchen** view: #101 is not there yet. Back to **Servers** → Confirm. Kitchen now shows it. *(FR-23)*
6. Kitchen: Start preparing → Ready. Phone 1 → **My orders**: status changed by itself. *(FR-11)*
7. Phone 1 → Pay → sandbox gateway page (say: "this page is the stand-in for the restaurant's provider") → Approve.
   Receipt shows amount, time and reference. *(FR-16, FR-17, FR-20, CON-02)*
8. If time allows: a second order from table 4, Pay → **Decline** → red alert on the staff tablet. *(FR-26)*

Connect what the room saw to evidence (slide 8): FR-09 → C6 `submit` → C7 `publish` → `src/live/hub.js` → test T26 → status PARTIAL (one machine only).

## If the live run fails
Say so, switch to the recording, and say what failed. Never present the recording as live.

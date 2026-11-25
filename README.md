# QR Code Restaurant Menu & Ordering System (QRMOS)

CS 3354 Software Engineering · Fall 2026 · Team 01 · Section 003
Repository: https://github.com/mrzetoon/team-01-QRRestaurantOrder

Diners scan the QR code on their table, browse the menu in English or Spanish, build one cart
shared by everyone at the table, and send the order to the staff queue. Servers confirm it, the
kitchen moves it through Preparing and Ready, and the table pays on a hosted payment page.

## Run it from a clean clone

Prerequisite: **Node.js 22.5 or newer** (uses the built-in `node:sqlite`; nothing else to install).
Check with `node --version`.

```bash
git clone https://github.com/mrzetoon/team-01-QRRestaurantOrder.git
cd team-01-QRRestaurantOrder
npm install
npm run seed            # creates ./data/qrmos.db: demo menu, 6 tables, accounts "manager" and "server1"
npm start               # http://localhost:3000
```

`npm run seed` prints a generated password for each account once. To choose them yourself:

```bash
SEED_MANAGER_PASSWORD='choose-one' SEED_STAFF_PASSWORD='choose-another' npm run seed -- --reset
```
(Windows PowerShell: `$env:SEED_MANAGER_PASSWORD='choose-one'; $env:SEED_STAFF_PASSWORD='choose-another'; npm run seed -- --reset`)

`npm start` prints the staff, manager and table links. Open a table link on a phone or in a
narrow browser window to order; open `/staff` on another window and log in as `server1`.

**Phones on the same Wi-Fi:** start with `BASE_URL=http://<your-laptop-ip>:3000 npm start` so the
QR codes on the manager page point at your laptop instead of `localhost`.

| Setting (environment variable) | Default | Meaning |
|---|---|---|
| `PORT` | 3000 | HTTP port |
| `BASE_URL` | `http://localhost:<PORT>` | Address encoded in QR codes and payment return links |
| `DB_FILE` | `./data/qrmos.db` | SQLite database file (git-ignored) |
| `PAYMENT_WEBHOOK_SECRET` | random per run | Shared secret for the payment gateway's signed results |
| `SEED_MANAGER_PASSWORD`, `SEED_STAFF_PASSWORD` | generated | Used only by `npm run seed` |

No password, key or secret is stored in this repository.

## Tests and measurements

```bash
npm test          # 49 tests (48 pass, 1 marked TODO = known defect K1)
npm run coverage  # same suite with line/branch coverage of src/
npm run mutation  # Stryker mutation testing of the six server modules (about 20 minutes)
npm run perf      # QR-01 benchmark: 20 tables x 5 rounds = 100 orders, push vs 1-s polling
```

## Layout

```
src/            server (one Node.js process, ADR-01)
  access/       C3 Access Control      logins, sessions, roles
  menu/         C4 Menu Manager        items, options, availability, Spanish text, allergens
  tables/       C5 Table & QR Manager  tables, links, QR images
  orders/       C6 Order Manager       shared cart, orders, statuses, checks, bills
  live/         C7 Live Update Hub     WebSocket push + 1-s polling fallback
  payment/      C8 Payment Adapter     hosted checkout + signed webhook; sandbox gateway
  data/         C9 Data Store          SQLite schema, demo seed data
  app.js        wiring and HTTP routes;  server.js  entry point
public/         browser apps: customer/ (C1), staff/ and manager/ (C2), shared/
tests/          unit/, api/, acceptance/, live/ (node:test), helpers/
perf/           QR-01 benchmark and its results
scripts/        seed.js
docs/           p1/, p2/, p3/ documents; elicitation/, meetings/, ai-log.md
spikes/         spike-01-live-orders (P2)
```

## Team

| Member | GitHub | P3 ownership |
|---|---|---|
| Mohmmad Abuzetoon | @mrzetoon | app wiring, C5 tables, seed, manager page and tests, README, P3 §0–1, §6–7, release |
| Rafay Alvi | @MuhammadAlvi03 | C1 customer web app, customer acceptance tests, P3 §2 |
| Eshitasri Punuganti | @peshi24 | C2 staff web app, staff acceptance tests, P3 §5 traceability |
| Xuan Mai Tran | @keasark | C4 menu, C6 order manager and their unit tests, P3 §3.2–3.3 |
| Isaiah Bueno-Hernandez | @buenoisaiah006-bit | C3 access, C8 payment, C9 schema and their tests, mutation set-up, test evidence, P3 §4 |
| Len Isherwood | @ApePerson | C7 live hub (server and client), live tests, QR-01 benchmark |

# ShopLedger Agent Instructions

## Stack

- CommonJS Node.js application using Express 4 and body-parser.
- Entry point: `server.js`; static UI: `public/`.
- Persistence: synchronous JSON file I/O through `lib/store.js` to `data/db.json`.
- No test files, lockfile, linter configuration, or formatter configuration are currently present.

## Module map

- `routes/products.js` — product and active-coupon API routes.
- `routes/orders.js` — order listing, creation, lookup, and cancellation routes.
- `routes/customers.js` — customer listing and Khata settlement routes.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export routes.
- `lib/coupons.js` — coupon normalization, validation, calculation, and listing.
- `lib/dates.js` — current dates, date normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, stock checks, reservation, release, and summaries.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotals, discounts, and checkout totals.
- `lib/reports.js` — dashboard summaries and GST reconciliation.
- `lib/store.js` — JSON database read/write and audit-log updates.
- `lib/tax.js` — GST-rate lookup, slab percentage, and CGST/SGST splitting.

## Commands

- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (no test files currently exist).

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).

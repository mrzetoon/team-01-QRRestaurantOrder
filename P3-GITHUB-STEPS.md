# P3 — how each member commits their part (so the individual 20 points count)

Due **Wednesday 9 December 2026, 11:59 PM Central**. The grader checks your own commits, your own pull
request (PR), and at least one review you gave on a teammate's PR — as the repository stood at the deadline.

## Before you upload: read and run your files
Every file was first drafted with an AI tool from our P2 design (declared in §9 of the P3 document and in
`docs/ai-log.md`). At the demonstration **you** will be asked to explain your files and a part you did not
write. "The AI wrote it" is not an answer. So, before you upload:
1. Read every file in your folder. Change anything you would do differently.
2. If you have Node.js 22.5+: after everything is merged, run `npm install` and `npm test`.
3. Write your own §8 entry and fill your §9 row ("how the output was verified") in your own words.

## Everyone (website only)
1. Unzip your `<name>-p3-upload.zip`. It holds folders laid out exactly like the repository.
2. On GitHub open the repository root → **Add file → Upload files** → drag the **folders** from your unzipped
   copy (for example `src` and `tests`) from your file window. Do not use "choose your files" — it drops folders.
3. Choose **"Create a new branch for this commit and start a pull request"**, name it as below, then
   **Propose changes → Create pull request**.
4. Ask the reviewer named below. Reviewers: **Files changed → Review changes → Approve** with a real comment
   (what you read or ran).
5. After approval, the author clicks **Merge pull request**.
6. Put your commit hash(es) and PR number in §0.2 of the document.

| Member | What is in your zip | Branch | Reviewer |
|---|---|---|---|
| Isaiah | `src/data/db.js`, `src/access/`, `src/payment/`, `tests/api/`, `stryker.conf.json`, `docs/p3/evidence/` | `p3/access-payment-data` | Xuan Mai |
| Xuan Mai | `src/menu/`, `src/orders/`, `tests/unit/` | `p3/menu-orders` | Isaiah |
| Len | `src/live/`, `public/shared/live.js`, `tests/live/`, `perf/`, `docs/p3/diagrams/` | `p3/live-hub` | Eshitasri |
| Mohmmad | `package.json`, `package-lock.json`, `.gitignore`, `README.md`, `P3-GITHUB-STEPS.md`, `src/app.js`, `src/server.js`, `src/errors.js`, `src/tables/`, `src/data/seed.js`, `scripts/`, `public/manager/`, `tests/helpers/`, `tests/acceptance/manager.test.js`, `docs/ai-log.md`, `docs/p3/demo-script.md` | `p3/app-tables` | Len |
| Rafay | `public/customer/`, `public/shared/style.css`, `tests/acceptance/customer.test.js` | `p3/customer-app` | Mohmmad |
| Eshitasri | `public/staff/`, `public/login.html`, `tests/acceptance/staff.test.js` | `p3/staff-app` | Rafay |

Merge in the order of the table if you can. `npm test` passes only once **all six** PRs are merged, because
the server wires every module together.

## Mohmmad only — the release
1. When all six PRs are merged, one member who did not write the README follows it on their own machine from an
   empty folder and pastes the terminal session into Appendix B.
2. Save the final document as PDF (no "DRAFT" in the name). Upload the PDF and .docx to `docs/p3/` on `main`.
3. **Releases → Draft a new release → Choose a tag → `p3` → Create new tag → target `main` → Publish release.**
4. Upload **the same PDF** to Canvas. Only Mohmmad uploads.

## Never commit
Passwords, the payment webhook secret, the `data/` folder (the database), or anyone's personal data.
`.gitignore` already excludes `data/`, `node_modules/`, `coverage/` and `reports/`.

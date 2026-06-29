# ParaBank Playwright Test Suite

End-to-end test automation for [https://parabank.parasoft.com/parabank](https://parabank.parasoft.com/parabank), written in TypeScript with Playwright.

---

## Setup & Execution

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install dependencies

```bash
npm install
npx playwright install --with-deps chromium
```

### Run all tests

```bash
npm test
```

### Run specific suites

```bash
npm run test:e2e        # Core banking flow only
npm run test:negative   # Negative scenarios only
npm run test:headed     # Watch tests run in a browser window
```

### View HTML report

```bash
npm run test:report
```

---

## Project Structure

```
parabank-playwright/
├── pages/                    # Page Object Models
│   ├── RegistrationPage.ts
│   ├── LoginPage.ts
│   ├── AccountsPage.ts
│   └── TransferPage.ts
├── tests/
│   ├── banking-flow.spec.ts  # 9-step core E2E flow
│   └── negative-scenarios.spec.ts
├── utils/
│   ├── apiHelper.ts          # REST API wrapper
│   ├── testData.ts           # Data factory / constants
│   └── types.ts              # Shared TypeScript interfaces
├── playwright.config.ts
└── tsconfig.json
```

---

## Core Flow (banking-flow.spec.ts)

| # | Step | Method |
|---|------|--------|
| 1 | Register new user | UI |
| 2 | Login | UI |
| 3 | Get customer ID | API |
| 4 | Get existing account | API |
| 5 | Create new CHECKING account | API (curl-equivalent POST) |
| 6 | Verify new account appears | UI |
| 7 | Transfer money between accounts | UI |
| 8 | Validate updated balances | API |
| 9 | Logout | UI |

---

## Negative Scenarios (negative-scenarios.spec.ts)

1. **Invalid credentials** – login rejected, user stays on login page
2. **Duplicate username** – registration shows username-taken error
3. **Overdraft transfer** – excessive transfer amount is rejected
4. **API bad password** – REST login returns an error response
5. **Non-existent customer** – accounts endpoint returns 404/500
6. **Empty registration form** – client-side validation fires

---

## Tradeoffs

| Decision | Rationale |
|----------|-----------|
| **Sequential test steps** (no `fullyParallel`) | The E2E flow has hard data dependencies (customerId → accountId → transfer). Parallelism would require isolated test state per worker, which adds complexity for a single suite. |
| **State shared via module-level `let` variables** | Simpler than fixtures for a linear flow. In a larger suite, a shared fixture with `scope: 'test'` would be preferable to avoid pollution. |
| **No `.env` / secrets management** | Credentials are generated at runtime from `Date.now()`. A real project would use `dotenv` + CI secrets for a stable test account. |
| **Single browser (Chromium)** | Satisfies the assignment scope. Cross-browser coverage (`webkit`, `firefox`) is trivially added to `playwright.config.ts`. |
| **API helper uses Playwright's `request` fixture** | Avoids a second HTTP library (`axios`, `got`). Keeps the dependency surface minimal. |

---

## Assumptions

1. **ParaBank is publicly accessible** and its state is ephemeral enough that newly registered users won't collide (mitigated by `Date.now()` suffix on usernames).
2. **A newly registered user always gets at least one SAVINGS account** by default. The flow relies on this to have a source account for the transfer.
3. **"Using a curl command"** in step 5 means issuing an API call programmatically (the same HTTP POST a `curl` would make) rather than literally shelling out to `curl`. This is idiomatic in a Playwright test suite.
4. **Balance assertions use `toBeCloseTo`** to tolerate floating-point rounding in the API response.
5. **The site's HTML selectors are stable** as of the time of writing. Locators use `id` and `name` attributes rather than CSS classes to reduce brittleness.

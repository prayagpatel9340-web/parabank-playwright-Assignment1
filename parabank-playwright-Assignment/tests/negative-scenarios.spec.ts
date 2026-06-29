import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { TransferPage } from '../pages/TransferPage';
import { ApiHelper } from '../utils/apiHelper';
import { generateUser } from '../utils/testData';

/**
 * Negative Test Scenarios
 *
 * 1. Login with invalid credentials → error shown, no session
 * 2. Register with duplicate username → error shown
 * 3. Transfer with amount exceeding balance → error shown
 * 4. API login with wrong password → 500/error response
 * 5. Get accounts for non-existent customer → 404 response
 */
test.describe('Negative Scenarios', () => {
  // ── 1. Invalid login credentials ────────────────────────────────────────────
  test('Login with invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('nonexistent_user_xyz', 'wrongPassword123');

    await expect(
      page.getByText(/error|invalid|could not be verified/i)
    ).toBeVisible({ timeout: 10_000 });

    // Must not navigate to the authenticated overview
    expect(page.url()).not.toContain('overview.htm');
  });

  // ── 2. Registration with duplicate username ──────────────────────────────────
  test('Register with duplicate username shows error', async ({ page }) => {
    const user = generateUser();
    const registrationPage = new RegistrationPage(page);

    // First registration
    await registrationPage.navigate();
    await registrationPage.register(user);
    await registrationPage.assertRegistrationSuccess(user.username);

    // Attempt duplicate registration
    await registrationPage.navigate();
    await registrationPage.register(user); // same username

    await expect(
      page.getByText(/username already exists|This username already exists/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 3. Transfer amount exceeding balance ─────────────────────────────────────
  test('Transfer with amount exceeding balance shows error', async ({ page, request }) => {
    const user = generateUser();

    // Register & login
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    await registrationPage.register(user);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);

    // Get accounts
    const api = new ApiHelper(request);
    const customerId = await api.getCustomerId(user.username, user.password);
    const accounts = await api.getAccounts(customerId);
    expect(accounts.length).toBeGreaterThanOrEqual(2);

    const [fromAccount, toAccount] = accounts;

    // Try to transfer more than the balance
    const excessiveAmount = fromAccount.balance + 999_999;
    const transferPage = new TransferPage(page);
    await transferPage.navigate();
    await transferPage.transfer(
      excessiveAmount,
      fromAccount.id,
      toAccount.id
    );

    await expect(
      page.getByText(/insufficient funds|error/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 4. API login with wrong password ────────────────────────────────────────
  test('API login with wrong password returns error status', async ({ request }) => {
    const api = new ApiHelper(request);
    await expect(
      api.getCustomerId('fakeuser', 'badpassword')
    ).rejects.toThrow();
  });

  // ── 5. Get accounts for non-existent customer ID ─────────────────────────────
  test('API get accounts for non-existent customer returns error', async ({
    request,
  }) => {
    const res = await request.get(
      'https://parabank.parasoft.com/parabank/services/bank/customers/9999999999/accounts'
    );
    // ParaBank returns 500 or 404 for unknown customers
    expect([404, 500]).toContain(res.status());
  });

  // ── 6. Registration with empty required fields ───────────────────────────────
  test('Registration with missing required fields shows validation errors', async ({
    page,
  }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    // Submit without filling anything
    await page.click('input[value="Register"]');

    // Expect at least one validation error message
    await expect(
      page.getByText(/required|First name is required/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});

import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransferPage } from '../pages/TransferPage';
import { ApiHelper } from '../utils/apiHelper';
import { generateUser, TRANSFER_AMOUNT } from '../utils/testData';
import { Account } from '../utils/types';


test.describe('Core Banking Flow', () => {
  const user = generateUser();

  // Shared state across steps (sequential by design)
  let customerId: string;
  let existingAccountId: string;
  let newCheckingAccountId: string;
  let balanceBefore: number;

  test('Step 1 – Register new user', async ({ page }) => {
    const registration = new RegistrationPage(page);
    await registration.navigate();
    await registration.register(user);
    await registration.assertRegistrationSuccess(user.username);
  });

  test('Step 2 – Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await loginPage.assertLoggedIn();
  });

  test('Step 3 – Get customer ID via API', async ({ request }) => {
    const api = new ApiHelper(request);
    customerId = await api.getCustomerId(user.username, user.password);
    expect(customerId).toBeTruthy();
    expect(typeof customerId).toBe('string');
  });

  test('Step 4 – Get existing account via API', async ({ request }) => {
    const api = new ApiHelper(request);
    const accounts: Account[] = await api.getAccounts(customerId);

    expect(accounts.length).toBeGreaterThan(0);

    const savingsAccount = accounts.find((a) => a.type === 'SAVINGS') ?? accounts[0];
    existingAccountId = savingsAccount.id;
    balanceBefore = savingsAccount.balance;

    expect(existingAccountId).toBeTruthy();
    expect(typeof savingsAccount.balance).toBe('number');
  });

  test('Step 5 – Create new CHECKING account via API (curl-equivalent)', async ({
    request,
  }) => {
    const api = new ApiHelper(request);
    newCheckingAccountId = await api.createCheckingAccount(
      customerId,
      existingAccountId
    );

    expect(newCheckingAccountId).toBeTruthy();

    // Verify the created account is actually CHECKING type
    const newAccount = await api.getAccount(newCheckingAccountId);
    expect(newAccount.type).toBe('CHECKING');
    expect(newAccount.id).toBe(newCheckingAccountId);
  });

  test('Step 6 – Verify new account appears in UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);

    const accountsPage = new AccountsPage(page);
    await accountsPage.navigate();
    await accountsPage.assertAccountVisible(newCheckingAccountId);
  });

  test('Step 7 – Transfer money between accounts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);

    const transferPage = new TransferPage(page);
    await transferPage.navigate();
    await transferPage.transfer(
      TRANSFER_AMOUNT,
      existingAccountId,
      newCheckingAccountId
    );
    await transferPage.assertTransferSuccess(TRANSFER_AMOUNT);
  });

  test('Step 8 – Validate updated balances via API', async ({ request }) => {
    const api = new ApiHelper(request);

    const fromBalance = await api.getAccountBalance(existingAccountId);
    const toBalance = await api.getAccountBalance(newCheckingAccountId);

    // Source account should decrease by transfer amount
    expect(fromBalance).toBeCloseTo(balanceBefore - TRANSFER_AMOUNT, 2);

    // Destination checking account should have received the transfer
    expect(toBalance).toBeGreaterThanOrEqual(TRANSFER_AMOUNT);
  });

  test('Step 9 – Logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await loginPage.logout();
  });
});

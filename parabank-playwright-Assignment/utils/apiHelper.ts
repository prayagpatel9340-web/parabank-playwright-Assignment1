import { APIRequestContext } from '@playwright/test';
import { Account, Customer } from './types';

const BASE_URL = 'https://parabank.parasoft.com/parabank/services/bank';

/**
 * Thin wrapper around Playwright's APIRequestContext for ParaBank REST calls.
 * All methods throw on non-2xx responses so callers don't need to check status.
 */
export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  async getCustomerId(username: string, password: string): Promise<string> {
    const res = await this.request.get(
      `${BASE_URL}/login/${username}/${password}`
    );
    if (!res.ok()) {
      throw new Error(`Login API failed: ${res.status()} ${await res.text()}`);
    }
    const customer: Customer = await res.json();
    return customer.id;
  }

  async getAccounts(customerId: string): Promise<Account[]> {
    const res = await this.request.get(
      `${BASE_URL}/customers/${customerId}/accounts`
    );
    if (!res.ok()) {
      throw new Error(`Get accounts failed: ${res.status()}`);
    }
    const accounts: Account[] = await res.json();
    return accounts;
  }

  async getAccount(accountId: string): Promise<Account> {
    const res = await this.request.get(`${BASE_URL}/accounts/${accountId}`);
    if (!res.ok()) {
      throw new Error(`Get account failed: ${res.status()}`);
    }
    return res.json();
  }

  
  async createCheckingAccount(
    customerId: string,
    fromAccountId: string
  ): Promise<string> {
    const url =
      `${BASE_URL}/createAccount?customerId=${customerId}` +
      `&newAccountType=0&fromAccountId=${fromAccountId}`;
    const res = await this.request.post(url);
    if (!res.ok()) {
      throw new Error(`Create account failed: ${res.status()} ${await res.text()}`);
    }
    const account: Account = await res.json();
    return account.id;
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.getAccount(accountId);
    return account.balance;
  }
}

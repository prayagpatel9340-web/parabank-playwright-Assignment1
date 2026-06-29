import { Page, expect } from '@playwright/test';

export class AccountsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/overview.htm');
  }

  async assertAccountVisible(accountId: string): Promise<void> {
    await expect(
      this.page.locator(`a[href*="id=${accountId}"]`)
    ).toBeVisible({ timeout: 10_000 });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    // Navigate to account detail to get balance from UI
    await this.page.goto(`/activity.htm?id=${accountId}`);
    const balanceText = await this.page
      .locator('#balance')
      .textContent();
    if (!balanceText) throw new Error('Balance element not found');
    return parseFloat(balanceText.replace(/[$,]/g, ''));
  }
}

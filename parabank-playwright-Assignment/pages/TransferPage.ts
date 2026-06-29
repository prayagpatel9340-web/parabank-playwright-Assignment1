import { Page, expect } from '@playwright/test';

export class TransferPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/transfer.htm');
  }

  async transfer(
    amount: number,
    fromAccountId: string,
    toAccountId: string
  ): Promise<void> {
    await this.page.fill('#amount', amount.toString());
    await this.page.selectOption('#fromAccountId', fromAccountId);
    await this.page.selectOption('#toAccountId', toAccountId);
    await this.page.click('input[value="Transfer"]');
  }

  async assertTransferSuccess(amount: number): Promise<void> {
    await expect(this.page.getByText('Transfer Complete!')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      this.page.getByText(`$${amount.toFixed(2)}`)
    ).toBeVisible();
  }
}

import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/index.html');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input[value="Log In"]');
  }

  async logout(): Promise<void> {
    await this.page.click('a[href*="logout"]');
    await expect(this.page.getByText('Customer Login')).toBeVisible();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(
      this.page.locator('#leftPanel').getByText('Accounts Overview')
    ).toBeVisible({ timeout: 10_000 });
  }
}

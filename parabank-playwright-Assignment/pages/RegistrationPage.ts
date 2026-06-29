import { Page, expect } from '@playwright/test';
import { UserCredentials } from '../utils/types';

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/register.htm');
  }

  async register(user: UserCredentials): Promise<void> {
    await this.page.fill('#customer\\.firstName', user.firstName);
    await this.page.fill('#customer\\.lastName', user.lastName);
    await this.page.fill('#customer\\.address\\.street', user.address);
    await this.page.fill('#customer\\.address\\.city', user.city);
    await this.page.fill('#customer\\.address\\.state', user.state);
    await this.page.fill('#customer\\.address\\.zipCode', user.zipCode);
    await this.page.fill('#customer\\.phoneNumber', user.phone);
    await this.page.fill('#customer\\.ssn', user.ssn);
    await this.page.fill('#customer\\.username', user.username);
    await this.page.fill('#customer\\.password', user.password);
    await this.page.fill('#repeatedPassword', user.password);
    await this.page.click('input[value="Register"]');
  }

  async assertRegistrationSuccess(username: string): Promise<void> {
    await expect(
      this.page.getByText(`Welcome ${username}`)
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      this.page.getByText('Your account was created successfully')
    ).toBeVisible();
  }
}

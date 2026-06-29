import { UserCredentials } from './types';

/**
 * Generates unique user credentials to avoid conflicts on repeated runs.
 */
export function generateUser(): UserCredentials {
  const suffix = Date.now().toString().slice(-6);
  return {
    firstName: 'Test',
    lastName: `User${suffix}`,
    address: '123 Main Street',
    city: 'Anytown',
    state: 'NY',
    zipCode: '12345',
    phone: '5551234567',
    ssn: `555${suffix}`,
    username: `testuser${suffix}`,
    password: 'Password1!',
  };
}

export const TRANSFER_AMOUNT = 100;

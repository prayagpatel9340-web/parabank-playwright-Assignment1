// Shared type definitions for the ParaBank test suite

export interface UserCredentials {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
}

export interface Account {
  id: string;
  customerId: string;
  type: 'CHECKING' | 'SAVINGS';
  balance: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  accounts: Account[];
}

export interface TransferResult {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
}

import crypto from 'crypto';

export interface CreateUserInput {
  name: string;
  email: string;
  balance: number;
}

export interface CreateExistingUserInput {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly balance: number,
    readonly createdAt: Date = new Date(),
    readonly updatedAt: Date = new Date()
  ) {}

  public static create(input: CreateUserInput): User {
    const id = crypto.randomUUID();
    return new User(id, input.name, input.email, input.balance);
  }

  public static createExisting(input: CreateExistingUserInput): User {
    return new User(input.id, input.name, input.email, input.balance, input.createdAt, input.updatedAt);
  }
}

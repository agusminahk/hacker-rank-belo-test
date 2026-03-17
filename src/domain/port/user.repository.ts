import { User } from '@domain/model/user.entity';

export const USER_REPOSITORY = 'UserRepository';

export interface UserRepository {
  save(user: User): Promise<User>;
  update(user: User): Promise<void>;
  findById(userId: string): Promise<User | null>;
}

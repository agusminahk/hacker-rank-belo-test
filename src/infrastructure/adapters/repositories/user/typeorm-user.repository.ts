import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@domain/model/user.entity';
import { UserRepository } from '@domain/port/user.repository';
import { UserPersistence } from '@infrastructure/adapters/repositories/user/user.persistence';

@Injectable()
export class TypeORMUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserPersistence)
    private readonly repository: Repository<UserPersistence>
  ) {}

  async save(user: User): Promise<User> {
    const persistence = UserPersistence.fromDomain(user);
    const saved = await this.repository.save(persistence);
    return saved.toDomain();
  }

  async update(user: User): Promise<void> {
    const persistence = UserPersistence.fromDomain(user);
    await this.repository.update({ id: persistence.id }, persistence);
  }

  async findById(userId: string): Promise<User | null> {
    const persistence = await this.repository.findOne({ where: { id: userId } });
    return persistence ? persistence.toDomain() : null;
  }
}

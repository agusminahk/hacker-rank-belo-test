import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@domain/model/user.entity';

@Entity({ name: 'user' })
export class UserPersistence {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column('decimal', { precision: 18, scale: 2 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): User {
    return User.createExisting({
      id: this.id,
      name: this.name,
      email: this.email,
      balance: Number(this.balance),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(user: User): UserPersistence {
    const persistence = new UserPersistence();
    persistence.id = user.id;
    persistence.name = user.name;
    persistence.email = user.email;
    persistence.balance = user.balance;
    persistence.createdAt = user.createdAt;
    persistence.updatedAt = user.updatedAt;
    return persistence;
  }
}

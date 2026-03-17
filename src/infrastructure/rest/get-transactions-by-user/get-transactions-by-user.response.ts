import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionStatus } from '@domain/model/transaction.entity';

export class GetTransactionsByUserResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'PENDING', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  fromUserId: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440111' })
  toUserId: string;

  @ApiProperty({ example: 100.5 })
  amount: number;

  @ApiProperty({ example: '2026-03-16T12:00:00.000Z' })
  createdAt: Date;

  static fromDomainOutput(transaction: Transaction): GetTransactionsByUserResponse {
    const response = new GetTransactionsByUserResponse();
    response.id = transaction.id;
    response.status = transaction.status;
    response.fromUserId = transaction.fromUserId;
    response.toUserId = transaction.toUserId;
    response.amount = transaction.amount;
    response.createdAt = transaction.createdAt;
    return response;
  }
}

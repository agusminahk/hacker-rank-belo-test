import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenerateTransactionInput } from '@domain/services/transactions.domain-service';

export class CreateTransactionRequest {
  @ApiProperty({
    description: 'ID of the user sending the money',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  fromUserId: string;

  @ApiProperty({
    description: 'ID of the user receiving the money',
    example: '660e8400-e29b-41d4-a716-446655440111',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({
    description: 'Amount to transfer',
    example: 100.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  static toDomainInput(body: CreateTransactionRequest): GenerateTransactionInput {
    return {
      fromUserId: body.fromUserId,
      toUserId: body.toUserId,
      amount: body.amount,
    };
  }
}

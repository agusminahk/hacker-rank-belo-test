import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionsByUserRequest {
  @ApiProperty({
    description: 'ID of the user to retrieve transactions',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  static toDomainInput(input: GetTransactionsByUserRequest): { userId: string } {
    return { userId: input.userId };
  }
}

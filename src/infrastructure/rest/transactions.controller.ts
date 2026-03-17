import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { CreateTransactionRequest } from '@infrastructure/rest/create-transaction/create-transaction.request';
import { CreateTransactionResponse } from '@infrastructure/rest/create-transaction/create-transaction.response';
import { RestController } from '@infrastructure/shared/rest.decorator';
import { Body, HttpCode, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@RestController('/transactions')
export class TransactionsController {
  constructor(
    @Inject()
    private readonly createTransactionUseCase: CreateTransactionUseCase
  ) {}

  @Post('')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a transaction',
    description: 'Creates a new money transfer between two users',
  })
  @ApiBody({
    type: CreateTransactionRequest,
    description: 'Transaction creation request',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction created successfully',
    type: CreateTransactionResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  async createTransaction(@Body() request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const output = await this.createTransactionUseCase.execute(CreateTransactionRequest.toDomainInput(request));
    return CreateTransactionResponse.fromDomainOutput(output);
  }
}

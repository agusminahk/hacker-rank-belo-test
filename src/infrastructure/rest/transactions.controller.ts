import { GetTransactionsByUserUseCase } from '@application/get-transactions-by-user.use-case';
import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { CreateTransactionRequest } from '@infrastructure/rest/create-transaction/create-transaction.request';
import { CreateTransactionResponse } from '@infrastructure/rest/create-transaction/create-transaction.response';
import { GetTransactionsByUserRequest } from '@infrastructure/rest/get-transactions-by-user/get-transactions-by-user.request';
import { GetTransactionsByUserResponse } from '@infrastructure/rest/get-transactions-by-user/get-transactions-by-user.response';
import { RestController } from '@infrastructure/shared/rest.decorator';
import { Body, Get, HttpCode, Inject, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@RestController('/transactions')
export class TransactionsController {
  constructor(
    @Inject()
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    @Inject()
    private readonly getTransactionsByUserUseCase: GetTransactionsByUserUseCase
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
  @ApiResponse({ status: 200, description: 'Transaction created successfully', type: CreateTransactionResponse })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async createTransaction(@Body() request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const output = await this.createTransactionUseCase.execute(CreateTransactionRequest.toDomainInput(request));
    return CreateTransactionResponse.fromDomainOutput(output);
  }

  @Get('')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get transactions by user',
    description: 'Returns all transactions where the user is the sender or receiver, ordered by date descending',
  })
  @ApiQuery({ name: 'userId', description: 'User ID to filter transactions', type: String, required: true })
  @ApiResponse({ status: 200, description: 'List of transactions', type: [GetTransactionsByUserResponse] })
  @ApiResponse({ status: 400, description: 'Invalid userId' })
  async getTransactionsByUser(@Query() query: GetTransactionsByUserRequest): Promise<GetTransactionsByUserResponse[]> {
    const output = await this.getTransactionsByUserUseCase.execute(query.userId);
    return output.map(GetTransactionsByUserResponse.fromDomainOutput);
  }
}

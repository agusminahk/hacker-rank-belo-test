import { ApproveTransactionUseCase } from '@application/approve-transaction.use-case';
import { RejectTransactionUseCase } from '@application/reject-transaction.use-case';
import { GetTransactionsByUserUseCase } from '@application/get-transactions-by-user.use-case';
import { CreateTransactionUseCase } from '@application/create-transaction.use-case';
import { ApproveTransactionResponse } from '@infrastructure/rest/approve-transaction/approve-transaction.response';
import { RejectTransactionResponse } from '@infrastructure/rest/reject-transaction/reject-transaction.response';
import { CreateTransactionRequest } from '@infrastructure/rest/create-transaction/create-transaction.request';
import { CreateTransactionResponse } from '@infrastructure/rest/create-transaction/create-transaction.response';
import { GetTransactionsByUserRequest } from '@infrastructure/rest/get-transactions-by-user/get-transactions-by-user.request';
import { GetTransactionsByUserResponse } from '@infrastructure/rest/get-transactions-by-user/get-transactions-by-user.response';
import { RestController } from '@infrastructure/shared/rest.decorator';
import { Body, Get, HttpCode, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@RestController('/transaction')
export class TransactionsController {
  constructor(
    @Inject()
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    @Inject()
    private readonly getTransactionsByUserUseCase: GetTransactionsByUserUseCase,
    @Inject()
    private readonly approveTransactionUseCase: ApproveTransactionUseCase,
    @Inject()
    private readonly rejectTransactionUseCase: RejectTransactionUseCase
  ) {}

  @Post('')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a transaction',
    description: 'Creates a new money transfer between two users',
  })
  @ApiBody({ type: CreateTransactionRequest, description: 'Transaction creation request', required: true })
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

  @Patch(':id/approve')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Approve a pending transaction',
    description: 'Confirms a pending transaction and transfers the amount from sender to receiver',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID to approve', type: String })
  @ApiResponse({ status: 200, description: 'Transaction approved successfully', type: ApproveTransactionResponse })
  @ApiResponse({ status: 400, description: 'Transaction not found or not in PENDING status' })
  async approveTransaction(@Param('id') id: string): Promise<ApproveTransactionResponse> {
    const output = await this.approveTransactionUseCase.execute(id);
    return ApproveTransactionResponse.fromDomainOutput(output);
  }

  @Patch(':id/reject')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reject a pending transaction',
    description: 'Rejects a pending transaction without modifying user balances',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID to reject', type: String })
  @ApiResponse({ status: 200, description: 'Transaction rejected successfully', type: RejectTransactionResponse })
  @ApiResponse({ status: 400, description: 'Transaction not found or not in PENDING status' })
  async rejectTransaction(@Param('id') id: string): Promise<RejectTransactionResponse> {
    const output = await this.rejectTransactionUseCase.execute(id);
    return RejectTransactionResponse.fromDomainOutput(output);
  }
}

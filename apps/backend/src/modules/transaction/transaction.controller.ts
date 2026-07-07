import { Controller, Get, Query, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get freelancer transaction history with filters' })
  @ApiResponse({ status: 200, description: 'Paginated transaction list.' })
  getTransactions(@Query() query: TransactionQueryDto, @Request() req) {
    return this.transactionService.getFreelancerTransactions(
      req.user.freelancerId,
      query,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';

@ApiTags('Contracts')
@ApiBearerAuth('access-token')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Client creates a new contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully.' })
  create(@Body() createContractDto: CreateContractDto, @Request() req) {
    return this.contractsService.create(createContractDto, req.user.id);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get all open contracts available for freelancers' })
  @ApiResponse({ status: 200, description: 'List of open contracts.' })
  findOpenContracts() {
    return this.contractsService.findOpenContracts();
  }

  @Get('my/client')
  @ApiOperation({ summary: 'Client views their own contracts' })
  @ApiResponse({ status: 200, description: 'List of client contracts.' })
  findClientContracts(@Request() req) {
    return this.contractsService.findClientContracts(req.user.id);
  }

  @Get('my/freelancer')
  @ApiOperation({ summary: 'Freelancer views their own contracts' })
  @ApiResponse({ status: 200, description: 'List of freelancer contracts.' })
  findFreelancerContracts(@Request() req) {
    return this.contractsService.findFreelancerContracts(req.user.freelancerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract by ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract found.' })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Freelancer accepts an open contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract accepted.' })
  @ApiResponse({ status: 400, description: 'Contract is not open.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  acceptContract(@Param('id') id: string, @Request() req) {
    return this.contractsService.acceptContract(id, req.user.freelancerId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Freelancer marks contract as completed' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract marked as completed.' })
  @ApiResponse({ status: 400, description: 'Contract is not active.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  markAsCompleted(@Param('id') id: string, @Request() req) {
    return this.contractsService.markAsCompleted(id, req.user.freelancerId);
  }

  @Patch(':id/confirm-and-pay')
  @ApiOperation({
    summary: 'Client confirms job completion and gets checkout link',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Checkout link generated.' })
  @ApiResponse({ status: 400, description: 'Contract is not completed.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  confirmAndPay(@Param('id') id: string, @Request() req) {
    return this.contractsService.confirmAndPay(id, req.user.id);
  }
}

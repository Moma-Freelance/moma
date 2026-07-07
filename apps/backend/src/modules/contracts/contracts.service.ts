import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { NombaHttpService } from '../nomba/nomba-http.service';
import { Client } from '../users/entities/client.entity';
import { ConfigService } from '@nestjs/config';

interface NombaCheckoutResponse {
  code: string;
  description: string;
  data: {
    orderReference: string;
    checkoutLink: string;
  };
}

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);
  private readonly subAccountId: string;
  private readonly APP_URL: string;
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly nombaHttp: NombaHttpService,
    private readonly configService: ConfigService,
  ) {
    this.subAccountId = this.configService.get<string>('NOMBA_SUB_ACCOUNT_ID')!;
    this.APP_URL = this.configService.get<string>('APP_URL')!;
  }

  async create(createContractDto: CreateContractDto, userId: string) {
    const client = await this.clientRepo.findOne({ where: { userId } });
    if (!client) throw new NotFoundException('Client profile not found');

    const contract = this.contractRepo.create({
      title: createContractDto.title,
      description: createContractDto.description,
      amount: createContractDto.amount,
      clientId: client.id,
      //freelancerId: createContractDto.freelancerId,
      status: ContractStatus.OPEN,
    });

    return this.contractRepo.save(contract);
  }

  async findOpenContracts() {
    return this.contractRepo.find({
      where: { status: ContractStatus.OPEN },
      relations: ['client', 'client.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findClientContracts(userId: string) {
    const client = await this.clientRepo.findOne({ where: { userId } });
    if (!client) throw new NotFoundException('Client profile not found');

    return this.contractRepo.find({
      where: { clientId: client.id },
      relations: ['freelancer', 'freelancer.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFreelancerContracts(freelancerId: string) {
    return this.contractRepo.find({
      where: { freelancerId },
      relations: ['client', 'client.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['client', 'client.user', 'freelancer', 'freelancer.user'],
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async acceptContract(contractId: string, freelancerId: string) {
    const contract = await this.findOne(contractId);

    if (contract.status !== ContractStatus.OPEN) {
      throw new BadRequestException(
        `Contract is not open for acceptance. Current status: ${contract.status}`,
      );
    }

    await this.contractRepo.update(contractId, {
      freelancerId,
      status: ContractStatus.ACTIVE,
    });

    this.logger.log(
      `Contract ${contractId} accepted by freelancer ${freelancerId}`,
    );
    return this.findOne(contractId);
  }

  async markAsCompleted(contractId: string, freelancerId: string) {
    const contract = await this.findOne(contractId);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException(
        `Contract must be ACTIVE to mark as completed. Current status: ${contract.status}`,
      );
    }

    if (contract.freelancerId !== freelancerId) {
      throw new ForbiddenException('This contract does not belong to you');
    }

    await this.contractRepo.update(contractId, {
      status: ContractStatus.COMPLETED,
    });

    this.logger.log(
      `Contract ${contractId} marked as completed by freelancer ${freelancerId}`,
    );

    return this.findOne(contractId);
  }

  async confirmAndPay(contractId: string, userId: string) {
    const contract = await this.findOne(contractId);

    if (contract.status !== ContractStatus.COMPLETED) {
      throw new BadRequestException(
        `Contract must be COMPLETED before payment. Current status: ${contract.status}`,
      );
    }

    if (contract.client.userId !== userId) {
      throw new ForbiddenException('This contract does not belong to you');
    }

    // generate Nomba checkout link
    const amountInNaira = (contract.amount / 100).toFixed(2);

    const response = await this.nombaHttp.post<NombaCheckoutResponse>(
      '/checkout/order',
      {
        order: {
          orderReference: contract.id,
          amount: amountInNaira,
          accountId: this.subAccountId,
          currency: 'NGN',
          customerEmail: contract.client.user.email,
          callbackUrl: `${this.APP_URL}/contracts/${contract.id}/payment-callback`,
        },
      },
    );

    if (response.code !== '00') {
      throw new BadRequestException(
        `Failed to generate checkout link: ${response.description}`,
      );
    }

    const checkoutUrl = response.data.checkoutLink;

    await this.contractRepo.update(contractId, {
      status: ContractStatus.PAYMENT_PENDING,
      checkoutUrl,
    });

    this.logger.log(`Checkout link generated for contract ${contractId}`);

    return {
      checkoutUrl,
      contractId,
      amount: amountInNaira,
    };
  }
}

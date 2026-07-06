import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Freelancer, PayoutSchedule } from './entities/freelancer.entity';
import { Client } from './entities/client.entity';
import { NombaHttpService } from 'src/modules/nomba/nomba-http.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { UpdatePayoutScheduleDto } from './dto/update-payout-schedule.dto';
import { calculateNextPayoutDate } from 'src/core/utils/payout.utils';
import { Payout } from '../transaction/entities/payout.entity';
import { Transaction } from '../transaction/entities/transaction.entity';

interface NombaVirtualAccountResponse {
  code: string;
  description: string;
  data: {
    accountHolderId: string;
    accountRef: string;
    accountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  };
}

@Injectable()
export class UsersService {
  private readonly subAccountId: string;
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: Repository<Freelancer>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Payout)
    private readonly payoutRepo: Repository<Payout>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
    private readonly nombaHttp: NombaHttpService,
    private readonly mailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.subAccountId = this.configService.get<string>('NOMBA_SUB_ACCOUNT_ID')!;
  }
  //create
  //verify email

  async create(createUserDto: CreateUserDto) {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException(
          `User with email: ${createUserDto.email} already exists`,
        );
      }

      const passwordHash = await bcrypt.hash(createUserDto.password, 10);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log('OTP: ', otpCode);

      const user = manager.create(User, {
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
        otpCode,
        otpExpiresAt,
        emailVerified: false,
        onboardingComplete: false,
      });
      const savedUser = await manager.save(user);

      if (createUserDto.role === UserRole.FREELANCER) {
        const freelancer = manager.create(Freelancer, { userId: savedUser.id });
        await manager.save(freelancer);
      } else if (createUserDto.role === UserRole.CLIENT) {
        const client = manager.create(Client, { userId: savedUser.id });
        await manager.save(client);
      }

      // I need to send the otp email;
      const subject = 'Welcome to Moma';
      await this.mailService.sendEmail(createUserDto.email, subject, 'otp', {
        otp: otpCode,
      });
      return { message: 'Account created. Check your email for the OTP.' };
    });
  }

  async verifyEmail(email: string, otpCode: string) {
    const user = await this.findByEmail(email);

    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');
    if (!user.otpCode || !user.otpExpiresAt)
      throw new BadRequestException('No OTP found, request a new one');
    if (user.otpCode !== otpCode) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiresAt)
      throw new BadRequestException('OTP has expired, request a new one');

    await this.userRepo.update(user.id, {
      emailVerified: true,
      otpCode: undefined,
      otpExpiresAt: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async resendOtp(email: string) {
    const user = await this.findByEmail(email);

    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepo.update(user.id, { otpCode, otpExpiresAt });

    // I need to send the otp email;

    return { message: 'OTP resent successfully' };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await this.findOne(id);
      if (!user) throw new BadRequestException('User not found');

      await manager.update(User, id, {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phoneNumber: updateProfileDto.phoneNumber,
      });

      if (user.role === UserRole.FREELANCER) {
        const freelancer = await this.freelancerRepo.findOne({
          where: { userId: id },
        });
        if (!freelancer)
          throw new BadRequestException('Freelancer profile not found');

        if (!freelancer.nombaVirtualAcctNo) {
          const va = await this.nombaHttp.post<NombaVirtualAccountResponse>(
            `/accounts/virtual/${this.subAccountId}`,
            {
              accountRef: id,
              accountName: `${updateProfileDto.firstName} ${updateProfileDto.lastName}`,
              expiryDate: '2030-12-31 23:59:59',
            },
          );

          if (va.code !== '00') {
            throw new BadRequestException(
              `Failed to provision virtual account: ${va.description}`,
            );
          }

          await manager.update(Freelancer, freelancer.id, {
            accountHolderId: va.data.accountHolderId,
            nombaVirtualAcctNo: va.data.bankAccountNumber,
            nombaBankName: va.data.bankName,
            profession: updateProfileDto.profession,
          });
        }

        await manager.update(User, id, { onboardingComplete: true });
      } else if (user.role === UserRole.CLIENT) {
        const client = await this.clientRepo.findOne({ where: { userId: id } });
        if (!client) throw new BadRequestException('Client profile not found');
        await manager.update(Client, client.id, {
          companyName: updateProfileDto.companyName,
          industry: updateProfileDto.industry,
        });
        await manager.update(User, id, { onboardingComplete: true });
      }

      return this.findOne(id);
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { freelancer: true },
    });
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  async updatePayoutSchedule(
    userId: string,
    dto: UpdatePayoutScheduleDto,
  ): Promise<Freelancer | null> {
    const freelancer = await this.freelancerRepo.findOne({ where: { userId } });
    if (!freelancer)
      throw new NotFoundException('Freelancer profile not found');

    const updateData: Partial<Freelancer> = {
      payoutSchedule: dto.payoutSchedule,
      payoutAmount: dto.payoutAmount ?? freelancer.payoutAmount,
    };

    if (dto.payoutSchedule === PayoutSchedule.INSTANT) {
      // clear scheduled fields — not needed for instant
      updateData.nextPayoutDate = null;
      updateData.payoutAmount = 0;
    } else {
      // recalculate nextPayoutDate from now based on new schedule
      updateData.nextPayoutDate = calculateNextPayoutDate(dto.payoutSchedule);
    }

    await this.freelancerRepo.update(freelancer.id, updateData);

    return this.freelancerRepo.findOne({ where: { userId } });
  }

  async getWalletDashboard(userId: string) {
    const freelancer = await this.freelancerRepo.findOne({
      where: { userId },
      relations: ['payouts', 'transactions'],
    });

    if (!freelancer)
      throw new NotFoundException('Freelancer profile not found');

    // calculate runway
    const runway =
      freelancer.payoutSchedule !== PayoutSchedule.INSTANT &&
      freelancer.payoutAmount > 0
        ? Math.floor(freelancer.reservedBalance / freelancer.payoutAmount)
        : null;

    // get last 5 payouts
    const recentPayouts = await this.payoutRepo.find({
      where: { freelancer: { id: freelancer.id } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // get last 5 transactions
    const recentTransactions = await this.transactionRepo.find({
      where: { freelancer: { id: freelancer.id } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      availableBalance: freelancer.availableBalance,
      reservedBalance: freelancer.reservedBalance,
      payoutSchedule: freelancer.payoutSchedule,
      payoutAmount: freelancer.payoutAmount,
      nextPayoutDate: freelancer.nextPayoutDate,
      runway,
      recentPayouts,
      recentTransactions,
    };
  }
}

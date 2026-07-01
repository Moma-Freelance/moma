import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Freelancer } from './entities/freelancer.entity';
import { Client } from './entities/client.entity';
import { NombaHttpService } from 'src/nomba/nomba-http.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface NombaVirtualAccountResponse {
  code: string;
  description: string;
  data: {
    accountRef: string;
    accountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: Repository<Freelancer>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private dataSource: DataSource,
    private readonly nombaHttp: NombaHttpService,
  ) {}
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
            '/accounts/virtual',
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
            nombaVirtualAcctNo: va.data.bankAccountNumber,
            nombaBankName: va.data.bankName,
          });
        }

        await manager.update(User, id, { onboardingComplete: true });
      } else if (user.role === UserRole.CLIENT) {
        await manager.update(User, id, { onboardingComplete: true });
      }

      return this.findOne(id);
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Client } from '../users/entities/client.entity';
import { Freelancer } from '../users/entities/freelancer.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: Repository<Freelancer>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async createUser() {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
  }

  async login(user: any) {
    const payload: Record<string, any> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === UserRole.FREELANCER) {
      const freelancer = await this.freelancerRepo.findOne({
        where: { userId: user.id },
      });
      if (freelancer) {
        payload.freelancerId = freelancer.id;
      }
    } else if (user.role === UserRole.CLIENT) {
      const client = await this.clientRepo.findOne({
        where: { userId: user.id },
      });
      if (client) {
        payload.clientId = client.id;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

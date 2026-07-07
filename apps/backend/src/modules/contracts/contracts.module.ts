import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { NombaModule } from '../nomba/nomba.module';
import { Client } from '../users/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Client]), NombaModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}

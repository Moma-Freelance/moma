import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';
import { PayoutSchedule } from '../entities/freelancer.entity';

export class UpdatePayoutScheduleDto {
  @ApiProperty({ enum: PayoutSchedule, example: PayoutSchedule.WEEKLY })
  @IsEnum(PayoutSchedule)
  payoutSchedule!: PayoutSchedule;

  @ApiPropertyOptional({
    example: 5000000,
    description: 'Amount in kobo — required if schedule is not INSTANT',
  })
  @ValidateIf((o) => o.payoutSchedule !== PayoutSchedule.INSTANT)
  @IsInt()
  @Min(1)
  payoutAmount?: number;
}

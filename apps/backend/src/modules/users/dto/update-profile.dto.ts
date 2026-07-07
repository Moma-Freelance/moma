import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Professions } from '../entities/freelancer.entity';
import { Industry } from '../entities/client.entity';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Michael' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Adebayo' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ enum: Professions, example: Professions.DEVELOPER })
  @IsEnum(Professions)
  @IsOptional()
  profession?: Professions;

  @ApiProperty({ enum: Industry, example: Industry.IT })
  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @ApiProperty({ example: 'Moma Ltd' })
  @IsString()
  @IsOptional()
  companyName?: string;
}

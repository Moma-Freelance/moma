import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Professions } from '../entities/freelancer.entity';

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
  profession!: Professions;
}

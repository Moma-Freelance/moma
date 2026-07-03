import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({ example: 'michael@example.com' })
  @IsEmail()
  email!: string;
}

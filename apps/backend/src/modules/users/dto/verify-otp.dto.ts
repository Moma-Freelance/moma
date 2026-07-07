import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'michael@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '483920' })
  @IsString()
  @Length(6, 6)
  otpCode!: string;
}

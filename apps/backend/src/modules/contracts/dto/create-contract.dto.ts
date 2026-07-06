import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'Design a landing page' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'A modern landing page for a SaaS product' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 5000000, description: 'Amount in kobo' })
  @IsInt()
  @Min(1)
  amount!: number;
}

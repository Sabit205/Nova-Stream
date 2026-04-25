import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['Active', 'Disabled', 'Banned'])
  status?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  exp_date: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  max_connections?: number;

  @IsOptional()
  @IsString()
  is_trial?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['Active', 'Disabled', 'Banned'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  exp_date?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  max_connections?: number;

  @IsOptional()
  @IsString()
  is_trial?: string;
}

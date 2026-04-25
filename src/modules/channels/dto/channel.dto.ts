import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChannelDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  stream_id: number;

  @IsString()
  name: string;

  @IsString()
  stream_url: string;

  @IsOptional()
  @IsString()
  stream_icon?: string;

  @IsString()
  category_id: string;

  @IsOptional()
  @IsString()
  epg_channel_id?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  num?: number;
}

export class UpdateChannelDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  stream_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  stream_url?: string;

  @IsOptional()
  @IsString()
  stream_icon?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  epg_channel_id?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  num?: number;
}

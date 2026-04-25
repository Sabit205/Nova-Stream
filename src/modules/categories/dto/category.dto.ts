import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  category_id: string;

  @IsString()
  category_name: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  category_name?: string;
}

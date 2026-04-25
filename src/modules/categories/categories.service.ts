import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findById(id).exec();
  }

  async findByCategoryId(categoryId: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ category_id: categoryId }).exec();
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const category = new this.categoryModel(dto);
    return category.save();
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments().exec();
  }
}

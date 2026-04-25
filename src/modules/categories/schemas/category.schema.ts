import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories' })
export class Category {
  @Prop({ required: true, unique: true })
  category_id: string;

  @Prop({ required: true })
  category_name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

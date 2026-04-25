import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'Active', enum: ['Active', 'Disabled', 'Banned'] })
  status: string;

  @Prop({ required: true })
  exp_date: number;

  @Prop({ default: 1 })
  max_connections: number;

  @Prop({ default: () => Math.floor(Date.now() / 1000) })
  created_at: number;

  @Prop({ default: '0' })
  is_trial: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

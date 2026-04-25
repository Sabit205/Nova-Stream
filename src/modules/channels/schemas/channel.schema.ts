import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChannelDocument = HydratedDocument<Channel>;

@Schema({ collection: 'channels' })
export class Channel {
  @Prop({ required: true, unique: true })
  stream_id: number;

  @Prop({ default: 1 })
  num: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  stream_url: string;

  @Prop({ default: '' })
  stream_icon: string;

  @Prop({ required: true })
  category_id: string;

  @Prop({ default: '' })
  epg_channel_id: string;

  @Prop({ default: () => Math.floor(Date.now() / 1000).toString() })
  added: string;

  @Prop({ default: 'live' })
  stream_type: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);

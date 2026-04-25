import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel, ChannelDocument } from './schemas/channel.schema';
import { CreateChannelDto, UpdateChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  async findAll(): Promise<ChannelDocument[]> {
    return this.channelModel.find().sort({ num: 1 }).exec();
  }

  async findById(id: string): Promise<ChannelDocument | null> {
    return this.channelModel.findById(id).exec();
  }

  async findByStreamId(streamId: number): Promise<ChannelDocument | null> {
    return this.channelModel.findOne({ stream_id: streamId }).exec();
  }

  async findByCategory(categoryId: string): Promise<ChannelDocument[]> {
    return this.channelModel
      .find({ category_id: categoryId })
      .sort({ num: 1 })
      .exec();
  }

  async create(dto: CreateChannelDto): Promise<ChannelDocument> {
    const channel = new this.channelModel(dto);
    return channel.save();
  }

  async update(id: string, dto: UpdateChannelDto): Promise<ChannelDocument | null> {
    return this.channelModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.channelModel.findByIdAndDelete(id).exec();
  }

  async count(): Promise<number> {
    return this.channelModel.countDocuments().exec();
  }

  async getNextStreamId(): Promise<number> {
    const last = await this.channelModel
      .findOne()
      .sort({ stream_id: -1 })
      .exec();
    return last ? last.stream_id + 1 : 1;
  }
}

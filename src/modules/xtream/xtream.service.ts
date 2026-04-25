import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ChannelsService } from '../channels/channels.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class XtreamService {
  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly channelsService: ChannelsService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(
    username: string,
    password: string,
  ): Promise<UserDocument | null> {
    return this.usersService.validateUser(username, password);
  }

  async getLoginResponse(user: UserDocument) {
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const url = new URL(baseUrl);

    return {
      user_info: {
        username: user.username,
        password: user.password ? '******' : '',
        message: '',
        auth: 1,
        status: user.status,
        exp_date: user.exp_date.toString(),
        is_trial: user.is_trial,
        active_cons: '0',
        created_at: user.created_at.toString(),
        max_connections: user.max_connections.toString(),
        allowed_output_formats: ['m3u8', 'ts'],
      },
      server_info: {
        url: url.origin,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        https_port: url.protocol === 'https:' ? (url.port || '443') : '',
        server_protocol: url.protocol.replace(':', ''),
        rtmp_port: '0',
        timezone: 'UTC',
        timestamp_now: Math.floor(Date.now() / 1000),
        time_now: new Date().toISOString().replace('T', ' ').substring(0, 19),
        process: true,
      },
    };
  }

  async getLiveCategories() {
    const categories = await this.categoriesService.findAll();
    return categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      parent_id: 0,
    }));
  }

  async getLiveStreams(categoryId?: string) {
    let channels;
    if (categoryId) {
      channels = await this.channelsService.findByCategory(categoryId);
    } else {
      channels = await this.channelsService.findAll();
    }

    return channels.map((ch) => ({
      num: ch.num,
      name: ch.name,
      stream_type: ch.stream_type,
      stream_id: ch.stream_id,
      stream_icon: ch.stream_icon,
      epg_channel_id: ch.epg_channel_id || '',
      added: ch.added,
      category_id: ch.category_id,
      category_ids: [parseInt(ch.category_id) || 0],
      custom_sid: '',
      tv_archive: 0,
      direct_source: '',
      tv_archive_duration: 0,
      thumbnail: '',
    }));
  }
}

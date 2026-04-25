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
        auth: 1,
        status: user.status,
        exp_date: user.exp_date.toString(),
        max_connections: user.max_connections.toString(),
      },
      server_info: {
        url: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      },
    };
  }

  async getLiveCategories() {
    const categories = await this.categoriesService.findAll();
    return categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
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
      name: ch.name,
      stream_id: ch.stream_id,
      stream_icon: ch.stream_icon,
      category_id: ch.category_id,
    }));
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ChannelsService } from '../channels/channels.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PlaylistService {
  constructor(
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
    private readonly categoriesService: CategoriesService,
    private readonly configService: ConfigService,
  ) {}

  async generatePlaylist(
    username: string,
    password: string,
    type: string,
  ): Promise<string | null> {
    // Validate user
    const user = await this.usersService.validateUser(username, password);
    if (!user) return null;

    if (user.status !== 'Active') return null;

    const now = Math.floor(Date.now() / 1000);
    if (user.exp_date < now) return null;

    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const channels = await this.channelsService.findAll();
    const categories = await this.categoriesService.findAll();

    // Build category name map
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.category_id, cat.category_name);
    });

    let m3u = '#EXTM3U\n';

    for (const channel of channels) {
      const groupTitle =
        categoryMap.get(channel.category_id) || 'Uncategorized';
      const streamUrl = `${baseUrl}/live/${username}/${password}/${channel.stream_id}.ts`;

      m3u += `#EXTINF:-1 tvg-id="${channel.epg_channel_id || ''}" tvg-name="${channel.name}" tvg-logo="${channel.stream_icon || ''}" group-title="${groupTitle}",${channel.name}\n`;
      m3u += `${streamUrl}\n`;
    }

    return m3u;
  }
}

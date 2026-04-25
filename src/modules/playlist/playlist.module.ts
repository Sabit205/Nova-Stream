import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { UsersModule } from '../users/users.module';
import { ChannelsModule } from '../channels/channels.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [UsersModule, ChannelsModule, CategoriesModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}

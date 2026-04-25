import { Module } from '@nestjs/common';
import { XtreamController } from './xtream.controller';
import { XtreamService } from './xtream.service';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [UsersModule, CategoriesModule, ChannelsModule],
  controllers: [XtreamController],
  providers: [XtreamService],
})
export class XtreamModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [UsersModule, CategoriesModule, ChannelsModule],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { UsersModule } from '../users/users.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [UsersModule, ChannelsModule],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule {}

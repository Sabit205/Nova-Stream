import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { UsersService } from '../users/users.service';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class StreamService {
  private readonly hmacSecret: string;
  private readonly TOKEN_TTL = 60; // 60 seconds

  constructor(
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
    private readonly configService: ConfigService,
  ) {
    this.hmacSecret =
      this.configService.get<string>('HMAC_SECRET') || 'default-hmac-secret';
  }

  async validateAndCreateToken(
    username: string,
    password: string,
    streamId: number,
  ): Promise<{
    valid: boolean;
    token?: string;
    timestamp?: number;
    error?: string;
  }> {
    // Validate user
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      return { valid: false, error: 'Invalid credentials' };
    }

    // Check user status
    if (user.status !== 'Active') {
      return { valid: false, error: 'Account is not active' };
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (user.exp_date < now) {
      return { valid: false, error: 'Subscription expired' };
    }

    // Verify channel exists
    const channel = await this.channelsService.findByStreamId(streamId);
    if (!channel) {
      return { valid: false, error: 'Stream not found' };
    }

    // Generate HMAC token
    const timestamp = now;
    const token = this.generateToken(streamId, timestamp);

    return { valid: true, token, timestamp };
  }

  async verifyTokenAndGetStream(
    token: string,
    streamId: number,
    timestamp: number,
  ): Promise<{ valid: boolean; streamUrl?: string; error?: string }> {
    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > this.TOKEN_TTL) {
      return { valid: false, error: 'Token expired' };
    }

    // Verify HMAC
    const expectedToken = this.generateToken(streamId, timestamp);
    if (token !== expectedToken) {
      return { valid: false, error: 'Invalid token' };
    }

    // Get stream URL
    const channel = await this.channelsService.findByStreamId(streamId);
    if (!channel) {
      return { valid: false, error: 'Stream not found' };
    }

    return { valid: true, streamUrl: channel.stream_url };
  }

  private generateToken(streamId: number, timestamp: number): string {
    const data = `${streamId}:${timestamp}`;
    return createHmac('sha256', this.hmacSecret).update(data).digest('hex');
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { StreamService } from './stream.service';

@Controller()
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('live/:username/:password/:streamFile')
  async liveStream(
    @Param('username') username: string,
    @Param('password') password: string,
    @Param('streamFile') streamFile: string,
    @Res() res: Response,
  ) {
    // Extract stream_id from filename (e.g., "123.ts" -> 123)
    const streamId = parseInt(streamFile.replace(/\.\w+$/, ''), 10);
    if (isNaN(streamId)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid stream ID' });
    }

    const result = await this.streamService.validateAndCreateToken(
      username,
      password,
      streamId,
    );

    if (!result.valid) {
      return res.status(HttpStatus.FORBIDDEN).json({ error: result.error });
    }

    // Redirect to auth endpoint with token
    return res.redirect(
      302,
      `/auth/${result.token}?stream=${streamId}&ts=${result.timestamp}`,
    );
  }

  @Get('auth/:token')
  async authStream(
    @Param('token') token: string,
    @Query('stream') streamId: string,
    @Query('ts') timestamp: string,
    @Res() res: Response,
  ) {
    const result = await this.streamService.verifyTokenAndGetStream(
      token,
      parseInt(streamId, 10),
      parseInt(timestamp, 10),
    );

    if (!result.valid) {
      return res.status(HttpStatus.FORBIDDEN).json({ error: result.error });
    }

    // Redirect to real HLS stream URL
    return res.redirect(302, result.streamUrl!);
  }
}

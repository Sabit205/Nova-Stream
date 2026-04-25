import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PlaylistService } from './playlist.service';

@Controller()
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get('get.php')
  async getPlaylist(
    @Query('username') username: string,
    @Query('password') password: string,
    @Query('type') type: string,
    @Res() res: Response,
  ) {
    if (!username || !password) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid credentials');
    }

    const playlist = await this.playlistService.generatePlaylist(
      username,
      password,
      type,
    );

    if (!playlist) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid credentials');
    }

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="playlist.m3u"`,
    );
    return res.send(playlist);
  }
}

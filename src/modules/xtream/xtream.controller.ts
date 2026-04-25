import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { XtreamService } from './xtream.service';

@Controller()
export class XtreamController {
  constructor(private readonly xtreamService: XtreamService) {}

  @Get('player_api.php')
  async playerApi(
    @Query('username') username: string,
    @Query('password') password: string,
    @Query('action') action: string,
    @Query('category_id') categoryId: string,
    @Res() res: Response,
  ) {
    if (!username || !password) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        user_info: { auth: 0, message: 'Invalid credentials' },
      });
    }

    const user = await this.xtreamService.authenticate(username, password);
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        user_info: { auth: 0, message: 'Invalid credentials' },
      });
    }

    switch (action) {
      case 'get_live_categories':
        const categories = await this.xtreamService.getLiveCategories();
        return res.json(categories);

      case 'get_live_streams':
        const streams = await this.xtreamService.getLiveStreams(categoryId);
        return res.json(streams);

      default:
        // Login response (no action or action=login)
        const loginResponse = await this.xtreamService.getLoginResponse(user);
        return res.json(loginResponse);
    }
  }
}

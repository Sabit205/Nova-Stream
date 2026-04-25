import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from './admin.guard';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ChannelsService } from '../channels/channels.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly channelsService: ChannelsService,
    private readonly configService: ConfigService,
  ) {}

  // ── Auth ──────────────────────────────────────────────

  @Get('login')
  @Render('login')
  loginPage(@Req() req: Request) {
    if ((req.session as any).isAdmin) {
      return { redirect: '/admin' };
    }
    return { error: null, redirect: null };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const adminUser = this.configService.get<string>('ADMIN_USERNAME') || 'admin';
    const adminPass = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

    if (username === adminUser && password === adminPass) {
      (req.session as any).isAdmin = true;
      return res.redirect('/admin');
    }
    return res.render('login', { error: 'Invalid credentials', redirect: null });
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  }

  // ── Dashboard ─────────────────────────────────────────

  @Get()
  @UseGuards(AdminGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    const [userCount, activeUsers, channelCount, categoryCount] =
      await Promise.all([
        this.usersService.count(),
        this.usersService.countActive(),
        this.channelsService.count(),
        this.categoriesService.count(),
      ]);

    return res.render('dashboard', {
      stats: { userCount, activeUsers, channelCount, categoryCount },
      baseUrl: this.configService.get<string>('BASE_URL') || 'http://localhost:3000',
    });
  }

  // ── Users CRUD ────────────────────────────────────────

  @Get('users')
  @UseGuards(AdminGuard)
  async listUsers(@Res() res: Response) {
    const users = await this.usersService.findAll();
    return res.render('users/index', { users });
  }

  @Get('users/new')
  @UseGuards(AdminGuard)
  async newUserForm(@Res() res: Response) {
    return res.render('users/form', { user: null, error: null });
  }

  @Post('users')
  @UseGuards(AdminGuard)
  async createUser(
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.create({
        username: body.username,
        password: body.password,
        status: body.status || 'Active',
        exp_date: Number(body.exp_date),
        max_connections: Number(body.max_connections) || 1,
        is_trial: body.is_trial || '0',
      });
      return res.redirect('/admin/users');
    } catch (err) {
      return res.render('users/form', {
        user: body,
        error: err.message || 'Failed to create user',
      });
    }
  }

  @Get('users/:id/edit')
  @UseGuards(AdminGuard)
  async editUserForm(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findById(id);
    if (!user) return res.redirect('/admin/users');
    return res.render('users/form', { user, error: null });
  }

  @Post('users/:id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const updateData: any = {
        username: body.username,
        status: body.status,
        exp_date: Number(body.exp_date),
        max_connections: Number(body.max_connections) || 1,
        is_trial: body.is_trial || '0',
      };
      if (body.password && body.password.trim() !== '') {
        updateData.password = body.password;
      }
      await this.usersService.update(id, updateData);
      return res.redirect('/admin/users');
    } catch (err) {
      const user = await this.usersService.findById(id);
      return res.render('users/form', {
        user: { ...user?.toObject(), ...body },
        error: err.message || 'Failed to update user',
      });
    }
  }

  @Post('users/:id/delete')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    await this.usersService.delete(id);
    return res.redirect('/admin/users');
  }

  // ── Channels CRUD ─────────────────────────────────────

  @Get('channels')
  @UseGuards(AdminGuard)
  async listChannels(@Res() res: Response) {
    const channels = await this.channelsService.findAll();
    const categories = await this.categoriesService.findAll();
    return res.render('channels/index', { channels, categories });
  }

  @Get('channels/new')
  @UseGuards(AdminGuard)
  async newChannelForm(@Res() res: Response) {
    const categories = await this.categoriesService.findAll();
    const nextId = await this.channelsService.getNextStreamId();
    return res.render('channels/form', {
      channel: { stream_id: nextId },
      categories,
      error: null,
    });
  }

  @Post('channels')
  @UseGuards(AdminGuard)
  async createChannel(@Body() body: any, @Res() res: Response) {
    try {
      await this.channelsService.create({
        stream_id: Number(body.stream_id),
        name: body.name,
        stream_url: body.stream_url,
        stream_icon: body.stream_icon || '',
        category_id: body.category_id,
        epg_channel_id: body.epg_channel_id || '',
        num: Number(body.num) || Number(body.stream_id),
      });
      return res.redirect('/admin/channels');
    } catch (err) {
      const categories = await this.categoriesService.findAll();
      return res.render('channels/form', {
        channel: body,
        categories,
        error: err.message || 'Failed to create channel',
      });
    }
  }

  @Get('channels/:id/edit')
  @UseGuards(AdminGuard)
  async editChannelForm(@Param('id') id: string, @Res() res: Response) {
    const channel = await this.channelsService.findById(id);
    const categories = await this.categoriesService.findAll();
    if (!channel) return res.redirect('/admin/channels');
    return res.render('channels/form', { channel, categories, error: null });
  }

  @Post('channels/:id')
  @UseGuards(AdminGuard)
  async updateChannel(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      await this.channelsService.update(id, {
        stream_id: Number(body.stream_id),
        name: body.name,
        stream_url: body.stream_url,
        stream_icon: body.stream_icon || '',
        category_id: body.category_id,
        epg_channel_id: body.epg_channel_id || '',
        num: Number(body.num) || Number(body.stream_id),
      });
      return res.redirect('/admin/channels');
    } catch (err) {
      const categories = await this.categoriesService.findAll();
      return res.render('channels/form', {
        channel: { ...body, _id: id },
        categories,
        error: err.message || 'Failed to update channel',
      });
    }
  }

  @Post('channels/:id/delete')
  @UseGuards(AdminGuard)
  async deleteChannel(@Param('id') id: string, @Res() res: Response) {
    await this.channelsService.delete(id);
    return res.redirect('/admin/channels');
  }

  // ── Categories CRUD ───────────────────────────────────

  @Get('categories')
  @UseGuards(AdminGuard)
  async listCategories(@Res() res: Response) {
    const categories = await this.categoriesService.findAll();
    return res.render('categories/index', { categories });
  }

  @Get('categories/new')
  @UseGuards(AdminGuard)
  async newCategoryForm(@Res() res: Response) {
    return res.render('categories/form', { category: null, error: null });
  }

  @Post('categories')
  @UseGuards(AdminGuard)
  async createCategory(@Body() body: any, @Res() res: Response) {
    try {
      await this.categoriesService.create({
        category_id: body.category_id,
        category_name: body.category_name,
      });
      return res.redirect('/admin/categories');
    } catch (err) {
      return res.render('categories/form', {
        category: body,
        error: err.message || 'Failed to create category',
      });
    }
  }

  @Get('categories/:id/edit')
  @UseGuards(AdminGuard)
  async editCategoryForm(@Param('id') id: string, @Res() res: Response) {
    const category = await this.categoriesService.findById(id);
    if (!category) return res.redirect('/admin/categories');
    return res.render('categories/form', { category, error: null });
  }

  @Post('categories/:id')
  @UseGuards(AdminGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      await this.categoriesService.update(id, {
        category_id: body.category_id,
        category_name: body.category_name,
      });
      return res.redirect('/admin/categories');
    } catch (err) {
      return res.render('categories/form', {
        category: { ...body, _id: id },
        error: err.message || 'Failed to update category',
      });
    }
  }

  @Post('categories/:id/delete')
  @UseGuards(AdminGuard)
  async deleteCategory(@Param('id') id: string, @Res() res: Response) {
    await this.categoriesService.delete(id);
    return res.redirect('/admin/categories');
  }
}

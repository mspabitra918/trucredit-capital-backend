import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateLoanStatusDto } from '../loan/dto/update-loan-status.dto';
import { SendStipulationDto } from './dto/send-stipulation.dto';
import { GenerateOfferDto } from './dto/generate-offer.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  // ── Dashboard ──────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('stats')
  async stats() {
    const data = await this.adminService.dashboardStats();
    return { message: 'Dashboard stats', data };
  }

  // ── Pipeline Management ────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('applications')
  async listApplications(@Query() query: PaginationDto) {
    const data = await this.adminService.listApplications(query);
    return { message: 'Applications list', data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('applications/:id')
  async getApplication(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.adminService.getApplication(id);
    return { message: 'Application detail', data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('applications/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLoanStatusDto,
  ) {
    const data = await this.adminService.updateApplicationStatus(id, dto);
    return { message: 'Status updated', data };
  }

  // ── Stipulation Engine ─────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('applications/:id/stipulations')
  async sendStipulation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendStipulationDto,
  ) {
    const data = await this.adminService.sendStipulation(id, dto);
    return {
      message: 'Stipulation request sent to borrower',
      data,
    };
  }

  // ── Offer Generator ────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('applications/:id/offer')
  async generateOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateOfferDto,
  ) {
    const result = await this.adminService.generateOffer(id, dto);
    return {
      message: 'Offer generated and sent to borrower',
      data: result,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DesignsService } from './designs.service';
import { CreateDesignDto, UpdateDesignDto, DesignResponseDto } from './designs.dto';

@Controller('api/v1/designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createDesign(@Req() req: any, @Body() createDesignDto: Omit<CreateDesignDto, 'userId'>) {
    return this.designsService.createDesign({
      ...createDesignDto,
      userId: req.user.id,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyDesigns(@Req() req: any): Promise<DesignResponseDto[]> {
    return this.designsService.getAllDesigns(req.user.id);
  }

  @Get(':id')
  async getDesignById(@Param('id') id: string): Promise<DesignResponseDto> {
    return this.designsService.getDesignById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateDesign(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
  ): Promise<DesignResponseDto> {
    return this.designsService.updateDesign(id, updateDesignDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDesign(@Param('id') id: string): Promise<void> {
    return this.designsService.deleteDesign(id);
  }
}

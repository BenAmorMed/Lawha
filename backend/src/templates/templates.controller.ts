import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from './template.entity';

@Controller('api/v1/templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query('category') category?: string): Promise<Template[]> {
        return this.templatesService.findAll(category);
    }

    @Get(':key')
    @HttpCode(HttpStatus.OK)
    async findByKey(@Param('key') key: string): Promise<Template> {
        return this.templatesService.findByKey(key);
    }
}

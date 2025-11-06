import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Body() createTemplateDto: any) {
    const userId = 'temp-user-id';
    return this.templatesService.create(createTemplateDto, userId);
  }

  @Get()
  findAll(@Query() query: QueryTemplateDto) {
    const userId = 'temp-user-id';
    return this.templatesService.findAll(query, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTemplateDto: any) {
    const userId = 'temp-user-id';
    return this.templatesService.update(id, updateTemplateDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const userId = 'temp-user-id';
    return this.templatesService.remove(id, userId);
  }
}

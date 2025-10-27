import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SignaturesService } from './signatures.service';

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  create(@Body() createSignatureDto: any) {
    return this.signaturesService.create(createSignatureDto);
  }

  @Get()
  findAll() {
    return this.signaturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signaturesService.findOne(id);
  }
}

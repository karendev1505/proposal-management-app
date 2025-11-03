import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QueryProposalDto } from './dto/query-proposal.dto';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProposalDto: CreateProposalDto, @Request() req) {
    return this.proposalsService.create(createProposalDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryProposalDto, @Request() req) {
    return this.proposalsService.findAll(query, req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.proposalsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto, @Request() req) {
    return this.proposalsService.update(id, updateProposalDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.proposalsService.remove(id, req.user.userId);
  }

  @Post('send/:id')
  @UseGuards(JwtAuthGuard)
  send(@Param('id') id: string, @Body() body: SendProposalDto, @Request() req) {
    return this.proposalsService.send(id, body, req.user.userId);
  }

  @Get('public/:token')
  getPublic(@Param('token') token: string) {
    return this.proposalsService.getPublicByToken(token);
  }

  @Post('public/:token/sign')
  signPublic(@Param('token') token: string, @Body('signature') signature: string) {
    return this.proposalsService.signByToken(token, signature);
  }
}

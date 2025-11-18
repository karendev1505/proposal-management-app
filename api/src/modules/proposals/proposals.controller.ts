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
    const userId = req.user.userId || req.user.id;
    const workspaceId = createProposalDto['workspaceId'] || req.user.activeWorkspaceId;
    return this.proposalsService.create(createProposalDto, userId, workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryProposalDto, @Request() req) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = query['workspaceId'] || req.user.activeWorkspaceId;
    return this.proposalsService.findAll(query, userId, workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.id;
    return this.proposalsService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto, @Request() req) {
    const userId = req.user.userId || req.user.id;
    return this.proposalsService.update(id, updateProposalDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.id;
    return this.proposalsService.remove(id, userId);
  }

  @Post('send/:id')
  @UseGuards(JwtAuthGuard)
  send(@Param('id') id: string, @Body() body: SendProposalDto, @Request() req) {
    const userId = req.user.userId || req.user.id;
    return this.proposalsService.send(id, body, userId);
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

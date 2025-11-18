import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, ProposalStatus } from '@prisma/client';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { QueryProposalDto } from './dto/query-proposal.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { EmailsService } from '../emails/emails.service';
import { FilesService } from '../files/files.service';
import { PdfService } from '../pdf/pdf.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService,
    private filesService: FilesService,
    private pdfService: PdfService,
  ) {}

  async findAll(query: QueryProposalDto, userId: string, workspaceId?: string) {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    
    const where: Prisma.ProposalWhereInput = {
      AND: [
        workspaceId ? { workspaceId } : { authorId: userId },
        status ? { status } : {},
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    // If workspaceId is provided, verify membership
    if (workspaceId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          author: true, 
          template: true,
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { 
        author: true, 
        template: true, 
        signatures: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    
    // Check access: either author or workspace member
    if (proposal.workspaceId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: proposal.workspaceId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('Access denied');
      }
    } else if (proposal.authorId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    
    return proposal;
  }

  async create(dto: CreateProposalDto, userId: string, workspaceId?: string) {
    let content = dto.content;
    if (!content && dto.templateId) {
      const tpl = await this.prisma.template.findUnique({ where: { id: dto.templateId } });
      if (!tpl) throw new BadRequestException('Invalid templateId');
      content = tpl.content;
    }
    if (!content) throw new BadRequestException('Invalid proposal content');

    // If workspaceId is provided, verify membership and permissions
    if (workspaceId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }
      // VIEWER role cannot create proposals
      if (membership.role === 'VIEWER') {
        throw new ForbiddenException('Viewers cannot create proposals');
      }
    }

    // Get user's active workspace if not provided
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeWorkspaceId: true },
    });
    const finalWorkspaceId = workspaceId || user?.activeWorkspaceId;

    return this.prisma.proposal.create({
      data: {
        title: dto.title,
        content,
        status: ProposalStatus.DRAFT,
        author: { connect: { id: userId } },
        template: dto.templateId ? { connect: { id: dto.templateId } } : undefined,
        workspace: finalWorkspaceId ? { connect: { id: finalWorkspaceId } } : undefined,
        lastEditedBy: userId,
      },
      include: { author: true, template: true, workspace: true },
    });
  }

  async update(id: string, dto: UpdateProposalDto, userId: string) {
    const proposal = await this.findOne(id, userId);
    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT proposals can be edited');
    }

    // Check workspace permissions for editing
    if (proposal.workspaceId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: proposal.workspaceId,
          },
        },
      });
      // VIEWER role cannot edit
      if (membership?.role === 'VIEWER') {
        throw new ForbiddenException('Viewers cannot edit proposals');
      }
    }

    return this.prisma.proposal.update({
      where: { id },
      data: {
        ...(dto as Prisma.ProposalUpdateInput),
        lastEditedBy: userId,
      },
      include: { author: true, template: true, workspace: true },
    });
  }

  async remove(id: string, userId: string) {
    const proposal = await this.findOne(id, userId);
    
    // Check workspace permissions for deletion
    if (proposal.workspaceId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: proposal.workspaceId,
          },
        },
      });
      // Only OWNER and ADMIN can delete, or the author
      if (membership) {
        if (membership.role !== 'OWNER' && membership.role !== 'ADMIN' && proposal.authorId !== userId) {
          throw new ForbiddenException('Only owners, admins, or the author can delete proposals');
        }
      }
    }

    await this.prisma.proposal.delete({ where: { id: proposal.id } });
    return { message: 'Proposal deleted' };
  }

  async send(id: string, body: SendProposalDto, userId: string) {
    const proposal = await this.findOne(id, userId);
    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT proposals can be sent');
    }
    if (!body.recipientEmail) throw new BadRequestException('Recipient email required');

    // Generate PDF from proposal content
  const pdfBuffer: Buffer = await this.pdfService.generateFromHtml(proposal.content);
  const filename = `proposal-${proposal.id}.pdf`;
  const saved = await this.filesService.saveBuffer(pdfBuffer, filename, 'application/pdf');

    const publicToken = uuidv4();
    await this.prisma.proposal.update({
      where: { id: proposal.id },
      data: { pdfUrl: saved.url, publicToken, status: ProposalStatus.SENT },
    });

    // Render email HTML and send with attachment
  const html = await this.emailsService.renderTemplate('proposal-sent', {
      proposalTitle: proposal.title,
      recipientName: body.recipientName || body.recipientEmail,
      link: `${process.env.PUBLIC_APP_URL || 'http://localhost:3000'}/proposals/public/${publicToken}`,
    });
    await this.emailsService.sendEmail({
      to: body.recipientEmail,
      subject: 'New Proposal Sent',
      html,
      attachments: [
        { filename, content: pdfBuffer, contentType: 'application/pdf' },
      ],
    });

    // Log event
    await this.prisma.proposalEvent.create({
      data: { proposalId: proposal.id, type: 'SENT' },
    });

    return { message: 'Proposal sent' };
  }

  async getPublicByToken(token: string) {
    const proposal = await this.prisma.proposal.findFirst({ where: { publicToken: token } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    // mark viewed
    await this.markViewed(proposal.id);
    return { id: proposal.id, title: proposal.title, content: proposal.content, pdfUrl: proposal.pdfUrl };
  }

  private async markViewed(proposalId: string) {
    await this.prisma.proposal.update({ where: { id: proposalId }, data: { viewedAt: new Date() } });
    await this.prisma.proposalEvent.create({ data: { proposalId, type: 'VIEWED' } });
  }

  async signByToken(token: string, signatureBase64: string) {
    const proposal = await this.prisma.proposal.findFirst({ where: { publicToken: token } });
    if (!proposal) throw new NotFoundException('Proposal not found');
  const sigBuf = Buffer.from(signatureBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, ''), 'base64');
  const filename = `signature-${proposal.id}.png`;
  const savedSig = await this.filesService.saveBuffer(sigBuf, filename, 'image/png');
  await this.prisma.proposal.update({ where: { id: proposal.id }, data: { signedAt: new Date(), status: ProposalStatus.SIGNED } });
    await this.prisma.proposalEvent.create({ data: { proposalId: proposal.id, type: 'SIGNED' } });

    // Thank-you email if available
    if (proposal['clientEmail']) {
      await this.emailsService.sendTemplateEmail({ to: proposal['clientEmail'], subject: 'Thank you', template: 'thank-you' });
    }
    return { message: 'Proposal signed' };
  }
}

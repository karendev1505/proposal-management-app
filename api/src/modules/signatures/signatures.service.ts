import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FilesService } from '../files/files.service';
import { ProposalStatus } from '@prisma/client';

export interface CreateSignatureDto {
  proposalId: string;
  userId: string;
  signatureData?: string; // base64 signature image
  ipAddress?: string;
  userAgent?: string;
}

export interface SignTokenPayload {
  proposalId: string;
  expiresAt: number;
}

@Injectable()
export class SignaturesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private filesService: FilesService,
  ) {}

  async findAll() {
    return this.prisma.signature.findMany({
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { signedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const signature = await this.prisma.signature.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    return signature;
  }

  async findByProposal(proposalId: string) {
    return this.prisma.signature.findMany({
      where: { proposalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { signedAt: 'desc' },
    });
  }

  async create(dto: CreateSignatureDto) {
    const { proposalId, userId } = dto;

    // Check if proposal exists
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.status === ProposalStatus.SIGNED) {
      throw new BadRequestException('Proposal is already signed');
    }

    // Check if user already signed this proposal
    const existingSignature = await this.prisma.signature.findUnique({
      where: {
        proposalId_userId: {
          proposalId,
          userId,
        },
      },
    });

    if (existingSignature) {
      throw new BadRequestException('User has already signed this proposal');
    }

    // Create signature
    const signature = await this.prisma.signature.create({
      data: {
        proposalId,
        userId,
        signedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update proposal status
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: ProposalStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    return signature;
  }

  async generateSignToken(proposalId: string): Promise<string> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const payload: SignTokenPayload = {
      proposalId,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async verifySignToken(token: string): Promise<SignTokenPayload> {
    try {
      const payload = this.jwtService.verify<SignTokenPayload>(token);

      // Check if token is expired
      if (Date.now() > payload.expiresAt) {
        throw new ForbiddenException('Sign token has expired');
      }

      // Verify proposal exists
      const proposal = await this.prisma.proposal.findUnique({
        where: { id: payload.proposalId },
      });

      if (!proposal) {
        throw new ForbiddenException('Proposal not found');
      }

      return payload;
    } catch (error) {
      throw new ForbiddenException('Invalid or expired sign token');
    }
  }

  async getProposalByToken(token: string) {
    const payload = await this.verifySignToken(token);
    
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: payload.proposalId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }

  async markProposalAsViewed(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Only update if not already viewed
    if (!proposal.viewedAt) {
      await this.prisma.proposal.update({
        where: { id: proposalId },
        data: {
          viewedAt: new Date(),
        },
      });
    }

    return proposal;
  }

  async remove(id: string) {
    const signature = await this.findOne(id);
    
    return this.prisma.signature.delete({
      where: { id },
    });
  }
}

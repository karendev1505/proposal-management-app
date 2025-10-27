import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.proposal.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.proposal.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
        signatures: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.proposal.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.proposal.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.proposal.delete({
      where: { id },
    });
  }
}

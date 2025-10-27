import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.signature.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.signature.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.signature.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: true,
      },
    });
  }
}

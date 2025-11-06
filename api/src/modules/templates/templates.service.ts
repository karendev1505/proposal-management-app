import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, TemplateType, Template } from '@prisma/client';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';

type TemplateWithRelations = Template & {
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTemplateDto, userId?: string) {
    const { type, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TemplateWhereInput = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        {
          OR: [
            { isPublic: true },
            { author: { id: userId } },
          ],
        },
      ],
    };

    if (type) {
      where.type = type as TemplateType;
    }

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: true },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      items: templates,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<TemplateWithRelations> {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (!template.isPublic && template.author?.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return template;
  }

  async create(data: CreateTemplateDto, userId: string): Promise<TemplateWithRelations> {
    return this.prisma.template.create({
      data: {
        name: data.name,
        type: data.type as TemplateType,
        content: data.content,
        subject: data.subject,
        category: data.category,
        isPublic: data.isPublic ?? false,
        author: { connect: { id: userId } },
      },
      include: { author: true },
    });
  }

  async update(id: string, data: UpdateTemplateDto, userId: string): Promise<TemplateWithRelations> {
    const template = await this.findOne(id, userId);

    if (!template.isPublic && template.author?.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = { ...data };
    if (updateData.type) updateData.type = updateData.type as TemplateType;

    return this.prisma.template.update({
      where: { id },
      data: updateData,
      include: { author: true },
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const template = await this.findOne(id, userId);

    if (!template.isPublic && template.author?.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  // Email template specific methods
  async findEmailTemplate(name: string): Promise<TemplateWithRelations | null> {
    return this.prisma.template.findFirst({
      where: {
        name,
        type: TemplateType.EMAIL,
      },
      include: { author: true },
    });
  }
}

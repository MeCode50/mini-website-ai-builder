import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsiteQueryDto } from './dto/website-query.dto';
import { WebsiteResponseDto } from './dto/website-response.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../common/dto/pagination.dto';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createWebsiteDto: CreateWebsiteDto): Promise<WebsiteResponseDto> {
    this.logger.log('Creating new website');

    const website = await this.prisma.website.create({
      data: createWebsiteDto,
    });

    return this.mapToResponseDto(website);
  }

  async findAll(query: WebsiteQueryDto): Promise<PaginatedResponseDto<WebsiteResponseDto>> {
    const { page = 1, limit = 10, search, isPublic, category, theme } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (category) {
      where.metadata = {
        path: ['category'],
        equals: category,
      };
    }

    if (theme) {
      where.metadata = {
        path: ['theme'],
        equals: theme,
      };
    }

    const [websites, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.website.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data: websites.map(website => this.mapToResponseDto(website)),
      meta,
    };
  }

  async findOne(id: string): Promise<WebsiteResponseDto> {
    const website = await this.prisma.website.findUnique({
      where: { id },
    });

    if (!website) {
      throw new NotFoundException(`Website with ID ${id} not found`);
    }

    return this.mapToResponseDto(website);
  }

  async update(id: string, updateWebsiteDto: UpdateWebsiteDto): Promise<WebsiteResponseDto> {
    this.logger.log(`Updating website ${id}`);

    const website = await this.prisma.website.findUnique({
      where: { id },
    });

    if (!website) {
      throw new NotFoundException(`Website with ID ${id} not found`);
    }

    const updatedWebsite = await this.prisma.website.update({
      where: { id },
      data: updateWebsiteDto,
    });

    return this.mapToResponseDto(updatedWebsite);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting website ${id}`);

    const website = await this.prisma.website.findUnique({
      where: { id },
    });

    if (!website) {
      throw new NotFoundException(`Website with ID ${id} not found`);
    }

    await this.prisma.website.delete({
      where: { id },
    });
  }

  async getPublicWebsites(query: WebsiteQueryDto): Promise<PaginatedResponseDto<WebsiteResponseDto>> {
    return this.findAll({ ...query, isPublic: true });
  }

  async getWebsitePreview(id: string): Promise<{ html: string; css: string }> {
    const website = await this.findOne(id);

    return {
      html: website.htmlContent,
      css: website.cssContent || '',
    };
  }

  private mapToResponseDto(website: any): WebsiteResponseDto {
    return {
      id: website.id,
      title: website.title,
      description: website.description,
      prompt: website.prompt,
      htmlContent: website.htmlContent,
      cssContent: website.cssContent,
      metadata: website.metadata,
      isPublic: website.isPublic,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    };
  }
}

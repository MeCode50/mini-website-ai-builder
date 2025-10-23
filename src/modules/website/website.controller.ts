import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WebsiteService } from './website.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsiteQueryDto } from './dto/website-query.dto';
import { WebsiteResponseDto } from './dto/website-response.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AiService } from '../ai/ai.service';
import { GenerateWebsiteDto } from '../ai/dto/generate-website.dto';
import { WebsiteGenerationResponseDto } from '../ai/dto/website-generation-response.dto';

@ApiTags('websites')
@Controller('websites')
@UseGuards(ThrottlerGuard)
export class WebsiteController {
  constructor(
    private readonly websiteService: WebsiteService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new website' })
  @ApiResponse({
    status: 201,
    description: 'Website created successfully',
    type: WebsiteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createWebsiteDto: CreateWebsiteDto): Promise<WebsiteResponseDto> {
    return this.websiteService.create(createWebsiteDto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a website using AI' })
  @ApiResponse({
    status: 201,
    description: 'Website generated successfully',
    type: WebsiteGenerationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'AI generation failed' })
  async generate(@Body() generateWebsiteDto: GenerateWebsiteDto): Promise<WebsiteGenerationResponseDto> {
    return this.aiService.generateWebsite(generateWebsiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all websites with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'theme', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Websites retrieved successfully',
    type: [WebsiteResponseDto],
  })
  async findAll(@Query() query: WebsiteQueryDto): Promise<PaginatedResponseDto<WebsiteResponseDto>> {
    return this.websiteService.findAll(query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public websites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'theme', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Public websites retrieved successfully',
    type: [WebsiteResponseDto],
  })
  async getPublicWebsites(@Query() query: WebsiteQueryDto): Promise<PaginatedResponseDto<WebsiteResponseDto>> {
    return this.websiteService.getPublicWebsites(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a website by ID' })
  @ApiParam({ name: 'id', description: 'Website ID' })
  @ApiResponse({
    status: 200,
    description: 'Website retrieved successfully',
    type: WebsiteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Website not found' })
  async findOne(@Param('id') id: string): Promise<WebsiteResponseDto> {
    return this.websiteService.findOne(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get website preview (HTML and CSS)' })
  @ApiParam({ name: 'id', description: 'Website ID' })
  @ApiResponse({
    status: 200,
    description: 'Website preview retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML content' },
        css: { type: 'string', description: 'CSS content' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Website not found' })
  async getPreview(@Param('id') id: string): Promise<{ html: string; css: string }> {
    return this.websiteService.getWebsitePreview(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a website' })
  @ApiParam({ name: 'id', description: 'Website ID' })
  @ApiResponse({
    status: 200,
    description: 'Website updated successfully',
    type: WebsiteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Website not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateWebsiteDto: UpdateWebsiteDto,
  ): Promise<WebsiteResponseDto> {
    return this.websiteService.update(id, updateWebsiteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a website' })
  @ApiParam({ name: 'id', description: 'Website ID' })
  @ApiResponse({ status: 204, description: 'Website deleted successfully' })
  @ApiResponse({ status: 404, description: 'Website not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.websiteService.remove(id);
  }
}

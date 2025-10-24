import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '../../common/guards/throttler.guard';
import { AiService } from './ai.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { WebsiteGenerationResponseDto } from './dto/website-generation-response.dto';
import { DetailedErrorResponseDto } from './dto/detailed-error-response.dto';

@ApiTags('AI Generation')
@Controller('websites')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a website using AI',
    description: 'Uses OpenAI GPT-4 to generate a complete Next.js website based on the provided prompt. Includes retry logic and fallback content generation.',
  })
  @ApiBody({
    type: GenerateWebsiteDto,
    description: 'Website generation parameters',
    examples: {
      portfolio: {
        summary: 'Portfolio Website',
        value: {
          prompt: 'Create a portfolio website for a photographer with a dark theme and gallery section',
          title: 'Photography Portfolio',
          description: 'A modern portfolio website for professional photography',
          isPublic: true,
        },
      },
      ecommerce: {
        summary: 'E-commerce Website',
        value: {
          prompt: 'Create an e-commerce website for selling handmade jewelry',
          title: 'Jewelry Store',
          description: 'Online store for handmade jewelry',
          isPublic: true,
        },
      },
      restaurant: {
        summary: 'Restaurant Website',
        value: {
          prompt: 'Create a restaurant website with menu, location, and contact info',
          title: 'Bella Vista Restaurant',
          description: 'Fine dining restaurant website',
          isPublic: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Website generated successfully',
    type: WebsiteGenerationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request or AI generation failed',
    type: DetailedErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
  })
  @ApiBearerAuth()
  async generateWebsite(@Body() dto: GenerateWebsiteDto): Promise<WebsiteGenerationResponseDto> {
    try {
      return await this.aiService.generateWebsite(dto);
    } catch (error) {
      // The DetailedExceptionFilter will handle the error formatting
      throw error;
    }
  }
}

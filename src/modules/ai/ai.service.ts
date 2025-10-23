import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { WebsiteGenerationResponseDto } from './dto/website-generation-response.dto';
import { GenerationLogService } from './generation-log.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly generationLogService: GenerationLogService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateWebsite(dto: GenerateWebsiteDto): Promise<WebsiteGenerationResponseDto> {
    const startTime = Date.now();
    let tokensUsed = 0;

    try {
      this.logger.log(`Generating website for prompt: ${dto.prompt.substring(0, 100)}...`);

      const systemPrompt = `You are an expert web developer. Generate a complete, modern, and responsive website based on the user's prompt.

Requirements:
1. Generate clean, semantic HTML5 structure
2. Include modern CSS with responsive design
3. Use a professional color scheme and typography
4. Include interactive elements where appropriate
5. Ensure the website is mobile-friendly
6. Use modern CSS features like Flexbox or Grid
7. Include proper meta tags and accessibility features

Return your response as a JSON object with the following structure:
{
  "htmlContent": "complete HTML document",
  "cssContent": "complete CSS styles",
  "metadata": {
    "category": "website category",
    "theme": "color theme",
    "features": ["list", "of", "features"]
  }
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.prompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new BadRequestException('Failed to generate website content');
      }

      tokensUsed = completion.usage?.total_tokens || 0;
      const duration = Date.now() - startTime;

      // Parse the AI response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        this.logger.error('Failed to parse AI response as JSON', parseError);
        throw new BadRequestException('Invalid response format from AI service');
      }

      const { htmlContent, cssContent, metadata } = parsedResponse;

      if (!htmlContent || !cssContent) {
        throw new BadRequestException('Generated content is incomplete');
      }

      // Save the generated website to database
      const website = await this.prisma.website.create({
        data: {
          title: dto.title || this.extractTitleFromHtml(htmlContent),
          description: dto.description || this.extractDescriptionFromHtml(htmlContent),
          prompt: dto.prompt,
          htmlContent,
          cssContent,
          metadata: metadata || {},
          isPublic: dto.isPublic || false,
        },
      });

      // Log the generation
      await this.generationLogService.logGeneration({
        prompt: dto.prompt,
        response: response,
        duration,
        tokens: tokensUsed,
      });

      this.logger.log(`Website generated successfully: ${website.id}`);

      return {
        id: website.id,
        title: website.title,
        description: website.description,
        prompt: website.prompt,
        htmlContent: website.htmlContent,
        cssContent: website.cssContent,
        isPublic: website.isPublic,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt,
        metadata: website.metadata as Record<string, any>,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log the error
      await this.generationLogService.logGeneration({
        prompt: dto.prompt,
        error: error.message,
        duration,
        tokens: tokensUsed,
      });

      this.logger.error('Website generation failed', error);
      throw error;
    }
  }

  private extractTitleFromHtml(htmlContent: string): string {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'Generated Website';
  }

  private extractDescriptionFromHtml(htmlContent: string): string {
    const metaMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    return metaMatch ? metaMatch[1] : 'AI-generated website';
  }
}

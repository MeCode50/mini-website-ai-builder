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

      const systemPrompt = `You are an expert Next.js developer. Generate a complete, modern, and responsive Next.js application based on the user's prompt.

Requirements:
1. Generate Next.js 14+ components with App Router
2. Use Tailwind CSS for styling
3. Include shadcn/ui components where appropriate
4. Use TypeScript for type safety
5. Include responsive design
6. Use modern React patterns (hooks, components)
7. Include proper SEO and accessibility
8. Generate multiple component files as needed

IMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks, backticks, or any other formatting. Just pure JSON.

Return your response as a JSON object with the following structure:
{
  "nextjsContent": {
    "page.tsx": "main page component",
    "components": {
      "Header.tsx": "header component",
      "Footer.tsx": "footer component"
    },
    "layout.tsx": "root layout component",
    "globals.css": "global styles with Tailwind imports"
  },
  "packageJson": {
    "dependencies": {
      "next": "^14.0.0",
      "react": "^18.0.0",
      "tailwindcss": "^3.0.0",
      "@radix-ui/react-*": "latest versions"
    }
  },
  "tailwindConfig": "tailwind.config.js content",
  "metadata": {
    "category": "website category",
    "theme": "color theme",
    "features": ["list", "of", "features"],
    "framework": "Next.js",
    "styling": "Tailwind CSS + shadcn/ui"
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
        // Clean the response to handle backticks and other special characters
        const cleanedResponse = response
          .replace(/```json\n?/g, '') // Remove markdown code blocks
          .replace(/```\n?/g, '') // Remove remaining backticks
          .trim();
        
        this.logger.log('Cleaned AI response:', cleanedResponse.substring(0, 200) + '...');
        parsedResponse = JSON.parse(cleanedResponse);
      } catch (parseError) {
        this.logger.error('Failed to parse AI response as JSON', parseError);
        this.logger.error('Raw response:', response.substring(0, 500));
        throw new BadRequestException('Invalid response format from AI service');
      }

      const { nextjsContent, packageJson, tailwindConfig, metadata } = parsedResponse;

      if (!nextjsContent || !nextjsContent.page) {
        throw new BadRequestException('Generated Next.js content is incomplete');
      }

      // Save the generated website to database
      const website = await this.prisma.website.create({
        data: {
          title: dto.title || this.extractTitleFromNextjs(nextjsContent),
          description: dto.description || this.extractDescriptionFromNextjs(nextjsContent),
          prompt: dto.prompt,
          htmlContent: JSON.stringify(nextjsContent), // Store Next.js content as JSON
          cssContent: tailwindConfig || '',
          metadata: {
            ...metadata,
            packageJson: packageJson || {},
            framework: 'Next.js',
            styling: 'Tailwind CSS + shadcn/ui'
          },
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
        htmlContent: website.htmlContent, // This now contains Next.js content as JSON
        cssContent: website.cssContent, // This now contains Tailwind config
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

  private extractTitleFromNextjs(nextjsContent: any): string {
    // Try to extract title from page.tsx or layout.tsx
    const pageContent = nextjsContent.page || '';
    const layoutContent = nextjsContent.layout || '';
    const titleMatch = (pageContent + layoutContent).match(/title.*?['"`](.*?)['"`]/i);
    return titleMatch ? titleMatch[1] : 'Generated Next.js Website';
  }

  private extractDescriptionFromNextjs(nextjsContent: any): string {
    // Try to extract description from metadata or page content
    const pageContent = nextjsContent.page || '';
    const descriptionMatch = pageContent.match(/description.*?['"`](.*?)['"`]/i);
    return descriptionMatch ? descriptionMatch[1] : 'AI-generated Next.js application';
  }
}

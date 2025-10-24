import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { WebsiteGenerationResponseDto } from './dto/website-generation-response.dto';
import { GenerationLogService } from './generation-log.service';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

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
    const maxAttempts = 3;
    let lastError: any = null;

    this.logger.log(`Generating website for prompt: ${dto.prompt.substring(0, 100)}...`);

    // Retry logic with improved prompts
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`AI Generation attempt ${attempt}/${maxAttempts}`);
        
        const result = await this.attemptGeneration(dto, attempt);
        
        // Validate the generated content
        const validationResult = this.validateGeneratedContent(result);
        if (validationResult.isValid) {
          this.logger.log(`Website generated successfully on attempt ${attempt}`);
          return await this.saveGeneratedWebsite(dto, result, startTime, tokensUsed);
        } else {
          this.logger.warn(`Validation failed on attempt ${attempt}:`, validationResult.errors);
          if (attempt === maxAttempts) {
            throw new BadRequestException(`Content validation failed: ${validationResult.errors.join(', ')}`);
          }
        }
      } catch (error) {
        lastError = error;
        this.logger.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          // Generate fallback content on final failure
          this.logger.log('All AI attempts failed, generating fallback content');
          return await this.generateFallbackWebsite(dto, startTime, lastError);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    throw lastError;
  }

  private async attemptGeneration(dto: GenerateWebsiteDto, attempt: number): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(attempt);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: dto.prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: attempt === 1 ? 0.7 : 0.3, // Lower temperature for retries
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new BadRequestException('AI service did not return any content.');
    }

    // Parse the AI response with improved error handling
    let parsedResponse;
    try {
      const cleanedResponse = this.cleanAIResponse(response);
      this.logger.log(`Cleaned AI response (attempt ${attempt}):`, cleanedResponse.substring(0, 200) + '...');
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      this.logger.error(`JSON parsing failed on attempt ${attempt}:`, parseError);
      this.logger.error('Raw response:', response.substring(0, 500));
      throw new BadRequestException(`Invalid response format from AI service: ${parseError.message}`);
    }

    return parsedResponse;
  }

  private buildSystemPrompt(attempt: number): string {
    const basePrompt = `You are an expert Next.js developer. Generate a complete, modern, and responsive Next.js application.

CRITICAL REQUIREMENTS:
1. Generate Next.js 14+ components with App Router
2. Use Tailwind CSS for styling
3. Use TypeScript for type safety
4. Include responsive design
5. Use modern React patterns (hooks, components)
6. Include proper SEO and accessibility
7. Generate multiple component files as needed

MANDATORY STRUCTURE - Include ALL of these files:
- Main page: page.tsx OR index.tsx OR pages/index.tsx
- Layout: layout.tsx OR _app.tsx OR _document.tsx  
- CSS: globals.css OR styles.css OR index.css
- At least 2 components (Header.tsx, Footer.tsx, etc.)

IMPORTANT: Return ONLY valid JSON. No markdown, no backticks, no code blocks.`;

    if (attempt > 1) {
      return basePrompt + `

RETRY ATTEMPT ${attempt}: 
- Focus on completeness and structure
- Ensure ALL required files are present
- Use simpler, more reliable patterns
- Double-check JSON validity`;
    }

    return basePrompt + `

Return your response as a JSON object with this EXACT structure:
{
  "nextjsContent": {
    "page.tsx": "export default function Page() { return <div>...</div>; }",
    "layout.tsx": "export default function Layout({ children }) { return <div>{children}</div>; }",
    "globals.css": "@tailwind base; @tailwind components; @tailwind utilities;",
    "components": {
      "Header.tsx": "export default function Header() { return <header>...</header>; }",
      "Footer.tsx": "export default function Footer() { return <footer>...</footer>; }"
    }
  },
  "packageJson": {
    "dependencies": {
      "next": "^14.0.0",
      "react": "^18.0.0",
      "tailwindcss": "^3.0.0"
    }
  },
  "tailwindConfig": "module.exports = { content: ['./src/**/*.{js,ts,jsx,tsx}'], theme: { extend: {} }, plugins: [] };",
  "metadata": {
    "category": "website category",
    "theme": "color theme", 
    "features": ["Responsive Design", "Modern UI"],
    "framework": "Next.js",
    "styling": "Tailwind CSS"
  }
}`;
  }

  private cleanAIResponse(response: string): string {
    return response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Remove any text before the first {
      .replace(/[^}]*$/, '') // Remove any text after the last }
      .trim();
  }

  private validateGeneratedContent(parsedResponse: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parsedResponse) {
      errors.push('No response received');
      return { isValid: false, errors };
    }

    const { nextjsContent, packageJson, tailwindConfig, metadata } = parsedResponse;

    if (!nextjsContent) {
      errors.push('Missing nextjsContent');
      return { isValid: false, errors };
    }

    // Check for main page file (flexible naming)
    const hasMainPage = nextjsContent['page.tsx'] || 
                       nextjsContent['index.tsx'] || 
                       (nextjsContent.pages && nextjsContent.pages['index.tsx']);
    
    if (!hasMainPage) {
      errors.push('Missing main page file (page.tsx, index.tsx, or pages/index.tsx)');
    }

    // Check for layout file (flexible naming)
    const hasLayout = nextjsContent['layout.tsx'] || 
                      nextjsContent['_app.tsx'] ||
                      nextjsContent['_document.tsx'];
    
    if (!hasLayout) {
      errors.push('Missing layout file (layout.tsx, _app.tsx, or _document.tsx)');
    }

    // Check for CSS file (flexible naming)
    const hasCSS = nextjsContent['globals.css'] || 
                   nextjsContent['styles.css'] ||
                   nextjsContent['index.css'];
    
    if (!hasCSS) {
      errors.push('Missing CSS file (globals.css, styles.css, or index.css)');
    }

    // Check components (flexible structure)
    const hasComponents = nextjsContent.components || 
                         (nextjsContent.pages && Object.keys(nextjsContent.pages).length > 1);
    
    if (!hasComponents) {
      errors.push('Missing components or multiple pages');
    }

    // Validate content quality for main page
    const mainPageContent = nextjsContent['page.tsx'] || 
                           nextjsContent['index.tsx'] || 
                           (nextjsContent.pages && nextjsContent.pages['index.tsx']);
    
    if (mainPageContent && mainPageContent.length < 30) {
      errors.push('Main page content too short');
    }

    return { isValid: errors.length === 0, errors };
  }

  private async saveGeneratedWebsite(dto: GenerateWebsiteDto, parsedResponse: any, startTime: number, tokensUsed: number): Promise<WebsiteGenerationResponseDto> {
    const { nextjsContent, packageJson, tailwindConfig, metadata } = parsedResponse;

    // Save the generated website to database
    const website = await this.prisma.website.create({
      data: {
        title: dto.title || this.extractTitleFromNextjs(nextjsContent),
        description: dto.description || this.extractDescriptionFromNextjs(nextjsContent),
        prompt: dto.prompt,
        htmlContent: JSON.stringify(nextjsContent),
        cssContent: tailwindConfig || '',
        metadata: {
          ...metadata,
          packageJson: packageJson || {},
          framework: 'Next.js',
          styling: 'Tailwind CSS',
          generationAttempts: 1,
          generationSuccess: true
        },
        isPublic: dto.isPublic || false,
      },
    });

    // Log the generation
    await this.generationLogService.logGeneration({
      prompt: dto.prompt,
      response: JSON.stringify(parsedResponse),
      duration: Date.now() - startTime,
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
  }

  private async generateFallbackWebsite(dto: GenerateWebsiteDto, startTime: number, lastError: any): Promise<WebsiteGenerationResponseDto> {
    this.logger.log('Generating fallback website content');

    const fallbackContent = {
      'page.tsx': `import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ${dto.title || 'Generated Website'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          ${dto.description || 'A simple, responsive website generated by AI.'}
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-700">
            This is a fallback website generated when AI generation failed.
            The original prompt was: "${dto.prompt}"
          </p>
        </div>
      </div>
    </div>
  );
}`,
      'layout.tsx': `import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${dto.title || 'Generated Website'}</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}`,
      'globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`,
      'components': {
        'Header.tsx': `import React from 'react';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">${dto.title || 'Website'}</h1>
      </div>
    </header>
  );
}`,
        'Footer.tsx': `import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2024 Generated Website. All rights reserved.</p>
      </div>
    </footer>
  );
}`
      }
    };

    const fallbackMetadata = {
      category: 'fallback',
      theme: 'simple',
      features: ['Responsive Design', 'Fallback Content'],
      framework: 'Next.js',
      styling: 'Tailwind CSS',
      generationAttempts: 3,
      generationSuccess: false,
      fallbackReason: lastError?.message || 'AI generation failed',
      isFallback: true
    };

    // Save fallback website
    const website = await this.prisma.website.create({
      data: {
        title: dto.title || 'Fallback Website',
        description: dto.description || 'Fallback website generated due to AI failure',
        prompt: dto.prompt,
        htmlContent: JSON.stringify(fallbackContent),
        cssContent: 'module.exports = { content: ["./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };',
        metadata: fallbackMetadata,
        isPublic: dto.isPublic || false,
      },
    });

    // Log the fallback generation
    await this.generationLogService.logGeneration({
      prompt: dto.prompt,
      response: JSON.stringify({ fallback: true, error: lastError?.message }),
      duration: Date.now() - startTime,
      tokens: 0,
    });

    this.logger.log(`Fallback website generated: ${website.id}`);

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
  }

  private extractTitleFromNextjs(nextjsContent: any): string {
    // Try to extract title from various page files
    const pageContent = nextjsContent['page.tsx'] || 
                       nextjsContent['index.tsx'] || 
                       (nextjsContent.pages && nextjsContent.pages['index.tsx']) || '';
    
    const layoutContent = nextjsContent['layout.tsx'] || 
                         nextjsContent['_app.tsx'] ||
                         nextjsContent['_document.tsx'] || '';
    
    const titleMatch = (pageContent + layoutContent).match(/title.*?['"`](.*?)['"`]/i);
    return titleMatch ? titleMatch[1] : 'Generated Next.js Website';
  }

  private extractDescriptionFromNextjs(nextjsContent: any): string {
    // Try to extract description from various page files
    const pageContent = nextjsContent['page.tsx'] || 
                       nextjsContent['index.tsx'] || 
                       (nextjsContent.pages && nextjsContent.pages['index.tsx']) || '';
    
    const descriptionMatch = pageContent.match(/description.*?['"`](.*?)['"`]/i);
    return descriptionMatch ? descriptionMatch[1] : 'AI-generated Next.js application';
  }
}
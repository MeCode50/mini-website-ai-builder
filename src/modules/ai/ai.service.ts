import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { WebsiteGenerationResponseDto } from './dto/website-generation-response.dto';
import { GenerationLogService } from './generation-log.service';
import { ComplexValidationService } from './complex-validation.service';

interface GenerationStep {
  name: string;
  prompt: string;
  temperature: number;
  maxTokens?: number;
}

interface ComplexWebsiteStructure {
  mainPage: string;
  layout: string;
  components: Record<string, string>;
  styles: string;
  utilities: string;
  hooks: Record<string, string>;
  types: Record<string, string>;
  config: Record<string, string>;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly generationLogService: GenerationLogService,
    private readonly complexValidationService: ComplexValidationService,
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

    this.logger.log(`Generating complex website for prompt: ${dto.prompt.substring(0, 100)}...`);

    // Analyze prompt complexity
    const complexity = this.analyzePromptComplexity(dto.prompt);
    this.logger.log(`Detected complexity level: ${complexity.level}`);

    // Use different generation strategies based on complexity
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`AI Generation attempt ${attempt}/${maxAttempts} (${complexity.level} complexity)`);
        
        let result: any;
        
        if (complexity.level === 'simple') {
          result = await this.generateSimpleWebsite(dto, attempt);
        } else if (complexity.level === 'moderate') {
          result = await this.generateModerateWebsite(dto, attempt);
        } else {
          result = await this.generateComplexWebsite(dto, attempt, complexity);
        }
        
        // Validate the generated content using complex validation service
        const validationResult = this.complexValidationService.validateComplexWebsite(result, complexity);
        if (validationResult.isValid) {
          this.logger.log(`Complex website generated successfully on attempt ${attempt} (Score: ${validationResult.score})`);
          return await this.saveGeneratedWebsite(dto, result, startTime, tokensUsed, complexity);
        } else {
          this.logger.warn(`Validation failed on attempt ${attempt}:`, validationResult.errors);
          this.logger.log(`Validation score: ${validationResult.score}, Suggestions: ${validationResult.suggestions.join(', ')}`);
          if (attempt === maxAttempts) {
            throw new BadRequestException(`Content validation failed: ${validationResult.errors.join(', ')}`);
          }
        }
      } catch (error) {
        lastError = error;
        this.logger.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          // Generate fallback content on final failure
          this.logger.log('All AI attempts failed, generating advanced fallback content');
          return await this.generateAdvancedFallbackWebsite(dto, startTime, lastError, complexity);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }

    throw lastError;
  }

  private analyzePromptComplexity(prompt: string): { level: string; features: string[]; score: number } {
    const features = [];
    let score = 0;

    // E-commerce features
    if (prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('shopping')) {
      features.push('ecommerce');
      score += 3;
    }
    if (prompt.toLowerCase().includes('cart') || prompt.toLowerCase().includes('checkout')) {
      features.push('shopping_cart');
      score += 2;
    }
    if (prompt.toLowerCase().includes('product') || prompt.toLowerCase().includes('catalog')) {
      features.push('product_catalog');
      score += 2;
    }

    // Advanced UI features
    if (prompt.toLowerCase().includes('carousel') || prompt.toLowerCase().includes('slider')) {
      features.push('carousel');
      score += 2;
    }
    if (prompt.toLowerCase().includes('modal') || prompt.toLowerCase().includes('popup')) {
      features.push('modal');
      score += 1;
    }
    if (prompt.toLowerCase().includes('animation') || prompt.toLowerCase().includes('hover')) {
      features.push('animations');
      score += 2;
    }

    // Complex layouts
    if (prompt.toLowerCase().includes('dashboard') || prompt.toLowerCase().includes('admin')) {
      features.push('dashboard');
      score += 3;
    }
    if (prompt.toLowerCase().includes('multi-page') || prompt.toLowerCase().includes('multiple pages')) {
      features.push('multi_page');
      score += 2;
    }

    // Advanced styling
    if (prompt.toLowerCase().includes('gradient') || prompt.toLowerCase().includes('custom')) {
      features.push('advanced_styling');
      score += 1;
    }
    if (prompt.toLowerCase().includes('responsive') || prompt.toLowerCase().includes('mobile')) {
      features.push('responsive');
      score += 1;
    }

    // Authentication/User features
    if (prompt.toLowerCase().includes('login') || prompt.toLowerCase().includes('auth')) {
      features.push('authentication');
      score += 2;
    }
    if (prompt.toLowerCase().includes('user') || prompt.toLowerCase().includes('profile')) {
      features.push('user_management');
      score += 2;
    }

    let level = 'simple';
    if (score >= 8) level = 'complex';
    else if (score >= 4) level = 'moderate';

    return { level, features, score };
  }

  private async generateComplexWebsite(dto: GenerateWebsiteDto, attempt: number, complexity: any): Promise<any> {
    this.logger.log(`Generating complex website with features: ${complexity.features.join(', ')}`);

    // Multi-step generation for complex websites
    const steps: GenerationStep[] = [
      {
        name: 'project_structure',
        prompt: this.buildProjectStructurePrompt(dto, complexity),
        temperature: 0.3
      },
      {
        name: 'main_components',
        prompt: this.buildMainComponentsPrompt(dto, complexity),
        temperature: 0.4
      },
      {
        name: 'advanced_features',
        prompt: this.buildAdvancedFeaturesPrompt(dto, complexity),
        temperature: 0.5
      },
      {
        name: 'styling_animations',
        prompt: this.buildStylingPrompt(dto, complexity),
        temperature: 0.6
      },
      {
        name: 'integration_validation',
        prompt: this.buildIntegrationPrompt(dto, complexity),
        temperature: 0.2
      }
    ];

    const results: any = {};
    
    for (const step of steps) {
      try {
        this.logger.log(`Executing step: ${step.name}`);
        const stepResult = await this.executeGenerationStep(step, dto.prompt);
        results[step.name] = stepResult;
        
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(`Step ${step.name} failed:`, error.message);
        throw error;
      }
    }

    // Combine all step results into final structure
    return this.combineGenerationResults(results, complexity);
  }

  private buildProjectStructurePrompt(dto: GenerateWebsiteDto, complexity: any): string {
    return `You are an expert Next.js architect. Create a comprehensive project structure for a ${complexity.level} website.

PROJECT REQUIREMENTS:
- Website Type: ${dto.title || 'Advanced Website'}
- Description: ${dto.description || dto.prompt}
- Complexity Level: ${complexity.level}
- Features Required: ${complexity.features.join(', ')}

MANDATORY PROJECT STRUCTURE:
Create a complete Next.js 14+ project with App Router that includes:

1. MAIN PAGES:
   - page.tsx (homepage)
   - layout.tsx (root layout)
   - globals.css (global styles)

2. COMPONENTS STRUCTURE:
   - components/ui/ (reusable UI components)
   - components/layout/ (layout components)
   - components/features/ (feature-specific components)

3. UTILITIES:
   - lib/utils.ts (utility functions)
   - lib/constants.ts (app constants)
   - hooks/ (custom React hooks)

4. TYPES:
   - types/index.ts (TypeScript definitions)

5. CONFIGURATION:
   - tailwind.config.js (Tailwind configuration)
   - next.config.js (Next.js configuration)

Return ONLY valid JSON with this structure:
{
  "projectStructure": {
    "pages": {
      "page.tsx": "complete homepage component",
      "layout.tsx": "complete root layout"
    },
    "components": {
      "ui": {
        "Button.tsx": "reusable button component",
        "Card.tsx": "reusable card component"
      },
      "layout": {
        "Header.tsx": "site header",
        "Footer.tsx": "site footer",
        "Navigation.tsx": "navigation component"
      },
      "features": {
        "ProductCard.tsx": "product display component",
        "Cart.tsx": "shopping cart component"
      }
    },
    "utilities": {
      "utils.ts": "utility functions",
      "constants.ts": "app constants"
    },
    "hooks": {
      "useCart.ts": "cart management hook",
      "useAuth.ts": "authentication hook"
    },
    "types": {
      "index.ts": "TypeScript definitions"
    },
    "config": {
      "tailwind.config.js": "Tailwind configuration",
      "next.config.js": "Next.js configuration"
    }
  }
}`;
  }

  private buildMainComponentsPrompt(dto: GenerateWebsiteDto, complexity: any): string {
    return `You are an expert React/Next.js developer. Create sophisticated, production-ready components.

COMPONENT REQUIREMENTS:
- Website: ${dto.title || 'Advanced Website'}
- Features: ${complexity.features.join(', ')}
- Complexity: ${complexity.level}

CREATE ADVANCED COMPONENTS:

1. INTERACTIVE COMPONENTS:
   - State management with useState/useReducer
   - Event handlers for user interactions
   - Proper TypeScript interfaces
   - Error boundaries and loading states

2. RESPONSIVE DESIGN:
   - Mobile-first approach
   - Breakpoint-specific styling
   - Touch-friendly interactions
   - Accessibility features (ARIA labels, keyboard navigation)

3. PERFORMANCE OPTIMIZATION:
   - React.memo for expensive components
   - useCallback for event handlers
   - Lazy loading for images
   - Proper key props for lists

4. ADVANCED FEATURES:
   - Form validation and submission
   - Data fetching with proper error handling
   - Animation and transitions
   - Custom hooks for reusable logic

Return ONLY valid JSON:
{
  "mainComponents": {
    "HomePage": "complete homepage with all features",
    "ProductCatalog": "advanced product listing with filters",
    "ShoppingCart": "full cart functionality with state management",
    "UserAuth": "authentication forms and logic",
    "Dashboard": "admin/user dashboard if required"
  }
}`;
  }

  private buildAdvancedFeaturesPrompt(dto: GenerateWebsiteDto, complexity: any): string {
    return `You are an expert in advanced web features. Implement sophisticated functionality.

ADVANCED FEATURES REQUIRED:
- Features: ${complexity.features.join(', ')}
- Website Type: ${dto.title}

IMPLEMENT THESE ADVANCED FEATURES:

1. E-COMMERCE FEATURES (if required):
   - Product catalog with search and filtering
   - Shopping cart with persistent storage
   - Checkout process with form validation
   - Order management and tracking
   - Payment integration placeholders

2. INTERACTIVE ELEMENTS:
   - Image galleries with lightbox
   - Carousels and sliders
   - Modal dialogs and popups
   - Dropdown menus and tooltips
   - Drag and drop functionality

3. DATA MANAGEMENT:
   - State management with Context API
   - Local storage integration
   - API integration patterns
   - Error handling and retry logic
   - Loading states and skeletons

4. ADVANCED STYLING:
   - CSS Grid and Flexbox layouts
   - Custom CSS animations
   - Dark/light theme switching
   - Responsive typography
   - Custom scrollbars

Return ONLY valid JSON:
{
  "advancedFeatures": {
    "ecommerce": {
      "ProductSearch": "search functionality",
      "CartManager": "cart state management",
      "CheckoutFlow": "checkout process"
    },
    "interactive": {
      "ImageGallery": "gallery with lightbox",
      "Carousel": "responsive carousel",
      "Modal": "modal dialog system"
    },
    "data": {
      "ApiClient": "API integration",
      "StorageManager": "local storage",
      "ErrorHandler": "error management"
    },
    "styling": {
      "ThemeProvider": "theme management",
      "Animations": "CSS animations",
      "ResponsiveUtils": "responsive utilities"
    }
  }
}`;
  }

  private buildStylingPrompt(dto: GenerateWebsiteDto, complexity: any): string {
    return `You are an expert CSS/Tailwind developer. Create sophisticated styling and animations.

STYLING REQUIREMENTS:
- Website: ${dto.title}
- Features: ${complexity.features.join(', ')}
- Design: Modern, professional, responsive

CREATE ADVANCED STYLING:

1. TAILWIND CONFIGURATION:
   - Custom color palette
   - Extended spacing and sizing
   - Custom animations and transitions
   - Responsive breakpoints
   - Dark mode support

2. GLOBAL STYLES:
   - CSS reset and base styles
   - Typography system
   - Custom CSS variables
   - Animation keyframes
   - Utility classes

3. COMPONENT STYLING:
   - Consistent design system
   - Hover and focus states
   - Loading animations
   - Error state styling
   - Success state styling

4. RESPONSIVE DESIGN:
   - Mobile-first approach
   - Tablet and desktop layouts
   - Touch-friendly sizing
   - Accessibility considerations

Return ONLY valid JSON:
{
  "styling": {
    "tailwindConfig": "complete Tailwind configuration",
    "globalStyles": "global CSS with custom properties",
    "componentStyles": "component-specific styling",
    "animations": "CSS animations and transitions",
    "responsive": "responsive design utilities"
  }
}`;
  }

  private buildIntegrationPrompt(dto: GenerateWebsiteDto, complexity: any): string {
    return `You are an expert in Next.js integration. Ensure all components work together seamlessly.

INTEGRATION REQUIREMENTS:
- Combine all generated components
- Ensure proper imports and exports
- Validate TypeScript types
- Check for missing dependencies
- Verify responsive design

FINAL INTEGRATION CHECKLIST:
1. All components properly imported
2. TypeScript interfaces defined
3. Props and state properly typed
4. Error boundaries implemented
5. Loading states handled
6. Responsive design verified
7. Accessibility features included
8. Performance optimizations applied

Return ONLY valid JSON:
{
  "integration": {
    "packageJson": "complete package.json with all dependencies",
    "typescript": "TypeScript configuration",
    "imports": "all necessary imports",
    "exports": "proper component exports",
    "validation": "integration validation results"
  }
}`;
  }

  private async executeGenerationStep(step: GenerationStep, userPrompt: string): Promise<any> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: step.prompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: step.temperature,
      max_tokens: step.maxTokens || 4000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new BadRequestException(`AI service did not return content for step: ${step.name}`);
    }

    try {
      const cleanedResponse = this.cleanAIResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      this.logger.error(`JSON parsing failed for step ${step.name}:`, parseError);
      throw new BadRequestException(`Invalid response format for step ${step.name}: ${parseError.message}`);
    }
  }

  private combineGenerationResults(results: any, complexity: any): any {
    // Combine all step results into a unified structure
    const combined = {
      nextjsContent: {
        // Main pages
        'page.tsx': results.projectStructure?.projectStructure?.pages?.page || '',
        'layout.tsx': results.projectStructure?.projectStructure?.pages?.layout || '',
        'globals.css': results.styling?.styling?.globalStyles || '',
        
        // Components
        components: {
          ...results.projectStructure?.projectStructure?.components?.ui,
          ...results.projectStructure?.projectStructure?.components?.layout,
          ...results.projectStructure?.projectStructure?.components?.features,
        },
        
        // Advanced features
        ...results.advancedFeatures?.advancedFeatures,
        
        // Utilities and hooks
        utilities: results.projectStructure?.projectStructure?.utilities,
        hooks: results.projectStructure?.projectStructure?.hooks,
        types: results.projectStructure?.projectStructure?.types,
      },
      
      packageJson: results.integration?.integration?.packageJson || {
        dependencies: {
          "next": "^14.0.0",
          "react": "^18.0.0",
          "react-dom": "^18.0.0",
          "tailwindcss": "^3.0.0",
          "@types/react": "^18.0.0",
          "@types/node": "^20.0.0",
          "typescript": "^5.0.0"
        }
      },
      
      tailwindConfig: results.styling?.styling?.tailwindConfig || 'module.exports = { content: ["./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };',
      
      metadata: {
        category: this.determineCategory(complexity.features),
        theme: this.determineTheme(complexity.features),
        features: complexity.features,
        framework: 'Next.js 14',
        styling: 'Tailwind CSS + Custom CSS',
        complexity: complexity.level,
        generationMethod: 'multi-step',
        componentsCount: Object.keys(results.projectStructure?.projectStructure?.components || {}).length,
        advancedFeatures: Object.keys(results.advancedFeatures?.advancedFeatures || {}).length
      }
    };

    return combined;
  }

  private cleanAIResponse(response: string): string {
    return response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim();
  }

  private determineCategory(features: string[]): string {
    if (features.includes('ecommerce')) return 'ecommerce';
    if (features.includes('dashboard')) return 'dashboard';
    if (features.includes('authentication')) return 'webapp';
    return 'website';
  }

  private determineTheme(features: string[]): string {
    if (features.includes('dark')) return 'dark';
    if (features.includes('luxury') || features.includes('premium')) return 'luxury';
    return 'modern';
  }

  private async generateModerateWebsite(dto: GenerateWebsiteDto, attempt: number): Promise<any> {
    // Simplified version for moderate complexity
    return await this.generateSimpleWebsite(dto, attempt);
  }

  private async generateSimpleWebsite(dto: GenerateWebsiteDto, attempt: number): Promise<any> {
    // Original simple generation logic
    const systemPrompt = this.buildSimpleSystemPrompt(attempt);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: dto.prompt },
      ],
      temperature: attempt === 1 ? 0.7 : 0.3,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new BadRequestException('AI service did not return any content.');
    }

    try {
      const cleanedResponse = this.cleanAIResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      this.logger.error(`JSON parsing failed:`, parseError);
      throw new BadRequestException(`Invalid response format: ${parseError.message}`);
    }
  }

  private buildSimpleSystemPrompt(attempt: number): string {
    return `You are an expert Next.js developer. Generate a complete, modern, and responsive Next.js application.

Requirements:
1. Generate Next.js 14+ components with App Router
2. Use Tailwind CSS for styling
3. Use TypeScript for type safety
4. Include responsive design
5. Use modern React patterns (hooks, components)
6. Include proper SEO and accessibility

Return your response as a JSON object with this structure:
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
  "tailwindConfig": "module.exports = { content: [\"./src/**/*.{js,ts,jsx,tsx}\"], theme: { extend: {} }, plugins: [] };",
  "metadata": {
    "category": "website",
    "theme": "modern",
    "features": ["Responsive Design", "Modern UI"],
    "framework": "Next.js",
    "styling": "Tailwind CSS"
  }
}`;
  }

  private async saveGeneratedWebsite(dto: GenerateWebsiteDto, parsedResponse: any, startTime: number, tokensUsed: number, complexity?: any): Promise<WebsiteGenerationResponseDto> {
    const { nextjsContent, packageJson, tailwindConfig, metadata } = parsedResponse;

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
          framework: 'Next.js 14',
          styling: 'Tailwind CSS + Custom CSS',
          complexity: complexity?.level || 'simple',
          generationMethod: complexity?.level === 'complex' ? 'multi-step' : 'single-step',
          tokensUsed,
          generationTime: Date.now() - startTime
        },
        isPublic: dto.isPublic || false,
      },
    });

    await this.generationLogService.logGeneration({
      prompt: dto.prompt,
      response: JSON.stringify(parsedResponse),
      duration: Date.now() - startTime,
      tokens: tokensUsed,
    });

    this.logger.log(`Complex website generated successfully: ${website.id}`);

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

  private async generateAdvancedFallbackWebsite(dto: GenerateWebsiteDto, startTime: number, lastError: any, complexity?: any): Promise<WebsiteGenerationResponseDto> {
    this.logger.log('Generating advanced fallback website content');

    const fallbackContent = {
      'page.tsx': `import React from 'react';
import { useState, useEffect } from 'react';

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            ${dto.title || 'Advanced Website'}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            ${dto.description || 'A sophisticated, responsive website with advanced features.'}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 hover:border-white text-white px-8 py-3 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Advanced Features</h3>
            <p className="text-gray-600">This fallback website includes modern design patterns and responsive layouts.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Responsive Design</h3>
            <p className="text-gray-600">Optimized for all devices with mobile-first approach.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Modern Stack</h3>
            <p className="text-gray-600">Built with Next.js, React, and Tailwind CSS.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">About This Website</h2>
          <p className="text-gray-700 mb-4">
            This is an advanced fallback website generated when AI generation failed.
            The original prompt was: "${dto.prompt}"
          </p>
          <p className="text-gray-700">
            Complexity Level: ${complexity?.level || 'simple'} | 
            Features: ${complexity?.features?.join(', ') || 'basic'}
          </p>
        </div>
      </div>
    </div>
  );
}`,
      'layout.tsx': `import React from 'react';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>${dto.title || 'Advanced Website'}</title>
        <meta name="description" content="${dto.description || 'Advanced website with modern features'}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}`,
      'globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }
  
  body {
    @apply text-gray-900 bg-white;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-lg p-6;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  }
}`,
      'components': {
        'Header.tsx': `import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            ${dto.title || 'Advanced Website'}
          </h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}`,
        'Footer.tsx': `import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-white">LinkedIn</a>
              <a href="#" className="text-gray-300 hover:text-white">GitHub</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Advanced Website. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}`
      }
    };

    const fallbackMetadata = {
      category: complexity?.level === 'complex' ? 'advanced' : 'website',
      theme: 'modern',
      features: ['Responsive Design', 'Advanced Fallback', 'Modern UI'],
      framework: 'Next.js 14',
      styling: 'Tailwind CSS + Custom CSS',
      generationAttempts: 3,
      generationSuccess: false,
      fallbackReason: lastError?.message || 'AI generation failed',
      isFallback: true,
      complexity: complexity?.level || 'simple',
      originalFeatures: complexity?.features || []
    };

    const website = await this.prisma.website.create({
      data: {
        title: dto.title || 'Advanced Fallback Website',
        description: dto.description || 'Advanced fallback website generated due to AI failure',
        prompt: dto.prompt,
        htmlContent: JSON.stringify(fallbackContent),
        cssContent: 'module.exports = { content: ["./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] };',
        metadata: fallbackMetadata,
        isPublic: dto.isPublic || false,
      },
    });

    await this.generationLogService.logGeneration({
      prompt: dto.prompt,
      response: JSON.stringify({ fallback: true, error: lastError?.message }),
      duration: Date.now() - startTime,
      tokens: 0,
    });

    this.logger.log(`Advanced fallback website generated: ${website.id}`);

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
    const pageContent = nextjsContent['page.tsx'] || nextjsContent['index.tsx'] || '';
    const layoutContent = nextjsContent['layout.tsx'] || nextjsContent['_app.tsx'] || '';
    const titleMatch = (pageContent + layoutContent).match(/title.*?['"`](.*?)['"`]/i);
    return titleMatch ? titleMatch[1] : 'Generated Next.js Website';
  }

  private extractDescriptionFromNextjs(nextjsContent: any): string {
    const pageContent = nextjsContent['page.tsx'] || nextjsContent['index.tsx'] || '';
    const descriptionMatch = pageContent.match(/description.*?['"`](.*?)['"`]/i);
    return descriptionMatch ? descriptionMatch[1] : 'AI-generated Next.js application';
  }
}
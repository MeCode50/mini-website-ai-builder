import { ApiProperty } from '@nestjs/swagger';

export class WebsiteGenerationResponseDto {
  @ApiProperty({
    description: 'The generated website ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The website title',
    example: 'John Doe Photography Portfolio',
  })
  title: string;

  @ApiProperty({
    description: 'The website description',
    example: 'A modern portfolio website showcasing professional photography work',
  })
  description: string;

  @ApiProperty({
    description: 'The original prompt used for generation',
    example: 'Create a portfolio website for a photographer with a dark theme and gallery section',
  })
  prompt: string;

  @ApiProperty({
    description: 'The generated Next.js content (JSON string)',
    example: '{"page.tsx": "export default function Page() {...}", "components": {...}}',
  })
  htmlContent: string;

  @ApiProperty({
    description: 'The Tailwind CSS configuration',
    example: 'module.exports = { content: ["./src/**/*.{js,ts,jsx,tsx}"], ... }',
  })
  cssContent: string;

  @ApiProperty({
    description: 'Whether the website is public',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Website creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Website last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Additional metadata about the generated website',
    example: { category: 'portfolio', theme: 'dark', features: ['gallery', 'contact-form'] },
  })
  metadata: Record<string, any>;
}

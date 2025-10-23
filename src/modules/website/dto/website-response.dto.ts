import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebsiteResponseDto {
  @ApiProperty({
    description: 'The website ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The website title',
    example: 'John Doe Photography Portfolio',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'The website description',
    example: 'A modern portfolio website showcasing professional photography work',
  })
  description?: string;

  @ApiProperty({
    description: 'The original prompt used for generation',
    example: 'Create a portfolio website for a photographer with a dark theme and gallery section',
  })
  prompt: string;

  @ApiProperty({
    description: 'The HTML content of the website',
    example: '<!DOCTYPE html><html>...</html>',
  })
  htmlContent: string;

  @ApiPropertyOptional({
    description: 'The CSS content of the website',
    example: 'body { font-family: Arial, sans-serif; }',
  })
  cssContent?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the website',
    example: { category: 'portfolio', theme: 'dark', features: ['gallery', 'contact-form'] },
  })
  metadata?: Record<string, any>;

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
}

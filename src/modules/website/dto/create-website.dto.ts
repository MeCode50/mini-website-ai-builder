import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebsiteDto {
  @ApiProperty({
    description: 'The website title',
    example: 'John Doe Photography Portfolio',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'The website description',
    example: 'A modern portfolio website showcasing professional photography work',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'The original prompt used for generation',
    example: 'Create a portfolio website for a photographer with a dark theme and gallery section',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Prompt must not exceed 1000 characters' })
  prompt: string;

  @ApiProperty({
    description: 'The HTML content of the website',
    example: '<!DOCTYPE html><html>...</html>',
  })
  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @ApiPropertyOptional({
    description: 'The CSS content of the website',
    example: 'body { font-family: Arial, sans-serif; }',
  })
  @IsOptional()
  @IsString()
  cssContent?: string;

  @ApiPropertyOptional({
    description: 'Whether the website is public',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional metadata about the website',
    example: { category: 'portfolio', theme: 'dark', features: ['gallery', 'contact-form'] },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

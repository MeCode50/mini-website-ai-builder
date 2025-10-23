import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateWebsiteDto {
  @ApiProperty({
    description: 'The prompt describing the website to generate',
    example: 'Create a portfolio website for a photographer with a dark theme and gallery section',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Prompt must not exceed 1000 characters' })
  prompt: string;

  @ApiPropertyOptional({
    description: 'Title for the generated website',
    example: 'John Doe Photography Portfolio',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Description for the generated website',
    example: 'A modern portfolio website showcasing professional photography work',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the website should be public',
    default: false,
  })
  @IsOptional()
  isPublic?: boolean = false;
}

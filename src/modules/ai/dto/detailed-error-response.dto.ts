import { ApiProperty } from '@nestjs/swagger';

export class DetailedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type identifier',
    example: 'GENERATION_FAILED',
  })
  error: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'AI generation failed: Missing page.tsx component',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      attempt: 2,
      maxAttempts: 3,
      failureReason: 'incomplete_nextjs_structure',
      suggestions: ['Try a simpler prompt', 'Reduce complexity'],
      timestamp: '2025-10-24T05:10:00.000Z'
    },
  })
  details: {
    attempt?: number;
    maxAttempts?: number;
    failureReason?: string;
    suggestions?: string[];
    timestamp: string;
    validationErrors?: string[];
    isFallback?: boolean;
  };
}

import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class WebsiteQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term for title or description',
    example: 'photography',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by public status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by category in metadata',
    example: 'portfolio',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by theme in metadata',
    example: 'dark',
  })
  @IsOptional()
  @IsString()
  theme?: string;
}

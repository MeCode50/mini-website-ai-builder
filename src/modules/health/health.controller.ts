import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async check() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with database and AI service status' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'healthy' },
            ai: { type: 'string', example: 'healthy' },
          },
        },
        stats: {
          type: 'object',
          properties: {
            totalWebsites: { type: 'number', example: 150 },
            totalGenerations: { type: 'number', example: 200 },
            successfulGenerations: { type: 'number', example: 180 },
            failedGenerations: { type: 'number', example: 20 },
          },
        },
      },
    },
  })
  async detailedCheck() {
    return this.healthService.getDetailedHealthStatus();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerationLogService } from '../ai/generation-log.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly generationLogService: GenerationLogService,
  ) {}

  async getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.configService.get('npm_package_version', '1.0.0'),
    };
  }

  async getDetailedHealthStatus() {
    const basicHealth = await this.getHealthStatus();
    
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      const databaseStatus = 'healthy';

      // Get statistics
      const [websiteCount, generationStats] = await Promise.all([
        this.prisma.website.count(),
        this.generationLogService.getGenerationStats(),
      ]);

      return {
        ...basicHealth,
        services: {
          database: databaseStatus,
          ai: 'healthy', // We assume AI is healthy if we can reach this point
        },
        stats: {
          totalWebsites: websiteCount,
          totalGenerations: generationStats.totalGenerations,
          successfulGenerations: generationStats.successfulGenerations,
          failedGenerations: generationStats.failedGenerations,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      
      return {
        ...basicHealth,
        status: 'error',
        services: {
          database: 'unhealthy',
          ai: 'unknown',
        },
        error: error.message,
      };
    }
  }
}

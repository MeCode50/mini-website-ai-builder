import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface LogGenerationData {
  prompt: string;
  response?: string;
  error?: string;
  duration: number;
  tokens?: number;
}

@Injectable()
export class GenerationLogService {
  private readonly logger = new Logger(GenerationLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logGeneration(data: LogGenerationData): Promise<void> {
    try {
      await this.prisma.generationLog.create({
        data: {
          prompt: data.prompt,
          response: data.response,
          error: data.error,
          duration: data.duration,
          tokens: data.tokens,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log generation', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getGenerationStats(): Promise<{
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageDuration: number;
    totalTokens: number;
  }> {
    const [total, successful, failed, avgDuration, totalTokens] = await Promise.all([
      this.prisma.generationLog.count(),
      this.prisma.generationLog.count({ where: { error: null } }),
      this.prisma.generationLog.count({ where: { error: { not: null } } }),
      this.prisma.generationLog.aggregate({
        _avg: { duration: true },
      }),
      this.prisma.generationLog.aggregate({
        _sum: { tokens: true },
      }),
    ]);

    return {
      totalGenerations: total,
      successfulGenerations: successful,
      failedGenerations: failed,
      averageDuration: avgDuration._avg.duration || 0,
      totalTokens: totalTokens._sum.tokens || 0,
    };
  }
}

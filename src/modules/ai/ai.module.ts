import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { GenerationLogService } from './generation-log.service';

@Module({
  imports: [ConfigModule],
  providers: [AiService, GenerationLogService],
  exports: [AiService, GenerationLogService],
})
export class AiModule {}

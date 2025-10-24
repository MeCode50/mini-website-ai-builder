import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GenerationLogService } from './generation-log.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, GenerationLogService],
  exports: [AiService, GenerationLogService],
})
export class AiModule {}

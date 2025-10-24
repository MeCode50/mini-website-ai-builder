import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GenerationLogService } from './generation-log.service';
import { ComplexValidationService } from './complex-validation.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, GenerationLogService, ComplexValidationService],
  exports: [AiService, GenerationLogService, ComplexValidationService],
})
export class AiModule {}

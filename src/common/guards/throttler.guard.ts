import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Use IP address as the tracker for rate limiting
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }
}

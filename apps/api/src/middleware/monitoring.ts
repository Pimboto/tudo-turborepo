// src/middleware/monitoring.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

interface MetricsData {
  totalRequests: number;
  totalErrors: number;
  responseTimeSum: number;
  averageResponseTime: number;
  requestsByEndpoint: Map<string, number>;
  errorsByEndpoint: Map<string, number>;
  startTime: Date;
}

class Metrics {
  private data: MetricsData = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimeSum: 0,
    averageResponseTime: 0,
    requestsByEndpoint: new Map(),
    errorsByEndpoint: new Map(),
    startTime: new Date(),
  };

  recordRequest(endpoint: string, responseTime: number, isError: boolean = false) {
    this.data.totalRequests++;
    this.data.responseTimeSum += responseTime;
    this.data.averageResponseTime = this.data.responseTimeSum / this.data.totalRequests;

    // Track by endpoint
    const currentCount = this.data.requestsByEndpoint.get(endpoint) ?? 0;
    this.data.requestsByEndpoint.set(endpoint, currentCount + 1);

    if (isError) {
      this.data.totalErrors++;
      const currentErrorCount = this.data.errorsByEndpoint.get(endpoint) ?? 0;
      this.data.errorsByEndpoint.set(endpoint, currentErrorCount + 1);
    }
  }

  getMetrics() {
    const uptime = Date.now() - this.data.startTime.getTime();
    return {
      ...this.data,
      uptime,
      uptimeFormatted: this.formatUptime(uptime),
      requestsPerSecond: this.data.totalRequests / (uptime / 1000),
      errorRate: this.data.totalErrors / this.data.totalRequests,
      requestsByEndpoint: Object.fromEntries(this.data.requestsByEndpoint),
      errorsByEndpoint: Object.fromEntries(this.data.errorsByEndpoint),
    };
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

export const metrics = new Metrics();

export const metricsMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path ?? req.path}`;
    const isError = res.statusCode >= 400;
    
    metrics.recordRequest(endpoint, responseTime, isError);
  });

  next();
};

// Metrics endpoint
export const getMetricsHandler: RequestHandler = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: metrics.getMetrics(),
  });
};

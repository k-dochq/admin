import { NextRequest } from 'next/server';

export interface RouteErrorLogParams {
  error: Error;
  endpoint: string;
  method: string;
  request: NextRequest;
  additionalData?: Record<string, unknown>;
}

export class RouteErrorLogger {
  logError(params: RouteErrorLogParams): string {
    const { error, endpoint, method, request, additionalData } = params;
    const requestId = this.generateRequestId();

    const errorLog = {
      requestId,
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        method: request.method,
      },
      additionalData,
    };

    // 콘솔에 에러 로그 출력 (실제 프로덕션에서는 로깅 서비스로 전송)
    console.error('Route Error:', JSON.stringify(errorLog, null, 2));

    return requestId;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const routeErrorLogger = new RouteErrorLogger();

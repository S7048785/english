import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class InterceptorExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      exception = new HttpException('服务端错误', 500);
    }
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    response.status(exception.getStatus()).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      code: exception.getStatus(),
      success: false,
    });
  }
}

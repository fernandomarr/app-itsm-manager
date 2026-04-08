import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get tenant ID from request
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);

/**
 * Get current user from request
 * Usage: @CurrentUser() user: AuthPayload
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Get pagination params from request
 * Usage: @Pagination() pagination: { page: number, limit: number }
 */
export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): { page: number; limit: number; offset: number } => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  },
);

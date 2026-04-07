import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * TenantGuard extracts tenant ID from header or JWT payload
 * and attaches it to the request object
 */
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try to get tenant from header first
    const tenantIdFromHeader = request.headers['x-tenant-id'] as string;

    // Or from JWT payload
    const tenantIdFromToken = request.user?.tenant_id;

    // Or from route params
    const tenantIdFromParams = request.params.tenantId;

    const tenantId = tenantIdFromHeader || tenantIdFromToken || tenantIdFromParams;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required. Provide it via X-Tenant-ID header or authenticate with a tenant-scoped token.');
    }

    request['tenantId'] = tenantId;
    return true;
  }
}

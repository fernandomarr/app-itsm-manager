import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantRole } from '../types/roles.types';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: TenantRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<TenantRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user role from request (set by middleware or JWT)
    const userRole = request.userRole as TenantRole;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => {
      // Role hierarchy: owner > admin > member > viewer
      const roleHierarchy: Record<TenantRole, number> = {
        viewer: 1,
        member: 2,
        admin: 3,
        owner: 4,
      };

      return roleHierarchy[userRole] >= roleHierarchy[role];
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, Found: ${userRole}`,
      );
    }

    return true;
  }
}

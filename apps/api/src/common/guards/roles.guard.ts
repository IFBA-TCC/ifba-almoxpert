import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType, JwtPayload } from 'shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Enforces role-based access using `user_type` from the JWT payload.
 * No separate roles table needed — the ENUM on the users table is the source
 * of truth.
 *
 * Usage (combine with JwtAuthGuard):
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(UserType.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator → route is accessible to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (!requiredRoles.includes(user.userType)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

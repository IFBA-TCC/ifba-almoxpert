import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'shared';

/**
 * Extracts the authenticated user from the request.
 *
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

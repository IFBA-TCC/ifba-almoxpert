import { SetMetadata } from '@nestjs/common';
import { UserType } from 'shared';

export const ROLES_KEY = 'roles';

/**
 * Marks a route as requiring specific user types.
 *
 * Usage: @Roles(UserType.ADMIN)
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);

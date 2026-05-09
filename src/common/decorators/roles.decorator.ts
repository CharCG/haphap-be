import { SetMetadata } from '@nestjs/common';
import { ActiveRole } from 'generated/prisma/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ActiveRole[]) => SetMetadata(ROLES_KEY, roles);

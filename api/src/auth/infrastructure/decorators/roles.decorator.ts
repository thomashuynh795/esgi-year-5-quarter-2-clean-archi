import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../user/domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

export function Roles(...roles: UserRole[]): CustomDecorator<string> {
  return SetMetadata(ROLES_KEY, roles);
}

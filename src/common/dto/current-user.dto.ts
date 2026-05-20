import { Role } from 'generated/prisma/enums';

export class CurrentUserDto {
  id!: string;
  role!: Role;
}

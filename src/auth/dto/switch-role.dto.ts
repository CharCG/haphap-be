import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActiveRole } from "generated/prisma/enums"; // Ambil enum ActiveRole dari Prisma kamu

export class SwitchRoleDto {
  @IsEnum(ActiveRole, { message: 'Role hanya bisa CUSTOMER atau MERCHANT' })
  @IsNotEmpty()
  targetRole!: ActiveRole;
}
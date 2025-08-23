import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../roles.decorator';
import type { User } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Read required roles from metadata (method + class level)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2️⃣ If no @Roles decorator → allow access
    if (!requiredRoles) {
      return true;
    }

    // 3️⃣ Get user from request (req.user is set by Passport after authentication)
    const { user }: { user: Omit<User, 'hashedPassword'> } = context
      .switchToHttp()
      .getRequest();

    // 4️⃣ Compare roles → allow if user's role is included in required roles
    return requiredRoles.includes(user.role);
  }
}

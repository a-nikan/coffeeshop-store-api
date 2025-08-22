import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findUserForAuth(email);
    if (user) {
      const validUser = await bcrypt.compare(pass, user.hashedPassword);
      if (validUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, ...result } = user;
        return result;
      }
    }
    return null;
  }

  login(user: Omit<User, 'hashedPassword'>) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}

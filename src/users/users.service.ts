import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Hash the password from the DTO
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create the user in the database with explicitly mapped data
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        hashedPassword: hashedPassword,
        // The 'role' will be set to the default ('CUSTOMER') by Prisma
      },
    });

    // IMPORTANT: Remove the hashed password before returning the user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: removedPassword, ...cleanUser } = user;

    return cleanUser;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    // Remove the hashed password from every user object in the array
    const cleanUsers = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, ...cleanUser } = user;
      return cleanUser;
    });
    return cleanUsers;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });

    // Remove the hashed password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...cleanUser } = user;
    return cleanUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const dataToUpdate: {
      email?: string;
      firstName?: string;
      lastName?: string;
      hashedPassword?: string;
    } = {};

    // If a new password is provided, hash it and add it to the update object
    if (updateUserDto.password) {
      dataToUpdate.hashedPassword = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }

    // Add other fields from the DTO if they exist
    if (updateUserDto.email) dataToUpdate.email = updateUserDto.email;
    if (updateUserDto.firstName)
      dataToUpdate.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) dataToUpdate.lastName = updateUserDto.lastName;

    // Perform the update with the safely constructed data object
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    // Remove the hashed password from the returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...cleanUser } = updatedUser;
    return cleanUser;
  }

  async remove(id: number) {
    // Although the user is deleted, Prisma returns the deleted object.
    // We should still clean it before returning.
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...cleanUser } = deletedUser;
    return cleanUser;
  }

  async findUserForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}

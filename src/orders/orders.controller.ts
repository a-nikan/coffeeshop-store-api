import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Role } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: ExpressRequest & { user: Omit<User, 'hashedPassword'> },
  ) {
    const result = this.ordersService.create(createOrderDto, req.user.id);
    return result;
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.ordersService.findAll();
  }
}

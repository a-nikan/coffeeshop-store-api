import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Role } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { UpdateOrderDto } from './dto/update-order.dto';

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
  @Get('mine') // This creates the GET /orders/mine route
  @UseGuards(JwtAuthGuard) // Protect the route
  findMyOrders(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.ordersService.findAllForUser(userId);
  }
  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    // The '+' converts the id string from the URL into a number
    return this.ordersService.updateStatus(+id, updateOrderDto.status);
  }
}

import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

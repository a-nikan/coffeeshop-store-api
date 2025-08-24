import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}
  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 1. Extract productIds from DTO
    const productIds = createOrderDto.items.map((item) => item.productId);

    // 2. Fetch products from DB
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
    });

    // --- Step 1: Validate that all products exist ---
    // Create a Map for quick lookups
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of createOrderDto.items) {
      if (!productMap.has(item.productId)) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found.`,
        );
      }
    }

    // --- Step 2: Calculate total price (AFTER validation) ---
    let total = new Prisma.Decimal(0);
    for (const item of createOrderDto.items) {
      const product = productMap.get(item.productId)!;
      const itemTotal = product.price.mul(item.quantity);
      total = total.add(itemTotal);
    }

    // --- Step 3: Create the Order and OrderItems in a transaction ---
    // THIS HAPPENS *AFTER* THE LOOP
    const order = await this.prismaService.order.create({
      data: {
        total,
        userId,
        items: {
          create: createOrderDto.items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price, // Store price at purchase time
            };
          }),
        },
      },
      include: {
        items: true, // Include the newly created items in the response
      },
    });

    return order;
  }

  async findAll() {
    const orders = await this.prismaService.order.findMany({
      include: {
        user: true, // Include the full User object
        items: {
          // For the items...
          include: {
            product: true, // ...also include the full Product object for each item
          },
        },
      },
    });
    return orders;
  }
}

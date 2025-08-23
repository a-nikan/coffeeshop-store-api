import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll() {
    const products = await this.prismaService.product.findMany({
      include: {
        category: true, // This tells Prisma to include the full Category object
      },
    });
    return products;
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUniqueOrThrow({
      where: { id },
      include: {
        category: true, // This tells Prisma to include the full Category object
      },
    });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
    });
    return product;
  }

  async remove(id: number) {
    return await this.prismaService.product.delete({ where: { id } });
  }
}

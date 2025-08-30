import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadsService } from 'src/uploads/uploads.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prismaService: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: createProductDto,
      include: {
        // <-- Add this block
        category: true,
      },
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
    // Step 1: Find the product to get its *current* imageUrl
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    const oldImageUrl = existingProduct.imageUrl;

    // Step 2: Update the product in the database
    const updatedProduct = await this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });

    // Step 3: If the imageUrl has changed, attempt to clean up the old one.
    if (oldImageUrl && oldImageUrl !== updatedProduct.imageUrl) {
      void this.uploadsService.deleteUnusedImage(oldImageUrl);
    }

    // Step 4: Return the updated product data
    return updatedProduct;
  }

  async remove(id: number) {
    // Step 1: Find the product to get its imageUrl before deleting
    const productToDelete = await this.prismaService.product.findUnique({
      where: { id },
    });
    if (!productToDelete) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    const imageUrl = productToDelete.imageUrl;

    // Step 2: Delete the product from the database
    const deletedProduct = await this.prismaService.product.delete({
      where: { id },
    });

    // Step 3: Attempt to clean up the image associated with the deleted product.
    if (imageUrl) {
      void this.uploadsService.deleteUnusedImage(imageUrl);
    }

    // Step 4: Return the data of the deleted product
    return deletedProduct;
  }
}

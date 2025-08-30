import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

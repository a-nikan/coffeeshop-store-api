// src/uploads/uploads.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { basename, join, extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService, // <-- INJECT THIS
  ) {}

  async saveFile(file: Express.Multer.File): Promise<string> {
    const hash = createHash('sha256').update(file.buffer).digest('hex');
    const extension = file.originalname ? extname(file.originalname) : '';
    const hashedFileName = `${hash}${extension}`;
    const filePath = join(process.cwd(), 'uploads', hashedFileName);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, file.buffer);
    }
    const baseUrl = this.configService.get<string>('BACKEND_URL');
    if (!baseUrl) {
      throw new InternalServerErrorException('BACKEND_URL is not configured.');
    }
    return `${baseUrl}/uploads/${hashedFileName}`;
  }

  // V-- ADD THIS NEW METHOD --V
  async deleteUnusedImage(imageUrl: string | null | undefined): Promise<void> {
    // 1. Basic validation: If there's no URL, there's nothing to do.
    if (!imageUrl) {
      return;
    }

    // 2. Extract the filename from the full URL
    const filename = basename(imageUrl);
    const fullImageUrl = `${this.configService.get('BACKEND_URL')}/uploads/${filename}`;

    // 3. Check if any other product in the database is using this image URL.
    const count = await this.prisma.product.count({
      where: {
        imageUrl: fullImageUrl,
      },
    });

    // 4. If the count is 0, no products are using this image, so it's safe to delete.
    if (count === 0) {
      const filePath = join(process.cwd(), 'uploads', filename);
      try {
        await fs.unlink(filePath); // Delete the file from the filesystem
      } catch (error) {
        // Log the error but don't throw, as failing to delete an old image
        // shouldn't cause the entire update operation to fail.
        console.error(`Failed to delete orphaned image: ${filePath}`, error);
      }
    }
  }
}

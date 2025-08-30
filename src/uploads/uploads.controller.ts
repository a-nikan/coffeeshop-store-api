// src/uploads/uploads.controller.ts

import {
  BadRequestException,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer'; // <-- Use memoryStorage
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    // We now use memoryStorage to get the file as a buffer.
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('File must be an image.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })], // 2 MB
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    // Pass the file buffer to our smart service
    const url = await this.uploadsService.saveFile(file);
    return { url };
  }
}

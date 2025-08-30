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
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // 1. Storage Configuration (remains the same)
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),

      // 2. NEW: File Filter for Type Validation (Fix for Issue #2)
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          // Reject file if it's not an image
          return callback(
            new BadRequestException(
              'Validation failed: file must be an image.',
            ),
            false,
          );
        }
        // Accept file
        callback(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        // 3. We only need the size validator here now
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })],
      }),
    )
    file: Express.Multer.File,
  ): { url: string } {
    // 4. NEW: Construct Absolute URL (Fix for Issue #1)
    const baseUrl = process.env.BACKEND_URL;
    if (!baseUrl) {
      // This is a good practice for preventing runtime errors if the env var is missing
      throw new Error('BACKEND_URL environment variable is not set.');
    }
    const url = `${baseUrl}/uploads/${file.filename}`;

    return { url };
  }
}

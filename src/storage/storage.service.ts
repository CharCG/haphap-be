import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 } from 'uuid';
import path from 'path';

@Injectable()
export class StorageService {
  private supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabaseClient = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  async uploadFile(file: Express.Multer.File, bucketName: string, folderName?: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${v4()}${fileExtension}`;
    const filePath = folderName ? `${folderName}/${fileName}` : fileName;

    const { data, error } = await this.supabaseClient.storage.from(bucketName).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new InternalServerErrorException('Internal server error');
    }

    const { data: publicUrlData } = this.supabaseClient.storage.from(bucketName).getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}

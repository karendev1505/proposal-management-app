import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter, SaveResult } from './storage.adapter';
import { LocalStorageService } from './local.storage';
import { S3StorageService } from './s3.storage';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private adapter: StorageAdapter;

  constructor(private config: ConfigService) {
    const driver = this.config.get<string>('STORAGE_DRIVER', 'local');
    if (driver === 's3') {
      const bucket = this.config.get<string>('S3_BUCKET_NAME');
      const region = this.config.get<string>('S3_REGION');
      const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
      this.adapter = new S3StorageService(region, bucket, { accessKeyId, secretAccessKey });
      this.logger.log('Using S3 storage adapter');
    } else {
      this.adapter = new LocalStorageService();
      this.logger.log('Using Local storage adapter');
    }
  }

  async saveBuffer(buffer: Buffer, filename: string, mimetype: string): Promise<SaveResult> {
    return this.adapter.uploadBuffer(buffer, filename, mimetype);
  }

  getUrl(key: string): string {
    return this.adapter.getUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    return this.adapter.delete(key);
  }
}

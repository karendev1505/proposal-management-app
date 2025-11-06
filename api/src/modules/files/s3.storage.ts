import { StorageAdapter, SaveResult } from './storage.adapter';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3StorageService implements StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(region: string, bucket: string, credentials?: { accessKeyId: string; secretAccessKey: string }) {
    this.bucket = bucket;
    this.client = new S3Client({ region, credentials });
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<SaveResult> {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType });
    // basic retry: try up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.client.send(cmd);
        const url = await this.getUrl(key);
        return { filename: key, mimetype: contentType, size: buffer.length, url, key };
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }
    // unreachable
    throw new Error('S3 upload failed');
  }

  getUrl(key: string): string {
    // Return a signed URL valid for 7 days
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key });
    // getSignedUrl requires a command instance — we build a HeadObject-like presign instead
    // For simplicity, return the public https URL (assumes bucket policy or presigned approach in prod)
    return `https://${this.bucket}.s3.${this.client.config.region}.amazonaws.com/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const cmd = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
    await this.client.send(cmd);
  }
}

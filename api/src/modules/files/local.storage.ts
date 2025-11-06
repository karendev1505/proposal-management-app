import { StorageAdapter, SaveResult } from './storage.adapter';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageService implements StorageAdapter {
  private uploadsDir: string;

  constructor(basePath?: string) {
    this.uploadsDir = basePath || path.join(process.cwd(), 'api', 'uploads');
    if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<SaveResult> {
    const filePath = path.join(this.uploadsDir, key);
    await fs.promises.writeFile(filePath, buffer);
    return {
      filename: key,
      mimetype: contentType,
      size: buffer.length,
      url: `/uploads/${key}`,
      path: filePath,
    };
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, key);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  }
}

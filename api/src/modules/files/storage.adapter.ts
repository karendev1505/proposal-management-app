export interface SaveResult {
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  key?: string;
  path?: string;
}

export interface StorageAdapter {
  uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<SaveResult>;
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateFromHtml(html: string): Promise<Buffer> {
    // Very simple HTML to text rendering for PDFKit; for rich HTML use puppeteer.
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const text = html
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\s*p\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();

      doc.fontSize(16).text(text || '');
      doc.end();
    });
  }
}

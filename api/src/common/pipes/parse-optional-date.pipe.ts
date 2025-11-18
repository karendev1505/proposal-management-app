import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseOptionalDatePipe implements PipeTransform<string, Date | undefined> {
  transform(value: string, metadata: ArgumentMetadata): Date | undefined {
    if (!value) {
      return undefined;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  }
}


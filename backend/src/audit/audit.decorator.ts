import { SetMetadata } from '@nestjs/common';

export const Audit = (...args: string[]) => SetMetadata('audit', args);

import { SetMetadata } from '@nestjs/common';

export const RequireAccessLevel = (level: number) =>
  SetMetadata('accessLevel', level);

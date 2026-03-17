import { RestExceptionFilter } from '@infrastructure/shared/exception.filter';
import { applyDecorators, Controller, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';

export function RestController(prefix: string) {
  return applyDecorators(
    Controller(prefix),
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    UseFilters(RestExceptionFilter)
  );
}

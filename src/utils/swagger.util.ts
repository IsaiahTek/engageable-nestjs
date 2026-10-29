// src/utils/swagger.util.ts

let swagger: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  swagger = require('@nestjs/swagger');
} catch {
  // Optional dependency @nestjs/swagger is not installed
}

export const ApiTags: (tags: string | string[]) => ClassDecorator = (tags) =>
  swagger ? swagger.ApiTags(tags) : () => {};

export const ApiProperty: (options?: any) => PropertyDecorator = (options) =>
  swagger ? swagger.ApiProperty(options) : () => {};

export const ApiPropertyOptional: (options?: any) => PropertyDecorator = (options) =>
  swagger ? swagger.ApiPropertyOptional(options) : () => {};

export const ApiQuery: (options?: any) => MethodDecorator = (options) =>
  swagger ? swagger.ApiQuery(options) : () => {};

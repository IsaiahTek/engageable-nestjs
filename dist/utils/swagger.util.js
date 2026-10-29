"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiQuery = exports.ApiPropertyOptional = exports.ApiProperty = exports.ApiTags = void 0;
let swagger;
try {
    swagger = require('@nestjs/swagger');
}
catch {
}
const ApiTags = (tags) => swagger ? swagger.ApiTags(tags) : () => { };
exports.ApiTags = ApiTags;
const ApiProperty = (options) => swagger ? swagger.ApiProperty(options) : () => { };
exports.ApiProperty = ApiProperty;
const ApiPropertyOptional = (options) => swagger ? swagger.ApiPropertyOptional(options) : () => { };
exports.ApiPropertyOptional = ApiPropertyOptional;
const ApiQuery = (options) => swagger ? swagger.ApiQuery(options) : () => { };
exports.ApiQuery = ApiQuery;
//# sourceMappingURL=swagger.util.js.map
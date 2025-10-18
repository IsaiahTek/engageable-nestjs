"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsHalfStep = IsHalfStep;
const class_validator_1 = require("class-validator");
function IsHalfStep(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isHalfStep',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return typeof value === 'number' && value >= 0 && value <= 5 && value * 2 === Math.round(value * 2);
                },
                defaultMessage(args) {
                    return `${args.property} must be in increments of 0.5 between 0 and 5`;
                },
            },
        });
    };
}
//# sourceMappingURL=is-half-step.decorator.js.map
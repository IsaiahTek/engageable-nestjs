import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsHalfStep(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isHalfStep',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value >= 0 && value <= 5 && value * 2 === Math.round(value * 2);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be in increments of 0.5 between 0 and 5`;
        },
      },
    });
  };
}

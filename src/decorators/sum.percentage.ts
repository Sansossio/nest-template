import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as _ from 'lodash';

/**
 * Sum Percentage
 * @description Decorator for sum values inside array is equal to 100
 * @param config key: Key over object to sum
 * @param validationOptions
 */
export function SumPercentage(config: { key: string }, validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'SumPercentage',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any[], args: ValidationArguments) {
          if (!_.isArray(value)) {
            return false;
          }
          const sum = value.reduce<number>((prev, curr) => prev + +(curr[config.key] || 0), 0);
          return sum === 100 || !value.length;
        },
      },
    });
  };
}

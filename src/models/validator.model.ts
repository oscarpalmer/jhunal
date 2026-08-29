import type {Result} from '@oscarpalmer/atoms/result/models';
import type {ValueValidation} from './validation.model';

// #region Types

export type Validator<Value> = {
	/**
	 * Is the value valid?
	 *
	 * Will assert that the value is valid and throws an error if it does not
	 * @param value Value to validate
	 * @returns `true` if the value is valid, otherwise throws an error
	 */
	is(value: unknown, reporting: 'throw'): asserts value is Value;

	/**
	 * Is the value valid?
	 *
	 * Will validate that the value is valid and return a result of `true` or validation information for the first validation failure
	 * @param value Value to validate
	 * @return Result holding `true` or validation information
	 */
	is(value: unknown, reporting: 'result'): Result<Value, ValueValidation>;

	/**
	 * Is the value valid?
	 * @param value Value to validate
	 * @returns `true` if the value is valid, otherwise `false`
	 */
	is(value: unknown, reporting?: 'none'): value is Value;
};

// #endregion

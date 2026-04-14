import type {Constructor} from '@oscarpalmer/atoms/models';
import type {Result} from '@oscarpalmer/atoms/result/models';
import {PROPERTY_VALIDATOR} from './constants';
import {getValidatorHandler} from './handler/validator.handler';
import {isResult} from './helpers/result.helper';
import type {InferValidatorValue} from './models/infer.model';
import type {Values, ValueType} from './models/misc.model';
import type {
	ValidationHandler,
	ValidationHandlerType,
	Validators,
	ValueValidation,
} from './models/validation.model';

export class Validator<Value> {
	declare private readonly $validator: true;

	readonly #handler: ValidationHandler;

	constructor(handler: ValidationHandler, types: ValidationHandlerType[]) {
		Object.defineProperty(this, PROPERTY_VALIDATOR, {
			value: true,
		});

		this.#handler = handler;

		validatorHandlers.set(this, handler);
		validatorTypes.set(this, types);
	}

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

	is(value: unknown, options?: unknown): unknown {
		return isResult(this.#handler, value, options);
	}
}

/**
 * Create a validator for value types
 * @param types Types to validate against
 * @param validators Custom validators to use for validation
 * @returns Validator
 */
export function validator<
	Types extends Array<Constructor | ((value: unknown) => boolean) | ValueType>,
>(types: Types, validators?: Validators): Validator<InferValidatorValue<Types>>;

/**
 * Create a validator for a constructor
 * @param constructor Constructor to validate against
 * @returns Validator
 */
export function validator<Instance>(constructor: Constructor<Instance>): Validator<Instance>;

/**
 * Create a validator for a callback
 * @param callback Callback for validation
 * @returns Validator
 */
export function validator<Value>(callback: (value: unknown) => value is Value): Validator<Value>;

/**
 * Create a validator for a callback
 * @param callback Callback for validation
 * @returns Validator
 */
export function validator<Value>(callback: (value: unknown) => boolean): Validator<Value>;

/**
 * Create a validator for a type
 * @param type Type to validate against
 * @param validators Custom validators to use for validation
 * @returns Validator
 */
export function validator<Type extends ValueType>(
	type: Type,
	validators?:
		| ((value: Values[Type]) => boolean)
		| Array<(value: Values[Type]) => boolean>
		| Record<Type, ((value: Values[Type]) => boolean) | Array<(value: Values[Type]) => boolean>>,
): Validator<Values[Type]>;

/**
 * Create a validator for value types
 * @param types Types to validate against
 * @param validators Custom validators to use for validation
 * @returns Validator
 */
export function validator<Types extends ValueType[]>(
	types: Types,
	validators?: Validators,
): Validator<unknown>;

/**
 * Create a validator for an array of items
 * @param type Type of items in the array
 * @returns Validator
 */
export function validator<Item>(type: 'array'): Validator<Item[]>;

export function validator(value: unknown, validators?: unknown): Validator<unknown> {
	if (value instanceof Validator) {
		return value;
	}

	const {handler, types} = getValidatorHandler(value, validators);

	return new Validator(handler, types);
}

export const validatorHandlers = new WeakMap<Validator<unknown>, ValidationHandler>();
export const validatorTypes = new WeakMap<Validator<unknown>, ValidationHandlerType[]>();

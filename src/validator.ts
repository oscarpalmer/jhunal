import type {Constructor} from '@oscarpalmer/atoms/models';
import {PROPERTY_VALIDATOR} from './constants';
import {getValidatorHandler} from './handler/validator.handler';
import {isValidator} from './helpers/misc.helper';
import {isResult} from './helpers/result.helper';
import type {InferValidatorValue} from './models/infer.model';
import type {Values, ValueType} from './models/misc.model';
import type {ValidationHandler, ValidationHandlerType, Validators} from './models/validation.model';
import type {Validator} from './models/validator.model';

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

export function validator(input: unknown, validators?: unknown): unknown {
	if (isValidator(input)) {
		return input;
	}

	const [handler, types] = getValidatorHandler(input, validators);

	const instance = {
		is: (value: unknown, options?: unknown): unknown => isResult(handler, value, options),
	};

	Object.defineProperty(instance, PROPERTY_VALIDATOR, {
		value: true,
	});

	validatorHandlers.set(instance as Validator<unknown>, handler);
	validatorTypes.set(instance as Validator<unknown>, types);

	return Object.freeze(instance);
}

export const validatorHandlers = new WeakMap<Validator<unknown>, ValidationHandler>();

export const validatorTypes = new WeakMap<Validator<unknown>, ValidationHandlerType[]>();

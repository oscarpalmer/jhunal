import type {Constructor} from '@oscarpalmer/atoms/models';
import {getValidatorHandler} from './handler/validator.handler';
import {isResult} from './helpers/result.helper';
import type {InferValidatorValue} from './models/infer.model';
import type {Values, ValueType} from './models/misc.model';
import type {ValidationHandler} from './models/validation.model';

export class Validator<Value> {
	#handler: ValidationHandler;

	constructor(handler: ValidationHandler) {
		this.#handler = handler;

		validatorHandlers.set(this, handler);
	}

	is(value: unknown): value is Value;

	is(value: unknown, options?: unknown): unknown {
		return isResult(this.#handler, value, options);
	}
}

export function validator<
	Types extends Array<Constructor | ((value: unknown) => boolean) | ValueType>,
>(types: Types): Validator<InferValidatorValue<Types>>;

export function validator<Instance>(constructor: Constructor<Instance>): Validator<Instance>;

export function validator<Value>(callback: (value: unknown) => value is Value): Validator<Value>;

export function validator<Value>(callback: (value: unknown) => boolean): Validator<Value>;

export function validator<Type extends ValueType>(type: Type): Validator<Values[Type]>;

export function validator<Types extends ValueType[]>(types: Types): Validator<unknown>;

export function validator<Item>(type: 'array'): Validator<Item[]>;

export function validator(value: unknown, handlers?: unknown): Validator<unknown> {
	if (value instanceof Validator) {
		throw new TypeError();
	}

	return new Validator(getValidatorHandler(value, handlers));
}

export const validatorHandlers = new WeakMap<Validator<unknown>, ValidationHandler>();

const Err = validator(Error);

const Is = validator((value: unknown) => value instanceof Error);

const CB = validator<string>((value: unknown) => typeof value === 'string' && value.length > 0);

const Str = validator('string');

const StrArr = validator(['string']);

const Or = validator(['array', 'string']);

const Arr = validator<Error>('array');

const X = validator([
	Error,
	(value: unknown): value is TypeError => value instanceof TypeError,
	(value: unknown): boolean => typeof value === 'bigint' && !Number.isNaN(value),
	'array',
	'string',
]);

import {isDateLike, isSchematic} from '../is';
import type {ValidatedPropertyType, ValidatedSchema, Values} from '../model';
import {validateValue} from './value.validation';

export function validateType(
	type: ValidatedPropertyType,
	value: unknown,
): boolean {
	if (typeof type === 'string') {
		return validators[type](value);
	}

	if (isSchematic(type)) {
		return type.is(value);
	}

	return validateValue(type as ValidatedSchema, value);
}

const validators: Record<keyof Values, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	'date-like': isDateLike,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	numerical: value => validators.bigint(value) || validators.number(value),
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

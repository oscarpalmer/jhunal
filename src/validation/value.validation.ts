import type {PlainObject} from '@oscarpalmer/atoms/models';
import {smush} from '@oscarpalmer/atoms/value';
import {isDateLike} from '../is';
import type {ValidatedPropertyType, ValidatedSchema, Values} from '../model';

export function validateType(type: ValidatedPropertyType, value: unknown): boolean {
	return typeof type === 'string' ? validators[type](value) : type.is(value);
}

export function validateValue(validated: ValidatedSchema, obj: unknown): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const {keys, properties} = validated;
	const keysLength = keys.array.length;

	const smushed = smush(obj as PlainObject);

	outer: for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys.array[keyIndex];
		const property = properties[key];
		const value = smushed[key];

		if (value === undefined && property.required && !property.types.includes('undefined')) {
			return false;
		}

		const typesLength = property.types.length;

		if (typesLength === 1) {
			if (!validateType(property.types[0], value)) {
				return false;
			}

			continue;
		}

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			if (validateType(property.types[typeIndex], value)) {
				continue outer;
			}
		}

		return false;
	}

	return true;
}

//

const validators: Record<keyof Values, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	'date-like': isDateLike,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number' && !Number.isNaN(value),
	numerical: value => validators.bigint(value) || validators.number(value),
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

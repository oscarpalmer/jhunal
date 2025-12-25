import type {PlainObject} from '@oscarpalmer/atoms/models';
import {isDateLike, isSchematic} from '../is';
import type {ValidatedPropertyType, ValidatedSchema, Values} from '../model';

export function validateType(type: ValidatedPropertyType, value: unknown): boolean {
	if (typeof type === 'string') {
		return validators[type](value);
	}

	if (isSchematic(type)) {
		return type.is(value);
	}

	return validateValue(type as ValidatedSchema, value);
}

export function validateValue(validated: ValidatedSchema, obj: unknown): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	outer: for (let keyIndex = 0; keyIndex < validated.length; keyIndex += 1) {
		const key = validated.keys[keyIndex];
		const property = validated.properties[key];
		const value = (obj as PlainObject)[key];

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
	number: value => typeof value === 'number',
	numerical: value => validators.bigint(value) || validators.number(value),
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

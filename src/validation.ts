import type {PlainObject} from '@oscarpalmer/atoms';
import {getTypes} from './helpers';
import type {Schema, ValidatedSchema, Values} from './model';

export function getValidatedSchema(schema: unknown): ValidatedSchema {
	const validated: ValidatedSchema = {
		keys: [],
		length: 0,
		properties: {},
	};

	if (typeof schema !== 'object' || schema === null) {
		return validated;
	}

	const keys = Object.keys(schema);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = (schema as Schema)[key];

		let required = true;
		let valueTypes: (keyof Values)[];

		if (Array.isArray(value)) {
			valueTypes = getTypes(value);
		} else if (typeof value === 'object' && value !== null) {
			if (typeof (value as PlainObject).required === 'boolean') {
				required = (value as PlainObject).required as boolean;
			}

			valueTypes = getTypes((value as PlainObject).type);
		} else {
			valueTypes = getTypes(value);
		}

		if (valueTypes.length > 0) {
			if (!required && !valueTypes.includes('undefined')) {
				valueTypes.push('undefined');
			}

			validated.keys.push(key);

			validated.properties[key] = {
				required,
				types: valueTypes,
			};

			validated.length += 1;
		}
	}

	return validated;
}

export function validate(validated: ValidatedSchema, obj: unknown): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	outer: for (let index = 0; index < validated.length; index += 1) {
		const key = validated.keys[index];
		const property = validated.properties[key];
		const value = (obj as PlainObject)[key];

		if (
			value === undefined &&
			property.required &&
			!property.types.includes('undefined')
		) {
			return false;
		}

		const typesLength = property.types.length;

		if (typesLength === 1) {
			if (!validators[property.types[0]](value)) {
				return false;
			}

			continue;
		}

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			if (validators[property.types[typeIndex]](value)) {
				continue outer;
			}
		}

		return false;
	}

	return true;
}

const validators: Record<keyof Values, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

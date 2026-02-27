import {isPlainObject} from '@oscarpalmer/atoms/is';
import {isSchematic} from '../helpers';
import type {ValidatedProperty, ValidatedPropertyType, ValueName} from '../models';

export function validateObject(obj: unknown, properties: ValidatedProperty[]): boolean {
	if (!isPlainObject(obj)) {
		return false;
	}

	const propertiesLength = properties.length;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		const property = properties[propertyIndex];

		const {key, required, types} = property;

		const value = obj[key];

		if (value === undefined && required) {
			return false;
		}

		const typesLength = types.length;

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			if (validateValue(type, property, value)) {
				continue outer;
			}
		}

		return false;
	}

	return true;
}

function validateValue(
	type: ValidatedPropertyType,
	property: ValidatedProperty,
	value: unknown,
): boolean {
	switch (true) {
		case isSchematic(type):
			return type.is(value);

		case typeof type === 'function':
			return (type as (value: unknown) => boolean)(value);

		case typeof type === 'object':
			return validateObject(value, [type] as ValidatedProperty[]);

		default:
			return (
				validators[type as ValueName](value) &&
				(property.validators[type as ValueName]?.every(validator => validator(value)) ?? true)
			);
	}
}

//

const validators: Record<ValueName, (value: unknown) => boolean> = {
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

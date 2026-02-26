import {isPlainObject} from '@oscarpalmer/atoms/is';
import {isSchematic} from '../is';
import type {ValidatedProperty, ValidatedPropertyType, ValueName} from '../models';

export function validateObject(obj: unknown, properties: ValidatedProperty[]): boolean {
	if (!isPlainObject(obj)) {
		return false;
	}

	const ignoredKeys = new Set<string>();
	const propertiesLength = properties.length;

	let key!: string;
	let value!: unknown;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		const property = properties[propertyIndex];

		if (ignoredKeys.has(property.key.prefix!)) {
			key = undefined as never;

			ignoredKeys.add(property.key.full);

			continue;
		}

		/* if (key == null || !property.key.full.startsWith(key)) {
			value = obj[property.key.full];
		} else {
			value = (value as PlainObject)?.[property.key.value];
		} */

		key = property.key.full;
		value = obj[key];

		if (value === undefined && property.required) {
			return false;
		}

		const typesLength = property.types.length;

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = property.types[typeIndex];

			if (validateValue(type, property, value)) {
				ignoredKeys.add(property.key.full);

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
		case typeof type === 'function':
			return (type as (value: unknown) => boolean)(value);

		case isSchematic(type):
			return type.is(value);

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

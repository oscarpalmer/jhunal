import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
	TYPE_ALL,
	TYPE_UNDEFINED,
	VALIDATABLE_TYPES,
} from '../constants';
import {instanceOf, isSchematic} from '../helpers';
import type {ValueName} from '../models/misc.model';
import {
	SchematicError,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidatedPropertyValidators,
} from '../models/validation.model';

function getDisallowedProperty(obj: PlainObject): string | undefined {
	if (PROPERTY_REQUIRED in obj) {
		return PROPERTY_REQUIRED;
	}

	if (PROPERTY_TYPE in obj) {
		return PROPERTY_TYPE;
	}

	if (PROPERTY_VALIDATORS in obj) {
		return PROPERTY_VALIDATORS;
	}
}

export function getProperties(
	original: PlainObject,
	prefix?: string,
	fromType?: boolean,
): ValidatedProperty[] {
	if (Object.keys(original).length === 0) {
		throw new SchematicError(SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY);
	}

	if (fromType ?? false) {
		const property = getDisallowedProperty(original);

		if (property != null) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
					TEMPLATE_PATTERN,
					prefix!,
				).replace(TEMPLATE_PATTERN, property),
			);
		}
	}

	const keys = Object.keys(original);
	const keysLength = keys.length;

	const properties: ValidatedProperty[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];

		const prefixed = join([prefix, key], '.');
		const value = original[key];

		if (value == null) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE.replace(TEMPLATE_PATTERN, prefixed),
			);
		}

		const types: ValidatedPropertyType[] = [];

		let required = true;
		let validators: ValidatedPropertyValidators = {};

		if (isPlainObject(value)) {
			required = getRequired(key, value) ?? required;
			validators = getValidators(value[PROPERTY_VALIDATORS]);

			const hasType = PROPERTY_TYPE in value;

			types.push(...getTypes(key, hasType ? value[PROPERTY_TYPE] : value, prefix, hasType));
		} else {
			types.push(...getTypes(key, value, prefix));
		}

		if (!required && !types.includes(TYPE_UNDEFINED)) {
			types.push(TYPE_UNDEFINED);
		}

		properties.push({
			types,
			validators,
			key: {
				full: prefixed,
				short: key,
			},
			required: required && !types.includes(TYPE_UNDEFINED),
		});
	}

	return properties;
}

function getRequired(key: string, obj: PlainObject): boolean | undefined {
	if (!(PROPERTY_REQUIRED in obj)) {
		return;
	}

	if (typeof obj[PROPERTY_REQUIRED] !== 'boolean') {
		throw new SchematicError(
			SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, key),
		);
	}

	return obj[PROPERTY_REQUIRED];
}

function getTypes(
	key: string,
	original: unknown,
	prefix?: string,
	fromType?: boolean,
): ValidatedPropertyType[] {
	const array = Array.isArray(original) ? original : [original];
	const {length} = array;

	const types: ValidatedPropertyType[] = [];

	for (let index = 0; index < length; index += 1) {
		const value = array[index];

		switch (true) {
			case typeof value === 'function':
				types.push(isConstructor(value) ? instanceOf(value) : value);
				break;

			case isPlainObject(value):
				types.push(getProperties(value, join([prefix, key], '.'), fromType));
				break;

			case isSchematic(value):
				types.push(value);
				break;

			case TYPE_ALL.has(value as never):
				types.push(value as never);
				break;

			default:
				throw new SchematicError(
					SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(
						TEMPLATE_PATTERN,
						join([prefix, key], '.'),
					),
				);
		}
	}

	if (types.length === 0) {
		throw new SchematicError(
			SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(
				TEMPLATE_PATTERN,
				join([prefix, key], '.'),
			),
		);
	}

	return types;
}

function getValidators(original: unknown): ValidatedPropertyValidators {
	const validators: ValidatedPropertyValidators = {};

	if (original == null) {
		return validators;
	}

	if (!isPlainObject(original)) {
		throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!VALIDATABLE_TYPES.has(key as never)) {
			throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = (original as PlainObject)[key];

		validators[key as ValueName] = (Array.isArray(value) ? value : [value]).map(item => {
			if (typeof item !== 'function') {
				throw new TypeError(
					SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key),
				);
			}

			return item;
		});
	}

	return validators;
}

import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string/misc';
import {
	EXPRESSION_INDEX,
	EXPRESSION_PROPERTY,
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_DISALLOWED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_TYPE,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_VALIDATOR_INVALID_KEY,
	MESSAGE_VALIDATOR_INVALID_TYPE,
	MESSAGE_VALIDATOR_INVALID_VALUE,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	TEMPLATE_PATTERN,
	TYPE_ALL,
	TYPE_UNDEFINED,
	VALIDATABLE_TYPES,
} from '../constants';
import {instanceOf, isSchematic} from '../helpers';
import {
	SchematicError,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidatedPropertyValidators,
	type ValueName,
} from '../models';

export function getProperties(
	original: PlainObject,
	prefix?: string,
	fromTypes?: boolean,
): ValidatedProperty[] {
	if (Object.keys(original).length === 0) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_EMPTY);
	}

	if (PROPERTY_REQUIRED in original && (fromTypes ?? false) && prefix != null) {
		throw new SchematicError(
			MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_DISALLOWED.replace(TEMPLATE_PATTERN, prefix),
		);
	}

	const keys = Object.keys(original);
	const keysLength = keys.length;

	const properties: ValidatedProperty[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];

		if (EXPRESSION_INDEX.test(key) || EXPRESSION_PROPERTY.test(key)) {
			continue;
		}

		const value = original[key];

		const types: ValidatedPropertyType[] = [];

		let required = true;
		let validators: ValidatedPropertyValidators = {};

		if (isPlainObject(value)) {
			required = getRequired(key, value) ?? required;
			validators = getValidators(value[PROPERTY_VALIDATORS]);

			if (PROPERTY_TYPE in value) {
				types.push('object', ...getTypes(key, value[PROPERTY_TYPE], prefix, true));
			} else {
				types.push('object', ...getTypes(key, value, prefix));
			}
		} else {
			types.push(...getTypes(key, value, prefix));
		}

		if (!required && !types.includes(TYPE_UNDEFINED)) {
			types.push(TYPE_UNDEFINED);
		}

		properties.push({
			key,
			types,
			validators,
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
			MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_TYPE.replace(TEMPLATE_PATTERN, key),
		);
	}

	return obj[PROPERTY_REQUIRED];
}

function getTypes(
	key: string,
	original: unknown,
	prefix?: string,
	fromTypes?: boolean,
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
				types.push(...getProperties(value, join([prefix, key], '.'), fromTypes));
				break;

			case isSchematic(value):
				types.push(value);
				break;

			case TYPE_ALL.has(value as never):
				types.push(value as never);
				break;

			default:
				throw new SchematicError(
					MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, join([prefix, key], '.')),
				);
		}
	}

	if (types.length === 0) {
		throw new SchematicError(
			MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, join([prefix, key], '.')),
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
		throw new TypeError(MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!VALIDATABLE_TYPES.has(key as never)) {
			throw new TypeError(MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = (original as PlainObject)[key];

		validators[key as ValueName] = (Array.isArray(value) ? value : [value]).filter(item => {
			if (typeof item !== 'function') {
				throw new TypeError(MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key));
			}

			return true;
		});
	}

	return validators;
}

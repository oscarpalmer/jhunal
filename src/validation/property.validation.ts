import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {smush} from '@oscarpalmer/atoms/value/misc';
import {
	EXPRESSION_INDEX,
	EXPRESSION_KEY_PREFIX,
	EXPRESSION_KEY_VALUE,
	EXPRESSION_PROPERTY,
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_VALIDATOR_INVALID_KEY,
	MESSAGE_VALIDATOR_INVALID_TYPE,
	MESSAGE_VALIDATOR_INVALID_VALUE,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	TEMPLATE_PATTERN,
	TYPE_ALL,
	TYPE_OBJECT,
	TYPE_UNDEFINED,
	VALIDATABLE_TYPES,
} from '../constants';
import {instanceOf, isSchematic} from '../is';
import {
	SchematicError,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidatedPropertyValidators,
	type ValueName,
} from '../models';
import {schematic} from '../schematic';

function getKeyPrefix(key: string): string | undefined {
	const prefix = key.replace(EXPRESSION_KEY_PREFIX, '');

	return prefix === key ? undefined : prefix;
}

function getKeyValue(key: string): string {
	return key.replace(EXPRESSION_KEY_VALUE, '$1');
}

export function getProperties(original: PlainObject): ValidatedProperty[] {
	if (Object.keys(original).length === 0) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_EMPTY);
	}

	const smushed = smush(original);
	const keys = Object.keys(smushed);
	const keysLength = keys.length;

	const properties: ValidatedProperty[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];

		if (EXPRESSION_INDEX.test(key) || EXPRESSION_PROPERTY.test(key)) {
			continue;
		}

		const keyPrefix = getKeyPrefix(key);
		const keyValue = getKeyValue(key);
		const value = smushed[key];

		const types: ValidatedPropertyType[] = [];

		let required = true;
		let validators: ValidatedPropertyValidators = {};

		if (isPlainObject(value)) {
			required = getRequired(key, value) ?? required;
			validators = getValidators(value[PROPERTY_VALIDATORS]);

			if (PROPERTY_TYPE in value) {
				types.push(...getTypes(key, value[PROPERTY_TYPE]));
			} else {
				types.push(TYPE_OBJECT);
			}
		} else {
			types.push(...getTypes(key, value));
		}

		if (!required && !types.includes(TYPE_UNDEFINED)) {
			types.push(TYPE_UNDEFINED);
		}

		properties.push({
			types,
			validators,
			key: {
				full: key,
				prefix: keyPrefix,
				value: keyValue,
			},
			required: required && !types.includes(TYPE_UNDEFINED),
		});
	}

	return properties;
}

function getRequired(key: string, value: PlainObject): boolean | undefined {
	if (!(PROPERTY_REQUIRED in value)) {
		return;
	}

	if (typeof value[PROPERTY_REQUIRED] !== 'boolean') {
		throw new SchematicError(
			MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, key),
		);
	}

	return value[PROPERTY_REQUIRED];
}

function getTypes(key: string, original: unknown): ValidatedPropertyType[] {
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
				types.push(schematic(value as never));
				break;

			case isSchematic(value):
				types.push(value);
				break;

			case TYPE_ALL.has(value as never):
				types.push(value as never);
				break;

			default:
				throw new SchematicError(
					MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, key),
				);
		}
	}

	if (types.length === 0) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, key));
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

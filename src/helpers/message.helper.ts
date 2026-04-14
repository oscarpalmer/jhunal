import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import {
	COMMA,
	CONJUNCTION_AND,
	CONJUNCTION_AND_COMMA,
	CONJUNCTION_OR,
	CONJUNCTION_OR_COMMA,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_DEFAULT_REQUIRED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_DEFAULT_TYPE,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	TEMPLATE_PATTERN,
	TYPES_ALL,
	TYPES_PREFIXED,
	TYPE_ARRAY,
	TYPE_FUNCTION_RESULT,
	TYPE_NULL,
	TYPE_OBJECT,
	VALIDATION_MESSAGE_INVALID_INPUT,
	VALIDATION_MESSAGE_INVALID_PROPERTY_TYPE,
	VALIDATION_MESSAGE_INVALID_PROPERTY_VALIDATOR,
	VALIDATION_MESSAGE_INVALID_REQUIRED,
	VALIDATION_MESSAGE_INVALID_VALIDATOR_SUFFIX,
	VALIDATION_MESSAGE_INVALID_VALUE_TYPE,
	VALIDATION_MESSAGE_INVALID_VALUE_VALIDATOR,
	VALIDATION_MESSAGE_UNKNOWN_KEYS,
} from '../constants';
import type {ValueType} from '../models/misc.model';
import type {ValidationHandlerType} from '../models/validation.model';
import {isValidator} from './misc.helper';
import {validatorTypes} from '../validator';

// #region Defaults

export function getDefaultRequiredMessage(key: string): string {
	return SCHEMATIC_MESSAGE_SCHEMA_INVALID_DEFAULT_REQUIRED.replace(TEMPLATE_PATTERN, key);
}

export function getDefaultTypeMessage(key: string, types: ValidationHandlerType[]): string {
	let message = SCHEMATIC_MESSAGE_SCHEMA_INVALID_DEFAULT_TYPE.replace(TEMPLATE_PATTERN, key);

	message = message.replace(TEMPLATE_PATTERN, renderTypes(types));

	return message;
}

// #endregion

// #region Disallowed

export function getDisallowedMessage(key: string, property: string): string {
	let message = SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(TEMPLATE_PATTERN, key);

	message = message.replace(TEMPLATE_PATTERN, property);

	return message;
}

// #endregion

// #region Input

export function getInputTypeMessage(actual: unknown): string {
	return VALIDATION_MESSAGE_INVALID_INPUT.replace(TEMPLATE_PATTERN, getValueType(actual));
}

export function getInputPropertyMissingMessage(
	key: string,
	types: ValidationHandlerType[],
): string {
	let message = VALIDATION_MESSAGE_INVALID_REQUIRED.replace(TEMPLATE_PATTERN, renderTypes(types));

	message = message.replace(TEMPLATE_PATTERN, key);

	return message;
}

export function getInputPropertyTypeMessage(
	key: string,
	types: ValidationHandlerType[],
	actual: unknown,
): string {
	let message = VALIDATION_MESSAGE_INVALID_PROPERTY_TYPE.replace(
		TEMPLATE_PATTERN,
		renderTypes(types),
	);

	message = message.replace(TEMPLATE_PATTERN, key);
	message = message.replace(TEMPLATE_PATTERN, getValueType(actual));

	return message;
}

export function getInputPropertyValidatorMessage(
	key: string,
	type: ValueType,
	index: number,
	length: number,
): string {
	let message = VALIDATION_MESSAGE_INVALID_PROPERTY_VALIDATOR.replace(TEMPLATE_PATTERN, key);

	message = message.replace(TEMPLATE_PATTERN, type);

	if (length > 1) {
		message += VALIDATION_MESSAGE_INVALID_VALIDATOR_SUFFIX.replace(TEMPLATE_PATTERN, String(index));
	}

	return message;
}

export function getInputValueTypeMessage(types: ValidationHandlerType[], actual: unknown): string {
	let message = VALIDATION_MESSAGE_INVALID_VALUE_TYPE.replace(TEMPLATE_PATTERN, renderTypes(types));

	message = message.replace(TEMPLATE_PATTERN, getValueType(actual));

	return message;
}

export function getInputValueValidatorMessage(
	type: ValueType,
	index: number,
	length: number,
): string {
	let message = VALIDATION_MESSAGE_INVALID_VALUE_VALIDATOR.replace(TEMPLATE_PATTERN, type);

	if (length > 1) {
		message += VALIDATION_MESSAGE_INVALID_VALIDATOR_SUFFIX.replace(TEMPLATE_PATTERN, String(index));
	}

	return message;
}

// #endregion

// #region Schematic

export function getSchematicPropertyNullableMessage(key: string): string {
	return SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE.replace(TEMPLATE_PATTERN, key);
}

export function getSchematicPropertyTypeMessage(key: string): string {
	return SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, key);
}

// #endregion

// #region Misc.

function getPropertyType(type: ValidationHandlerType): string[] {
	switch (true) {
		case typeof type === 'function':
			return [isConstructor(type) ? type.name : TYPE_FUNCTION_RESULT];

		case isValidator(type):
			return validatorTypes.get(type)!.flatMap(getPropertyType);

		case TYPES_ALL.has(type as ValueType):
			return [TYPES_PREFIXED[type as ValueType]];

		default:
			return [TYPES_PREFIXED[TYPE_OBJECT]];
	}
}

function getValueType(value: unknown): string {
	const valueType = typeof value;

	switch (true) {
		case value === null:
			return TYPE_NULL;

		case Array.isArray(value):
			return TYPES_PREFIXED[TYPE_ARRAY];

		case isPlainObject(value):
			return TYPES_PREFIXED[TYPE_OBJECT];

		case valueType !== TYPE_OBJECT:
			return TYPES_PREFIXED[valueType as ValueType];

		default:
			return (value as object).constructor.name;
	}
}

function renderKeys(keys: string[]): string {
	return renderParts(
		keys.map(key => `'${key}'`),
		CONJUNCTION_AND,
		CONJUNCTION_AND_COMMA,
	);
}

function renderParts(parts: string[], delimiterShort: string, delimiterLong: string): string {
	const {length} = parts;

	if (length === 1) {
		return parts[0];
	}

	let rendered = '';

	for (let index = 0; index < length; index += 1) {
		rendered += parts[index];

		if (index < length - 2) {
			rendered += COMMA;
		} else if (index === length - 2) {
			rendered += parts.length > 2 ? delimiterLong : delimiterShort;
		}
	}

	return rendered;
}

function renderTypes(types: ValidationHandlerType[]): string {
	const unique = new Set<string>();
	const parts: string[] = [];

	const typesLength = types.length;

	for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
		const properties = getPropertyType(types[typeIndex]);
		const propertiesLength = properties.length;

		for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
			const property = properties[propertyIndex];

			if (unique.has(property)) {
				continue;
			}

			unique.add(property);
			parts.push(property);
		}
	}

	return renderParts(parts, CONJUNCTION_OR, CONJUNCTION_OR_COMMA);
}

// #endregion

// #region Required

export function getRequiredMessage(key: string): string {
	return SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, key);
}

// #endregion

// #region Strictness

export function getUnknownKeysMessage(keys: string[]): string {
	return VALIDATION_MESSAGE_UNKNOWN_KEYS.replace(TEMPLATE_PATTERN, renderKeys(keys));
}

// #endregion

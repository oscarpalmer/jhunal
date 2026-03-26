import {isPlainObject} from '@oscarpalmer/atoms/is';
import {
	COMMA,
	CONJUNCTION_AND,
	CONJUNCTION_AND_COMMA,
	CONJUNCTION_OR,
	CONJUNCTION_OR_COMMA,
	NAME_SCHEMATIC,
	TEMPLATE_PATTERN,
	TYPE_ARRAY,
	TYPE_NULL,
	TYPE_OBJECT,
	TYPE_UNDEFINED,
	VALIDATION_MESSAGE_INVALID_INPUT,
	VALIDATION_MESSAGE_INVALID_REQUIRED,
	VALIDATION_MESSAGE_INVALID_TYPE,
	VALIDATION_MESSAGE_INVALID_VALUE,
	VALIDATION_MESSAGE_INVALID_VALUE_SUFFIX,
	VALIDATION_MESSAGE_UNKNOWN_KEYS,
} from '../constants';
import type {ValueName} from '../models/misc.model';
import type {ValidatorType} from '../models/validation.model';
import {isSchematic} from './misc.helper';

export function getInvalidInputMessage(actual: unknown): string {
	return VALIDATION_MESSAGE_INVALID_INPUT.replace(TEMPLATE_PATTERN, getValueType(actual));
}

export function getInvalidMissingMessage(key: string, types: ValidatorType[]): string {
	let message = VALIDATION_MESSAGE_INVALID_REQUIRED.replace(TEMPLATE_PATTERN, renderTypes(types));

	message = message.replace(TEMPLATE_PATTERN, key);

	return message;
}

export function getInvalidTypeMessage(
	key: string,
	types: ValidatorType[],
	actual: unknown,
): string {
	let message = VALIDATION_MESSAGE_INVALID_TYPE.replace(TEMPLATE_PATTERN, renderTypes(types));

	message = message.replace(TEMPLATE_PATTERN, key);
	message = message.replace(TEMPLATE_PATTERN, getValueType(actual));

	return message;
}

export function getInvalidValidatorMessage(
	key: string,
	type: ValueName,
	index: number,
	length: number,
): string {
	let message = VALIDATION_MESSAGE_INVALID_VALUE.replace(TEMPLATE_PATTERN, key);

	message = message.replace(TEMPLATE_PATTERN, type);

	if (length > 1) {
		message += VALIDATION_MESSAGE_INVALID_VALUE_SUFFIX.replace(TEMPLATE_PATTERN, String(index));
	}

	return message;
}

function getPropertyType(original: ValidatorType): string {
	if (typeof original === 'function') {
		return 'a validated value';
	}

	if (Array.isArray(original)) {
		return `'array'`;
	}

	if (isPlainObject(original)) {
		return `'${TYPE_OBJECT}'`;
	}

	if (isSchematic(original)) {
		return `a ${NAME_SCHEMATIC}`;
	}

	return `'${String(original)}'`;
}

export function getUnknownKeysMessage(keys: string[]): string {
	return VALIDATION_MESSAGE_UNKNOWN_KEYS.replace(TEMPLATE_PATTERN, renderKeys(keys));
}

function getValueType(value: unknown): string {
	const valueType = typeof value;

	switch (true) {
		case value === null:
			return `'${TYPE_NULL}'`;

		case value === undefined:
			return `'${TYPE_UNDEFINED}'`;

		case valueType !== TYPE_OBJECT:
			return `'${valueType}'`;

		case Array.isArray(value):
			return `'${TYPE_ARRAY}'`;

		case isPlainObject(value):
			return `'${TYPE_OBJECT}'`;

		case isSchematic(value):
			return `a ${NAME_SCHEMATIC}`;

		default:
			return value.constructor.name;
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

function renderTypes(types: ValidatorType[]): string {
	const unique = new Set<string>();
	const parts: string[] = [];

	for (let index = 0; index < types.length; index += 1) {
		const rendered = getPropertyType(types[index]);

		if (unique.has(rendered)) {
			continue;
		}

		unique.add(rendered);
		parts.push(rendered);
	}

	return renderParts(parts, CONJUNCTION_OR, CONJUNCTION_OR_COMMA);
}

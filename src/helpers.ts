import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Constructor} from '@oscarpalmer/atoms/models';
import {
	MESSAGE_CONSTRUCTOR,
	NAME_SCHEMATIC,
	PROPERTY_SCHEMATIC,
	REPORTING_ALL,
	REPORTING_FIRST,
	REPORTING_NONE,
	REPORTING_THROW,
	REPORTING_TYPES,
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
} from './constants';
import type {ValueName} from './models/misc.model';
import type {
	ReportingInformation,
	ReportingType,
	ValidatedProperty,
	ValidatedPropertyType,
} from './models/validation.model';
import type {Schematic} from './schematic';

export function getInvalidInputMessage(actual: unknown): string {
	return VALIDATION_MESSAGE_INVALID_INPUT.replace(TEMPLATE_PATTERN, getValueType(actual));
}

export function getInvalidMissingMessage(property: ValidatedProperty): string {
	let message = VALIDATION_MESSAGE_INVALID_REQUIRED.replace(
		TEMPLATE_PATTERN,
		renderTypes(property.types),
	);

	message = message.replace(TEMPLATE_PATTERN, property.key.full);

	return message;
}

export function getInvalidTypeMessage(property: ValidatedProperty, actual: unknown): string {
	let message = VALIDATION_MESSAGE_INVALID_TYPE.replace(
		TEMPLATE_PATTERN,
		renderTypes(property.types),
	);

	message = message.replace(TEMPLATE_PATTERN, property.key.full);
	message = message.replace(TEMPLATE_PATTERN, getValueType(actual));

	return message;
}

export function getInvalidValidatorMessage(
	property: ValidatedProperty,
	type: ValueName,
	index: number,
	length: number,
): string {
	let message = VALIDATION_MESSAGE_INVALID_VALUE.replace(TEMPLATE_PATTERN, property.key.full);

	message = message.replace(TEMPLATE_PATTERN, type);

	if (length > 1) {
		message += VALIDATION_MESSAGE_INVALID_VALUE_SUFFIX.replace(TEMPLATE_PATTERN, String(index));
	}

	return message;
}

function getPropertyType(original: ValidatedPropertyType): string {
	if (typeof original === 'function') {
		return 'a validated value';
	}

	if (Array.isArray(original)) {
		return `'${TYPE_OBJECT}'`;
	}

	if (isSchematic(original)) {
		return `a ${NAME_SCHEMATIC}`;
	}

	return `'${String(original)}'`;
}

export function getReporting(value: unknown): ReportingInformation {
	const type = REPORTING_TYPES.has(value as ReportingType)
		? (value as ReportingType)
		: REPORTING_NONE;

	return {
		[REPORTING_ALL]: type === REPORTING_ALL,
		[REPORTING_FIRST]: type === REPORTING_FIRST,
		[REPORTING_NONE]: type === REPORTING_NONE,
		[REPORTING_THROW]: type === REPORTING_THROW,
	} as ReportingInformation;
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

/**
 * Creates a validator function for a given constructor
 * @param constructor - Constructor to check against
 * @throws Will throw a `TypeError` if the provided argument is not a valid constructor
 * @returns Validator function that checks if a value is an instance of the constructor
 */
export function instanceOf<Instance>(
	constructor: Constructor<Instance>,
): (value: unknown) => value is Instance {
	if (!isConstructor(constructor)) {
		throw new TypeError(MESSAGE_CONSTRUCTOR);
	}

	return (value: unknown): value is Instance => {
		return value instanceof constructor;
	};
}

/**
 * Is the value a schematic?
 * @param value Value to check
 * @returns `true` if the value is a schematic, `false` otherwise
 */
export function isSchematic(value: unknown): value is Schematic<never> {
	return (
		typeof value === 'object' &&
		value !== null &&
		PROPERTY_SCHEMATIC in value &&
		value[PROPERTY_SCHEMATIC] === true
	);
}

function renderTypes(types: ValidatedPropertyType[]): string {
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

	const {length} = parts;

	let rendered = '';

	for (let index = 0; index < length; index += 1) {
		rendered += parts[index];

		if (index < length - 2) {
			rendered += ', ';
		} else if (index === length - 2) {
			rendered += parts.length > 2 ? ', or ' : ' or ';
		}
	}

	return rendered;
}

import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Constructor, PlainObject} from '@oscarpalmer/atoms/models';
import {
	MESSAGE_CONSTRUCTOR,
	PROPERTY_SCHEMATIC,
	REPORTING_ALL,
	REPORTING_FIRST,
	REPORTING_NONE,
	REPORTING_THROW,
	REPORTING_TYPES,
	TYPE_OBJECT,
} from '../constants';
import type {
	ReportingInformation,
	ReportingType,
	ValidatorParameters,
} from '../models/validation.model';
import type {Schematic} from '../schematic';

export function getParameters(input?: unknown): ValidatorParameters {
	if (typeof input === 'boolean') {
		return {
			clone: true,
			output: {},
			reporting: getReporting(REPORTING_NONE),
			strict: input,
		};
	}

	if (REPORTING_TYPES.has(input as ReportingType)) {
		return {
			clone: true,
			output: {},
			reporting: getReporting(input as ReportingType),
			strict: false,
		};
	}

	const options = isPlainObject(input) ? input : {};

	return {
		clone: typeof options.clone === 'boolean' ? options.clone : true,
		output: {},
		reporting: getReporting(options.errors),
		strict: typeof options.strict === 'boolean' ? options.strict : false,
	};
}

export function getReporting(value: unknown): ReportingInformation {
	const type = REPORTING_TYPES.has(value as ReportingType)
		? (value as ReportingType)
		: REPORTING_NONE;

	return {
		type,
		[REPORTING_ALL]: type === REPORTING_ALL,
		[REPORTING_FIRST]: type === REPORTING_FIRST,
		[REPORTING_NONE]: type === REPORTING_NONE,
		[REPORTING_THROW]: type === REPORTING_THROW,
	} as ReportingInformation;
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
		typeof value === TYPE_OBJECT &&
		value !== null &&
		PROPERTY_SCHEMATIC in (value as PlainObject) &&
		(value as PlainObject)[PROPERTY_SCHEMATIC] === true
	);
}

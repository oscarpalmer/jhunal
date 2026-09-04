import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Constructor} from '@oscarpalmer/atoms/models';
import {initializeCloner} from '@oscarpalmer/atoms/value/clone';
import {
	MESSAGE_CONSTRUCTOR,
	PROPERTY_SCHEMA,
	PROPERTY_VALIDATOR,
	REPORTING_ALL,
	REPORTING_FIRST,
	REPORTING_NONE,
	REPORTING_RESULT,
	REPORTING_THROW,
	REPORTING_TYPES,
	UNKNOWN_KEYS_ALLOW,
	UNKNOWN_KEYS_REJECT,
	UNKNOWN_KEYS_REMOVE,
	UNKNOWN_KEYS_TYPES,
} from '../constants';
import type {UnknownKeysStrategy} from '../models/misc.model';
import type {ReportData, ReportingInformation, ReportingType} from '../models/report.model';
import type {Schema} from '../models/schema.model';
import type {
	PropertyValidation,
	ValidationHandlerParameters,
	ValidationHandlerParametersKeys,
} from '../models/validation.model';
import type {Validator} from '../models/validator.model';

// #region Functions

export function generateValidationInformation(reports: ReportData[]): PropertyValidation[] {
	const {length} = reports;

	const validation: PropertyValidation[] = [];

	for (let index = 0; index < length; index += 1) {
		const {key, message, validator, value} = reports[index];

		validation.push({
			key,
			validator,
			value,
			message: message.callback(...message.parameters),
		});
	}

	return validation;
}

function getKeys(input?: unknown): ValidationHandlerParametersKeys {
	const type = UNKNOWN_KEYS_TYPES.has(input as UnknownKeysStrategy)
		? (input as UnknownKeysStrategy)
		: UNKNOWN_KEYS_REMOVE;

	return {
		allow: type === UNKNOWN_KEYS_ALLOW,
		reject: type === UNKNOWN_KEYS_REJECT,
		remove: type === UNKNOWN_KEYS_REMOVE,
		value: type,
	};
}

export function getParameters(input?: unknown): ValidationHandlerParameters {
	if (REPORTING_TYPES.has(input as ReportingType)) {
		return {
			clone: true,
			keys: getKeys(),
			output: {},
			reporting: getReporting(input as ReportingType),
		};
	}

	const options = isPlainObject(input) ? input : {};

	return {
		clone: typeof options.clone === 'boolean' ? options.clone : true,
		keys: getKeys(options.keys),
		output: {},
		reporting: getReporting(options.errors),
	};
}

export function getReporting(value?: unknown): ReportingInformation {
	const type = REPORTING_TYPES.has(value as ReportingType)
		? (value as ReportingType)
		: REPORTING_NONE;

	return {
		type,
		all: type === REPORTING_ALL,
		first: type === REPORTING_FIRST || type === REPORTING_RESULT,
		none: type === REPORTING_NONE,
		throw: type === REPORTING_THROW,
	} as ReportingInformation;
}

/**
 * Creates a validator function for a given constructor
 *
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
 * Is the value a schema?
 *
 * @param value Value to check
 * @returns `true` if the value is a schema, `false` otherwise
 */
export function isSchema(value: unknown): value is Schema<unknown> {
	return isPlainObject(value) && value[PROPERTY_SCHEMA] === true;
}

/**
 * Is the value a validator?
 *
 * @param value Value to check
 * @returns `true` if the value is a validator, `false` otherwise
 */
export function isValidator(value: unknown): value is Validator<unknown> {
	return isPlainObject(value) && value[PROPERTY_VALIDATOR] === true;
}

// #endregion

// #region Variables

export const cloner = initializeCloner({
	copyFunctions: true,
	copySymbols: true,
});

// #endregion

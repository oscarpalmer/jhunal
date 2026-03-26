import {join, type PlainObject} from '@oscarpalmer/atoms';
import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import {clone} from '@oscarpalmer/atoms/value/clone';
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
	TYPE_OBJECT,
	TYPE_UNDEFINED,
} from './constants';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getInvalidValidatorMessage,
	getUnknownKeysMessage,
	instanceOf,
	isSchematic,
} from './helpers';
import type {ValueName} from './models/misc.model';
import {
	SchematicError,
	ValidationError,
	type NamedValidatorHandlers,
	type NamedValidators,
	type ValidationInformation,
	type ValidationInformationKey,
	type Validator,
	type ValidatorType,
} from './models/validation.model';
import {schematicValidator, type Schematic} from './schematic';

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

function getFunctionValidator(fn: Function): Validator {
	const validator = isConstructor(fn) ? instanceOf(fn) : fn;

	return input => validator(input) === true;
}

function getNamedValidator(
	key: ValidationInformationKey,
	name: ValueName,
	handlers: NamedValidatorHandlers,
): Validator {
	const validator = namedValidators[name];

	const named = handlers[name] ?? [];
	const {length} = named;

	return (input, parameters) => {
		if (!validator(input)) {
			return false;
		}

		for (let index = 0; index < length; index += 1) {
			const handler = named[index];

			if (handler(input) === true) {
				continue;
			}

			const information: ValidationInformation = {
				key,
				validator,
				message: getInvalidValidatorMessage(key.full, name, index, length),
				value: input,
			};

			parameters.information?.push(information);

			return parameters.reporting.none ? false : [information];
		}

		return true;
	};
}

function getNamedHandlers(original: unknown, prefix: string): NamedValidatorHandlers {
	const handlers: NamedValidatorHandlers = {};

	if (original == null) {
		return handlers;
	}

	if (!isPlainObject(original)) {
		throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!TYPE_ALL.has(key as never)) {
			throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = (original as PlainObject)[key];

		handlers[key as ValueName] = (Array.isArray(value) ? value : [value]).map(item => {
			if (typeof item !== 'function') {
				throw new TypeError(
					SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key).replace(
						TEMPLATE_PATTERN,
						prefix,
					),
				);
			}

			return item;
		});
	}

	return handlers;
}

export function getObjectValidator(
	original: PlainObject,
	origin?: ValidationInformationKey,
	fromType?: boolean,
): Validator {
	const keys = Object.keys(original);
	const keysLength = keys.length;

	if (keysLength === 0) {
		throw new SchematicError(SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY);
	}

	if (fromType ?? false) {
		const property = getDisallowedProperty(original);

		if (property != null) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
					TEMPLATE_PATTERN,
					origin!.full,
				).replace(TEMPLATE_PATTERN, property),
			);
		}
	}

	const set = new Set<string>();

	const items: {
		key: ValidationInformationKey;
		required: boolean;
		types: ValidatorType[];
		validator: Validator;
	}[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];
		const value = original[key];

		if (value == null) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE.replace(
					TEMPLATE_PATTERN,
					join([origin?.full, key], '.'),
				),
			);
		}

		const prefixedKey = origin == null ? key : join([origin.full, key], '.');

		const fullKey: ValidationInformationKey = {
			full: prefixedKey,
			short: key,
		};

		let handlers: NamedValidatorHandlers = {};
		let required = true;
		let typed = false;
		let types: ValidatorType[];

		const validators: Validator[] = [];

		if (isPlainObject(value)) {
			typed = PROPERTY_TYPE in value;

			const type = typed ? value[PROPERTY_TYPE] : value;

			handlers = getNamedHandlers(value[PROPERTY_VALIDATORS], prefixedKey);
			required = getRequired(key, value) ?? required;

			types = Array.isArray(type) ? type : [type];
		} else {
			types = Array.isArray(value) ? value : [value];
		}

		if (types.length === 0) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(
					TEMPLATE_PATTERN,
					prefixedKey,
				).replace(TEMPLATE_PATTERN, String(value)),
			);
		}

		const typesLength = types.length;

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			let validator: Validator;

			switch (true) {
				case typeof type === 'function':
					validator = getFunctionValidator(type);
					break;

				case isPlainObject(type):
					validator = getObjectValidator(type, fullKey, typed);
					break;

				case isSchematic(type):
					validator = getSchematicValidator(type);
					break;

				case TYPE_ALL.has(type as ValueName):
					validator = getNamedValidator(fullKey, type as ValueName, handlers);
					break;

				default:
					throw new SchematicError(
						SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(
							TEMPLATE_PATTERN,
							prefixedKey,
						).replace(TEMPLATE_PATTERN, String(type)),
					);
			}

			validators.push(validator);
		}

		set.add(key);

		items.push({
			types,
			key: fullKey,
			required: required && !types.includes(TYPE_UNDEFINED),
			validator: getValidator(validators),
		});
	}

	const validatorsLength = items.length;

	return (input, parameters, get) => {
		if (!isPlainObject(input)) {
			if (origin != null) {
				return false;
			}

			const information: ValidationInformation = {
				key: {
					full: '',
					short: '',
				},
				value: input,
				message: getInvalidInputMessage(input),
			};

			if (parameters.reporting.throw) {
				throw new ValidationError([information]);
			}

			parameters.information?.push(information);

			return parameters.reporting.none ? false : [information];
		}

		if (parameters.strict) {
			const inputKeys = Object.keys(input);
			const unknownKeys = inputKeys.filter(key => !set.has(key));

			if (unknownKeys.length > 0) {
				const information: ValidationInformation = {
					key: origin ?? {
						full: '',
						short: '',
					},
					message: getUnknownKeysMessage(unknownKeys),
					value: input,
				};

				if (parameters.reporting.throw) {
					throw new ValidationError([information]);
				}

				parameters.information?.push(information);

				return parameters.reporting.none ? false : [information];
			}
		}

		const allInformation: ValidationInformation[] = [];
		const output: PlainObject = {};

		for (let validatorIndex = 0; validatorIndex < validatorsLength; validatorIndex += 1) {
			const {key, required, types, validator} = items[validatorIndex];

			const value = (input as PlainObject)[key.short];

			if (value === undefined) {
				if (required) {
					if (parameters.reporting.none) {
						return false;
					}

					const information: ValidationInformation = {
						key,
						value,
						message: getInvalidMissingMessage(key.full, types),
					};

					if (parameters.reporting.throw) {
						throw new ValidationError([information]);
					}

					parameters.information?.push(information);

					if (parameters.reporting.all) {
						allInformation.push(information);

						continue;
					}

					return [information];
				}

				continue;
			}

			const previousOutput = parameters.output;

			parameters.output = output;

			const result = validator(value, parameters, get);

			parameters.output = previousOutput;

			if (result === false) {
				continue;
			}

			if (result === true) {
				if (get) {
					output[key.short] = clone(value);
				}

				continue;
			}

			if (parameters.reporting.none) {
				return false;
			}

			const information: ValidationInformation[] =
				typeof result !== 'boolean' && result.length > 0
					? result
					: [
							{
								key,
								value,
								message: getInvalidTypeMessage(key.full, types, value),
							},
						];

			if (parameters.reporting.throw) {
				throw new ValidationError(information);
			}

			if (parameters.reporting.all) {
				allInformation.push(...information);

				continue;
			}

			return information;
		}

		if (get) {
			if (origin == null) {
				parameters.output = output;
			} else {
				parameters.output[origin.short] = output;
			}
		}

		return parameters.reporting.none || allInformation.length === 0 ? true : allInformation;
	};
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

function getSchematicValidator(schematic: Schematic<unknown>): Validator {
	const validator = schematicValidator.get(schematic)!;

	return (input, parameters, get) => {
		let result: ReturnType<Validator> = false;

		if (isPlainObject(input)) {
			result = validator(input, parameters, get);
		}

		if (typeof result === 'boolean') {
			return result;
		}

		parameters.information?.push(...result);

		return result.length === 0 ? true : result;
	};
}

function getValidator(validators: Validator[]): Validator {
	const {length} = validators;

	return (input, parameters, get) => {
		const allInformation: ValidationInformation[] = [];

		for (let index = 0; index < length; index += 1) {
			const previousInformation = parameters.information;

			const nextInformation: ValidationInformation[] = [];

			parameters.information = nextInformation;

			const result = validators[index](input, parameters, get);

			parameters.information = previousInformation;

			if (result === false) {
				continue;
			}

			if (result === true) {
				return true;
			}

			parameters.information?.push(...result);

			allInformation.push(...result);
		}

		return allInformation;
	};
}

const namedValidators: NamedValidators = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	object: value => typeof value === TYPE_OBJECT && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};

import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
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
	TEMPLATE_PATTERN,
	TYPE_ALL,
	TYPE_UNDEFINED,
} from '../constants';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getUnknownKeysMessage,
} from '../helpers/message.helper';
import {isSchematic} from '../helpers/misc.helper';
import type {ValueName} from '../models/misc.model';
import {
	type NamedValidatorHandlers,
	SchematicError,
	ValidationError,
	type ValidationInformation,
	type ValidationInformationKey,
	type Validator,
	type ValidatorType,
} from '../models/validation.model';
import {getBaseValidator} from './base.validator';
import {getFunctionValidator} from './function.validator';
import {getNamedHandlers} from './named.handler';
import {getNamedValidator} from './named.validator';
import {getSchematicValidator} from './schematic.validator';

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
			validator: getBaseValidator(validators),
		});
	}

	const validatorsLength = items.length;

	return (input, parameters, get) => {
		if (!isPlainObject(input)) {
			if (origin != null) {
				return [];
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

			return [information];
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

				return [information];
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
						return [];
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

			if (result === true) {
				if (get && !isPlainObject(value)) {
					output[key.short] = parameters.clone ? clone(value) : value;
				}

				continue;
			}

			if (parameters.reporting.none) {
				return [];
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

		return allInformation.length === 0 ? true : allInformation;
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

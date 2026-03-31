import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {clone} from '@oscarpalmer/atoms/value/clone';
import {
	PROPERTY_DEFAULT,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY,
	TYPE_ALL,
	TYPE_UNDEFINED,
} from '../constants';
import {
	getDefaultRequiredMessage,
	getDefaultTypeMessage,
	getDisallowedMessage,
	getInputPropertyMissingMessage,
	getInputPropertyTypeMessage,
	getInputTypeMessage,
	getRequiredMessage,
	getSchematicPropertyNullableMessage,
	getSchematicPropertyTypeMessage,
	getUnknownKeysMessage,
} from '../helpers/message.helper';
import {getParameters, isSchema} from '../helpers/misc.helper';
import type {ValueName} from '../models/misc.model';
import {
	type NamedValidatorHandlers,
	SchematicError,
	ValidationError,
	type ValidationInformation,
	type ValidationInformationKey,
	type Validator,
	type ValidatorDefaults,
	type ValidatorItem,
	type ValidatorType,
} from '../models/validation.model';
import {getBaseValidator} from './base.validator';
import {getFunctionValidator} from './function.validator';
import {getNamedHandlers} from './named.handler';
import {getNamedValidator} from './named.validator';
import {getSchemaValidator} from './schematic.validator';

function getDefaults(
	obj: PlainObject,
	key: string,
	allowed: boolean,
): ValidatorDefaults | undefined {
	if (!(PROPERTY_DEFAULT in obj)) {
		return;
	}

	if (!allowed) {
		throw new SchematicError(getDisallowedMessage(key, PROPERTY_DEFAULT));
	}

	return {
		value: obj[PROPERTY_DEFAULT],
	};
}

function getDisallowedProperty(obj: PlainObject): string | undefined {
	if (PROPERTY_DEFAULT in obj) {
		return PROPERTY_DEFAULT;
	}

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
			throw new SchematicError(getDisallowedMessage(origin!.full, property));
		}
	}

	const set = new Set<string>();

	const items: ValidatorItem[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];
		const value = original[key];

		if (value == null) {
			throw new SchematicError(getSchematicPropertyNullableMessage(join([origin?.full, key], '.')));
		}

		const prefixedKey = origin == null ? key : join([origin.full, key], '.');

		const fullKey: ValidationInformationKey = {
			full: prefixedKey,
			short: key,
		};

		let handlers: NamedValidatorHandlers = {};
		let required = true;
		let typed = false;

		let defaults: ValidatorDefaults | undefined;

		let types: ValidatorType[];

		const validators: Validator[] = [];

		if (isPlainObject(value)) {
			typed = PROPERTY_TYPE in value;

			const type = typed ? value[PROPERTY_TYPE] : value;

			defaults = getDefaults(value, prefixedKey, typed);
			handlers = getNamedHandlers(value[PROPERTY_VALIDATORS], prefixedKey, typed);
			required = getRequired(value, prefixedKey, typed) ?? required;

			types = Array.isArray(type) ? type : [type];
		} else {
			types = Array.isArray(value) ? value : [value];
		}

		if (types.length === 0) {
			throw new SchematicError(getSchematicPropertyTypeMessage(prefixedKey));
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

				case isSchema(type):
					validator = getSchemaValidator(type);
					break;

				case TYPE_ALL.has(type as ValueName):
					validator = getNamedValidator(fullKey, type as ValueName, handlers);
					break;

				default:
					throw new SchematicError(getSchematicPropertyTypeMessage(prefixedKey));
			}

			validators.push(validator);
		}

		required = required && !types.includes(TYPE_UNDEFINED);

		if (defaults != null && !required) {
			throw new SchematicError(getDefaultRequiredMessage(prefixedKey));
		}

		const validator = getBaseValidator(validators);

		if (defaults != null && Array.isArray(validator(defaults.value, getParameters(), false))) {
			throw new SchematicError(getDefaultTypeMessage(prefixedKey, types));
		}

		items.push({
			defaults,
			required,
			types,
			validator,
			key: fullKey,
		});

		set.add(key);
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
				message: getInputTypeMessage(input),
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
			const {defaults, key, required, types, validator} = items[validatorIndex];

			const value = (input as PlainObject)[key.short];

			if (value === undefined) {
				if (required) {
					if (get && defaults != null) {
						output[key.short] = clone(defaults.value);

						continue;
					}

					if (parameters.reporting.none) {
						return [];
					}

					const information: ValidationInformation = {
						key,
						value,
						message: getInputPropertyMissingMessage(key.full, types),
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
								message: getInputPropertyTypeMessage(key.full, types, value),
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

function getRequired(obj: PlainObject, key: string, allowed: boolean): boolean | undefined {
	if (!(PROPERTY_REQUIRED in obj)) {
		return;
	}

	if (!allowed) {
		throw new SchematicError(getDisallowedMessage(key, PROPERTY_REQUIRED));
	}

	if (typeof obj[PROPERTY_REQUIRED] !== 'boolean') {
		throw new SchematicError(getRequiredMessage(key));
	}

	return obj[PROPERTY_REQUIRED];
}

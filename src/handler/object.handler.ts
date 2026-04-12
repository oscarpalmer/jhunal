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
	TYPES_ALL,
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
import type {ValueType} from '../models/misc.model';
import {
	type TypedHandlers,
	SchematicError,
	ValidationError,
	type ValidationInformation,
	type ValidationInformationKey,
	type ValidationHandler,
	type ValidationHandlerDefaults,
	type ValidationHandlerItem,
	type ValidationHandlerParameters,
	type ValidationHandlerType,
} from '../models/validation.model';
import {getBaseHandler} from './base.handler';
import {getFunctionHandler} from './function.handler';
import {getTypeHandler, getTypeHandlers} from './type.handler';
import {getSchemaValidator} from './schema.handler';

type ReportParameters<Callback extends (...args: any[]) => string> = {
	extract?: boolean;
	information?: ReportParametersInformation;
	key?: ValidationInformationKey;
	message: ReportParametersMessage<Callback>;
	original: ValidationHandlerParameters;
	value: unknown;
};

type ReportParametersMessage<Callback extends (...args: any[]) => string> = {
	arguments: Parameters<Callback>;
	callback: Callback;
};

type ReportParametersInformation = {
	all: ValidationInformation[];
	existing?: ValidationInformation[];
};

function getDefaults(
	obj: PlainObject,
	key: string,
	allowed: boolean,
): ValidationHandlerDefaults | undefined {
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
): ValidationHandler {
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

	const items: ValidationHandlerItem[] = [];

	for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
		const key = keys[keyIndex];
		const value = original[key];

		const prefixedKey = origin == null ? key : join([origin.full, key], '.');

		if (value == null) {
			throw new SchematicError(getSchematicPropertyNullableMessage(prefixedKey));
		}

		const fullKey: ValidationInformationKey = {
			full: prefixedKey,
			short: key,
		};

		let handlers: TypedHandlers = {};
		let required = true;
		let typed = false;

		let defaults: ValidationHandlerDefaults | undefined;

		let types: ValidationHandlerType[];

		const validators: ValidationHandler[] = [];

		if (isPlainObject(value)) {
			typed = PROPERTY_TYPE in value;

			const type = typed ? value[PROPERTY_TYPE] : value;

			defaults = getDefaults(value, prefixedKey, typed);
			handlers = getTypeHandlers(value[PROPERTY_VALIDATORS], prefixedKey, typed);
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

			let validator: ValidationHandler;

			switch (true) {
				case typeof type === 'function':
					validator = getFunctionHandler(type);
					break;

				case isPlainObject(type):
					validator = getObjectValidator(type, fullKey, typed);
					break;

				case isSchema(type):
					validator = getSchemaValidator(type);
					break;

				case TYPES_ALL.has(type as ValueType):
					validator = getTypeHandler(type as ValueType, handlers, fullKey);
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

		const validator = getBaseHandler(validators);

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
			return origin == null
				? report(
						{
							message: {
								arguments: [input],
								callback: getInputTypeMessage,
							},
							original: parameters,
							value: input,
						},
						true,
					)
				: [];
		}

		if (parameters.strict) {
			const inputKeys = Object.keys(input);
			const unknownKeys = inputKeys.filter(key => !set.has(key));

			if (unknownKeys.length > 0) {
				const information: ValidationInformation = {
					key: origin,
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

		const getAndClone = get && parameters.clone;

		const allInformation: ValidationInformation[] = [];
		const output: PlainObject = {};

		for (let validatorIndex = 0; validatorIndex < validatorsLength; validatorIndex += 1) {
			const {defaults, key, required, types, validator} = items[validatorIndex];

			const value = (input as PlainObject)[key.short];

			if (value === undefined) {
				if (required) {
					if (get && defaults != null) {
						const defaultValue = clone(defaults.value);

						if (parameters.clone) {
							output[key.short] = defaultValue;
						} else {
							input[key.short] = defaultValue;
						}

						continue;
					}

					if (parameters.reporting.none) {
						return [];
					}

					const reported = report({
						key,
						value,
						information: {
							all: allInformation,
						},
						message: {
							arguments: [key.full, types],
							callback: getInputPropertyMissingMessage,
						},
						original: parameters,
					});

					if (reported == null) {
						continue;
					}

					return reported;
				}

				continue;
			}

			const previousOutput = parameters.output;

			parameters.output = output;

			const result = validator(value, parameters, get);

			parameters.output = previousOutput;

			if (result === true) {
				if (getAndClone && !isPlainObject(value)) {
					output[key.short] = clone(value);
				}

				continue;
			}

			if (parameters.reporting.none) {
				return [];
			}

			const reported = report({
				key,
				value,
				extract: false,
				information: {
					all: allInformation,
					existing: typeof result !== 'boolean' && result.length > 0 ? result : undefined,
				},
				message: {
					arguments: [key.full, types, value],
					callback: getInputPropertyTypeMessage,
				},
				original: parameters,
			});

			if (reported == null) {
				continue;
			}

			return reported;
		}

		if (getAndClone) {
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

function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports: true,
): ValidationInformation[];

function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
): ValidationInformation[] | undefined;

function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports?: boolean,
): ValidationInformation[] | undefined {
	const {information, message, original} = parameters;

	const reported: ValidationInformation[] = information?.existing ?? [
		{
			key: parameters.key,
			value: parameters.value,
			message: message.callback(...message.arguments),
		},
	];

	if (original.reporting.throw) {
		throw new ValidationError(reported);
	}

	information?.all.push(...reported);

	if (parameters.extract ?? true) {
		original.information?.push(...reported);
	}

	if ((getReports ?? false) || !original.reporting.all) {
		return reported;
	}
}

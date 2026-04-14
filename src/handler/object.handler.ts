import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {clone} from '@oscarpalmer/atoms/value/clone';
import {
	PROPERTY_DEFAULT,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY,
} from '../constants';
import {
	getDisallowedMessage,
	getInputPropertyMissingMessage,
	getInputPropertyTypeMessage,
	getInputTypeMessage,
	getUnknownKeysMessage,
} from '../helpers/message.helper';
import {report} from '../helpers/report.helper';
import {
	SchematicError,
	ValidationError,
	type PropertyValidation,
	type PropertyValidationKey,
	type ValidationHandler,
	type ValidationHandlerItem,
} from '../models/validation.model';
import {getValueHandler} from './value.handler';

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

export function getObjectHandler(
	original: PlainObject,
	origin?: PropertyValidationKey,
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

		const {
			defaults,
			handler,
			key: fullKey,
			required,
			types,
		} = getValueHandler(
			{
				value: original[key],
			},
			{
				key,
				origin,
			},
		);

		items.push({
			defaults,
			handler,
			required,
			types,
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
				const information: PropertyValidation = {
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

		const allInformation: PropertyValidation[] = [];
		const output: PlainObject = {};

		for (let validatorIndex = 0; validatorIndex < validatorsLength; validatorIndex += 1) {
			const {defaults, handler, key, required, types} = items[validatorIndex];

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

			parameters.key = key.full;
			parameters.output = output;

			const result = handler(value, parameters, get);

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

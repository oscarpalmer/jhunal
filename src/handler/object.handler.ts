import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {clone} from '@oscarpalmer/atoms/value/clone';
import {
	CLONE_OPTIONS,
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
import {generateValidationInformation} from '../helpers/misc.helper';
import {report} from '../helpers/report.helper';
import type {ReportData} from '../models/report.model';
import {
	SchematicError,
	ValidationError,
	type PropertyValidationKey,
	type ValidationHandler,
	type ValidationHandlerItem,
} from '../models/validation.model';
import {getValueHandler} from './value.handler';

// #region Functions

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

	return PROPERTY_VALIDATORS in obj ? PROPERTY_VALIDATORS : undefined;
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

	return (input, parameters, getValue) => {
		if (!isPlainObject(input)) {
			if (parameters.reporting.none || origin != null) {
				return [];
			}

			return report(
				{
					message: {
						callback: getInputTypeMessage,
						parameters: [input],
					},
					original: parameters,
					value: input,
				},
				true,
			);
		}

		if (parameters.strict) {
			const inputKeys = Object.keys(input);
			const inputKeysLength = inputKeys.length;

			let unknownKeys: string[] | undefined;

			for (let inputKeyIndex = 0; inputKeyIndex < inputKeysLength; inputKeyIndex += 1) {
				const inputKey = inputKeys[inputKeyIndex];

				if (!set.has(inputKey)) {
					unknownKeys ??= [];

					unknownKeys.push(inputKey);
				}
			}

			if (unknownKeys != null) {
				const report: ReportData = {
					key: origin,
					message: {
						callback: getUnknownKeysMessage,
						parameters: [unknownKeys],
					},
					value: input,
				};

				if (parameters.reporting.throw) {
					throw new ValidationError(generateValidationInformation([report]));
				}

				parameters.reports?.push(report);

				return [report];
			}
		}

		const allReports: ReportData[] = [];

		for (let validatorIndex = 0; validatorIndex < validatorsLength; validatorIndex += 1) {
			const {defaults, handler, key, required, types} = items[validatorIndex];

			const value = (input as PlainObject)[key.short];

			if (value === undefined) {
				if (required) {
					if (getValue && defaults != null) {
						const defaultValue = clone(defaults.value, CLONE_OPTIONS);

						parameters.defaulted ??= {};
						parameters.defaulted[key.full] = defaultValue;

						continue;
					}

					if (parameters.reporting.none) {
						return [];
					}

					const reported = report({
						key,
						value,
						data: {
							all: allReports,
						},
						message: {
							callback: getInputPropertyMissingMessage,
							parameters: [key.full, types],
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

			parameters.key = key.full;

			const result = handler(value, parameters, getValue);

			if (result === true) {
				continue;
			}

			if (parameters.reporting.none) {
				return [];
			}

			const reported = report({
				key,
				value,
				data: {
					all: allReports,
					existing: typeof result !== 'boolean' && result.length > 0 ? result : undefined,
				},
				extract: false,
				message: {
					callback: getInputPropertyTypeMessage,
					parameters: [key.full, types, value],
				},
				original: parameters,
			});

			if (reported == null) {
				continue;
			}

			return reported;
		}

		return allReports.length === 0 ? true : allReports;
	};
}

// #endregion

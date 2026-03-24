import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {clone} from '@oscarpalmer/atoms/value/clone';
import {TYPE_OBJECT} from '../constants';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getInvalidValidatorMessage,
	getUnknownKeysMessage,
	isSchematic,
} from '../helpers';
import type {ValueName} from '../models/misc.model';
import {
	ValidationError,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidationInformation,
	type ValidationParameters,
} from '../models/validation.model';
import {schematicProperties, type Schematic} from '../schematic';

function validateNamed(name: ValueName, value: unknown, parameters: ValidationParameters): boolean {
	if (!validators[name](value)) {
		return false;
	}

	const propertyValidators = parameters.origin!.validators[name];

	if (propertyValidators == null || propertyValidators.length === 0) {
		return true;
	}

	const {length} = propertyValidators;

	for (let index = 0; index < length; index += 1) {
		const validator = propertyValidators[index];

		if (!validator(value)) {
			parameters.information!.push({
				value,
				key: {
					full: parameters.prefix!,
					short: parameters.origin!.key,
				},
				message: getInvalidValidatorMessage(parameters.prefix!, name, index, length),
				validator: validator as GenericCallback,
			});

			return false;
		}
	}

	return true;
}

export function validateObject(
	obj: unknown,
	properties: ValidatedProperty[],
	parameters: ValidationParameters,
	get: boolean,
): PlainObject | ValidationInformation[] | undefined {
	if (!isPlainObject(obj)) {
		const key =
			parameters?.origin == null
				? {full: '', short: ''}
				: {
						full: parameters.prefix!,
						short: parameters.origin.key,
					};

		const information = {
			key,
			message:
				parameters?.origin == null
					? getInvalidInputMessage(obj)
					: getInvalidTypeMessage(key.full, parameters.origin.types, obj),
			value: obj,
		};

		if (parameters.reporting.throw) {
			throw new ValidationError([information]);
		}

		parameters?.information?.push(information);

		return parameters.reporting.none ? undefined : [information];
	}

	if (parameters.strict) {
		const objKeys = Object.keys(obj);

		const propertiesKeys = new Set(properties.map(property => property.key));

		const unknownKeys = objKeys.filter(key => !propertiesKeys.has(key));

		if (unknownKeys.length > 0) {
			const key =
				parameters?.origin == null
					? {full: '', short: ''}
					: {
							full: join([parameters.prefix, parameters.origin?.key], '.'),
							short: parameters.origin.key,
						};

			const information: ValidationInformation = {
				key,
				message: getUnknownKeysMessage(
					unknownKeys.map(key => join([parameters?.prefix, key], '.')),
				),
				value: obj,
			};

			if (parameters.reporting.throw) {
				throw new ValidationError([information]);
			}

			parameters?.information?.push(information);

			return parameters.reporting.none ? undefined : [information];
		}
	}

	const allInformation: ValidationInformation[] = [];

	const output: PlainObject = {};

	const propertiesLength = properties.length;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		const property = properties[propertyIndex];

		const {key, required, types} = property;

		const value = obj[key];

		if (get && value === undefined && !required) {
			// TODO: during get, respect a default value for the property

			continue;
		}

		if (value === undefined && required) {
			const prefixedKey = join([parameters.prefix, key], '.');

			const information: ValidationInformation = {
				value,
				key: {
					full: prefixedKey,
					short: key,
				},
				message: getInvalidMissingMessage(prefixedKey, property.types),
			};

			if (parameters.reporting.throw) {
				throw new ValidationError([information]);
			}

			parameters?.information?.push(information);

			if (parameters.reporting.all) {
				allInformation.push(information);

				continue;
			}

			return parameters.reporting.none ? undefined : [information];
		}

		const prefixedKey = join([parameters.prefix, key], '.');

		const typesLength = types.length;

		const information: ValidationInformation[] = [];

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			if (
				validateValue(
					type,
					value,
					{
						information,
						output,
						origin: property,
						prefix: prefixedKey,
						reporting: parameters.reporting,
						strict: parameters.strict,
					},
					get,
				)
			) {
				if (get) {
					output[key] = clone(value);
				}

				continue outer;
			}
		}

		if (information.length === 0) {
			information.push({
				value,
				key: {
					full: prefixedKey,
					short: key,
				},
				message: getInvalidTypeMessage(prefixedKey, property.types, value),
			});
		}

		if (parameters.reporting.throw) {
			throw new ValidationError(information);
		}

		parameters?.information?.push(...information);

		if (parameters.reporting.all) {
			allInformation.push(...information);

			continue;
		}

		return parameters.reporting.none ? undefined : information;
	}

	if (get) {
		if (parameters.origin == null) {
			parameters.output = output;
		} else {
			parameters.output[parameters.origin.key] = output;
		}
	}

	return parameters.reporting.none || allInformation.length === 0
		? parameters.output
		: allInformation;
}

function validateSchematic(
	schematic: Schematic<unknown>,
	value: unknown,
	parameters: ValidationParameters,
	get: boolean,
): boolean {
	const properties = schematicProperties.get(schematic)!;

	const result = validateObject(value, properties, parameters, get);

	return result == null || Array.isArray(result) ? false : true;
}

function validateValue(
	type: ValidatedPropertyType,
	value: unknown,
	parameters: ValidationParameters,
	get: boolean,
): boolean {
	switch (true) {
		case typeof type === 'function':
			return (type as GenericCallback)(value);

		case Array.isArray(type): {
			const result = validateObject(value, type, parameters, get);

			return result == null || Array.isArray(result) ? false : true;
		}

		case isSchematic(type):
			return validateSchematic(type, value, parameters, get);

		default:
			return validateNamed(type as ValueName, value, parameters);
	}
}

//

const validators: Record<ValueName, (value: unknown) => boolean> = {
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
